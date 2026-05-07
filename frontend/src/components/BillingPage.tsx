import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface BillingPageProps {
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  onBack: () => void;
}

interface BillingData {
  currentMonth: {
    cost: string;
    period: string;
  };
  lastMonth: {
    cost: string;
    period: string;
  };
  yearToDate: {
    cost: string;
    period: string;
  };
  monthlyBreakdown: Array<{
    month: string;
    cost: number;
  }>;
}

const BillingPage = ({ credentials, onBack }: BillingPageProps) => {
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/billing`, {
        headers: {
          'X-AWS-Access-Key-Id': credentials.accessKeyId,
          'X-AWS-Secret-Access-Key': credentials.secretAccessKey,
        },
      });
      setBillingData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch billing data');
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loader-light"></div>
          <p className="text-gray-700 mt-4 text-lg font-medium">Loading billing data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="mb-6 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl transition-all flex items-center gap-2 font-semibold border border-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          
          <div className="bg-white border-2 border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-xl">
            <div className="text-red-600 text-center">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-bold mb-2 text-gray-900">Error Loading Billing Data</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchBillingData}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-semibold"
              >
                Retry
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
        {/* Header */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AWS Billing Dashboard</h1>
                <p className="text-sm text-gray-500">View your AWS costs and spending trends</p>
              </div>
            </div>
          </div>
        </div>

        {billingData && (
          <div className="space-y-6">
            {/* Cost Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Month */}
              <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-blue-700 text-sm font-semibold">Current Month</p>
                    <p className="text-blue-500 text-xs">{billingData.currentMonth.period}</p>
                  </div>
                </div>
                <p className="text-4xl font-bold text-blue-900">${Math.abs(parseFloat(billingData.currentMonth.cost)).toFixed(2)}</p>
              </div>

              {/* Last Month */}
              <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-purple-700 text-sm font-semibold">Last Month</p>
                    <p className="text-purple-500 text-xs">{billingData.lastMonth.period}</p>
                  </div>
                </div>
                <p className="text-4xl font-bold text-purple-900">${Math.abs(parseFloat(billingData.lastMonth.cost)).toFixed(2)}</p>
              </div>

              {/* Year to Date */}
              <div className="bg-white border-2 border-green-200 rounded-2xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-700 text-sm font-semibold">Year to Date</p>
                    <p className="text-green-500 text-xs">{billingData.yearToDate.period}</p>
                  </div>
                </div>
                <p className="text-4xl font-bold text-green-900">${Math.abs(parseFloat(billingData.yearToDate.cost)).toFixed(2)}</p>
              </div>
            </div>

            {/* Monthly Breakdown Chart */}
            {billingData.monthlyBreakdown.length > 0 && (
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Cost Breakdown</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={billingData.monthlyBreakdown.map(item => ({
                    ...item,
                    cost: Math.max(0, item.cost) // Ensure no negative values
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={formatMonth}
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => `$${Math.abs(value).toFixed(0)}`}
                      domain={[0, (dataMax: number) => Math.max(dataMax * 1.1, 1)]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      labelFormatter={formatMonth}
                      formatter={(value: number) => [`$${Math.abs(value).toFixed(2)}`, 'Cost']}
                    />
                    <Bar dataKey="cost" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Info Note */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Important Information</p>
                  <p className="text-blue-700">Billing data is fetched from AWS Cost Explorer. Costs may take up to 24 hours to appear and are estimates until finalized. Make sure Cost Explorer is enabled in your AWS account.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingPage;
