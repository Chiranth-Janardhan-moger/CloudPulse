import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

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

interface ChartSectionProps {
  instances: Instance[];
  idlePercentage: number;
  totalWaste: number;
}

const ChartSection = ({ instances }: ChartSectionProps) => {
  const runningInstances = instances.filter((i) => i.state === 'running');
  const idleInstances = instances.filter((i) => i.isIdle && i.state === 'running');
  const activeInstances = runningInstances.length - idleInstances.length;

  const pieData = [
    { name: 'Active', value: activeInstances, color: '#10b981' },
    { name: 'Idle', value: idleInstances.length, color: '#f59e0b' },
  ];

  const costData = idleInstances
    .map((instance) => ({
      name: instance.instanceName,
      cost: instance.monthlyCost || 0,
    }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Instance Status Distribution</h3>
        {runningInstances.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            No running instances
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Idle Instance Costs</h3>
        {costData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costData}>
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ color: '#111827', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ color: '#6b7280' }} />
              <Bar dataKey="cost" fill="#ef4444" name="Monthly Cost ($)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            No idle instances detected
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartSection;
