import { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import BillingPage from './components/BillingPage';
import ProfileManager from './components/ProfileManager';
import { secureStore, secureRetrieve, secureRemove } from './utils/crypto';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Instance {
  instanceId: string;
  instanceName: string;
  instanceType: string;
  state: string;
  launchTime: string;
  publicIp: string;
  privateIp: string;
  availabilityZone: string;
  region: string;
  cpuAverage?: number;
  isIdle?: boolean;
  monthlyCost?: number;
}

interface AWSCredentials {
  username: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

type ViewMode = 'login' | 'profiles' | 'dashboard' | 'billing';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [credentials, setCredentials] = useState<AWSCredentials | null>(() => {
    // Use secure encrypted session storage instead of plain localStorage
    return secureRetrieve('currentAwsCredentials');
  });
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInstances = async () => {
    if (!credentials) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/instances`, {
        headers: {
          'X-AWS-Access-Key-Id': credentials.accessKeyId,
          'X-AWS-Secret-Access-Key': credentials.secretAccessKey,
          'X-AWS-Region': credentials.region,
        },
      });
      const instancesData = response.data.instances;

      // Fetch metrics for each instance
      const instancesWithMetrics = await Promise.all(
        instancesData.map(async (instance: Instance) => {
          try {
            if (instance.state === 'running') {
              const metricsResponse = await axios.get(
                `${API_BASE_URL}/metrics/${instance.instanceId}?region=${instance.region}`,
                {
                  headers: {
                    'X-AWS-Access-Key-Id': credentials.accessKeyId,
                    'X-AWS-Secret-Access-Key': credentials.secretAccessKey,
                  },
                }
              );
              return {
                ...instance,
                cpuAverage: parseFloat(metricsResponse.data.averageCpu),
                isIdle: metricsResponse.data.isIdle,
                monthlyCost: calculateMonthlyCost(instance.instanceType),
              };
            }
            return instance;
          } catch (err) {
            console.error(`Error fetching metrics for ${instance.instanceId}:`, err);
            return instance;
          }
        })
      );

      setInstances(instancesWithMetrics);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch instances');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateMonthlyCost = (instanceType: string): number => {
    const costMap: { [key: string]: number } = {
      't2.micro': 8.35,
      't2.small': 16.79,
      't2.medium': 33.58,
      't3.micro': 7.59,
      't3.small': 15.18,
      't3.medium': 30.37,
      'm5.large': 69.35,
      'm5.xlarge': 138.70,
      'c5.large': 61.63,
      'c5.xlarge': 123.26,
    };
    return costMap[instanceType] || 50;
  };

  const handleStopInstance = async (instanceId: string, region: string) => {
    if (!credentials || !confirm(`Are you sure you want to stop instance ${instanceId}?`)) {
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/instances/${instanceId}/stop`,
        { region },
        {
          headers: {
            'X-AWS-Access-Key-Id': credentials.accessKeyId,
            'X-AWS-Secret-Access-Key': credentials.secretAccessKey,
          },
        }
      );
      alert('Instance stop initiated successfully');
      fetchInstances();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to stop instance');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInstances();
  };

  const handleLogin = (creds: AWSCredentials) => {
    setCredentials(creds);
    // Store credentials encrypted in sessionStorage (cleared on browser close)
    secureStore('currentAwsCredentials', creds);
    setViewMode('dashboard');
    setLoading(true);
  };

  const handleLogout = () => {
    setCredentials(null);
    // Remove encrypted credentials from sessionStorage
    secureRemove('currentAwsCredentials');
    setInstances([]);
    setViewMode('login');
  };

  const handleSelectProfile = (profile: any) => {
    const creds = {
      username: profile.username,
      accessKeyId: profile.accessKeyId,
      secretAccessKey: profile.secretAccessKey,
      region: profile.region,
    };
    handleLogin(creds);
  };

  useEffect(() => {
    if (credentials && viewMode === 'dashboard') {
      fetchInstances();

      const interval = setInterval(() => {
        fetchInstances();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [credentials, viewMode]);

  if (viewMode === 'profiles') {
    return (
      <ProfileManager
        onSelectProfile={handleSelectProfile}
        onBack={() => setViewMode('login')}
      />
    );
  }

  if (viewMode === 'billing' && credentials) {
    return (
      <BillingPage
        credentials={credentials}
        onBack={() => setViewMode('dashboard')}
      />
    );
  }

  if (viewMode === 'dashboard' && credentials) {
    return (
      <Dashboard
        instances={instances}
        loading={loading}
        error={error}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onStopInstance={handleStopInstance}
        onLogout={handleLogout}
        region={credentials.region}
        credentials={credentials}
        onShowBilling={() => setViewMode('billing')}
        username={credentials.username}
      />
    );
  }

  return (
    <LoginPage
      onLogin={handleLogin}
      onManageProfiles={() => setViewMode('profiles')}
    />
  );
}

export default App;
