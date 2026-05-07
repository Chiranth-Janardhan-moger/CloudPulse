import { useState } from 'react';
// @ts-ignore
import InstanceCard from './InstanceCard';
// @ts-ignore
import StatsCard from './StatsCard';
// @ts-ignore
import ChartSection from './ChartSection';

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

interface DashboardProps {
  instances: Instance[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  onRefresh: () => void;
  onStopInstance: (instanceId: string, region: string) => void;
  onLogout: () => void;
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  onShowBilling: () => void;
  username: string;
}

const Dashboard = ({
  instances,
  loading,
  error,
  refreshing,
  onRefresh,
  onStopInstance,
  onLogout,
  credentials,
  onShowBilling,
  username,
}: DashboardProps) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<string>('all');
  
  const runningInstances = instances.filter((i) => i.state === 'running');
  const idleInstances = instances.filter((i) => i.isIdle && i.state === 'running');
  const totalWaste = idleInstances.reduce((sum, i) => sum + (i.monthlyCost || 0), 0);
  const idlePercentage = runningInstances.length > 0 
    ? (idleInstances.length / runningInstances.length) * 100 
    : 0;

  const regions = ['all', ...Array.from(new Set(instances.map(i => i.region)))].sort();

  const filteredInstances = instances.filter(instance => {
    const matchesRegion = selectedRegion === 'all' || instance.region === selectedRegion;
    const matchesSearch = instance.instanceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instance.instanceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = filterState === 'all' || instance.state === filterState;
    return matchesRegion && matchesSearch && matchesState;
  });

  const instancesByRegion = filteredInstances.reduce((acc, instance) => {
    if (!acc[instance.region]) {
      acc[instance.region] = [];
    }
    acc[instance.region].push(instance);
    return acc;
  }, {} as Record<string, Instance[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loader-light"></div>
          <p className="text-gray-700 mt-4 text-lg font-medium">Loading instances...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-red-200 rounded-2xl p-8 max-w-md w-full shadow-xl">
          <div className="text-red-600 text-center">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-2 text-gray-900">Connection Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={onRefresh}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold"
              >
                Retry
              </button>
              <button
                onClick={onLogout}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-semibold"
              >
                Change Credentials
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cloud Instance Monitor</h1>
                <p className="text-sm text-gray-500">
                  Welcome, <span className="font-semibold text-blue-600">{username}</span> • 
                  Monitoring <span className="font-semibold text-blue-600">{instances.length}</span> instances across <span className="font-semibold text-blue-600">{regions.length - 1}</span> regions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onShowBilling}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Billing
              </button>
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-all flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
              >
                <svg 
                  className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all flex items-center gap-2 font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Instances"
            value={filteredInstances.length}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            }
          />
          <StatsCard
            title="Running"
            value={filteredInstances.filter(i => i.state === 'running').length}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Idle Instances"
            value={filteredInstances.filter(i => i.isIdle).length}
            color="yellow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Monthly Waste"
            value={`$${filteredInstances.filter(i => i.isIdle).reduce((sum, i) => sum + (i.monthlyCost || 0), 0).toFixed(2)}`}
            color="red"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or ID..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                {regions.map(region => (
                  <option key={region} value={region}>
                    {region === 'all' ? 'All Regions' : region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="all">All States</option>
                <option value="running">Running</option>
                <option value="stopped">Stopped</option>
                <option value="pending">Pending</option>
                <option value="stopping">Stopping</option>
              </select>
            </div>
          </div>
        </div>

        <ChartSection 
          instances={instances}
          idlePercentage={idlePercentage}
          totalWaste={totalWaste}
        />

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Instance Details {selectedRegion !== 'all' && `- ${selectedRegion}`}
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredInstances.length} of {instances.length} instances
            </span>
          </div>
          
          {filteredInstances.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-md">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">No instances found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(instancesByRegion).map(([region, regionInstances]) => (
                <div key={region}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-xl border border-blue-200">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-bold text-blue-900">{region}</span>
                      <span className="text-blue-600 text-sm">({regionInstances.length})</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {regionInstances.map((instance) => (
                      <InstanceCard
                        key={instance.instanceId}
                        instance={instance}
                        onStop={onStopInstance}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
