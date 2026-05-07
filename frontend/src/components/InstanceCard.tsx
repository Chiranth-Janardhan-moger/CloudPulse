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

interface InstanceCardProps {
  instance: Instance;
  onStop: (instanceId: string, region: string) => void;
}

const InstanceCard = ({ instance, onStop }: InstanceCardProps) => {
  const getStateColor = (state: string, isIdle?: boolean) => {
    if (state === 'running') {
      return isIdle ? 'yellow' : 'green';
    }
    if (state === 'stopped') return 'red';
    return 'gray';
  };

  const stateColor = getStateColor(instance.state, instance.isIdle);
  
  const colorClasses = {
    green: 'bg-green-100 text-green-700 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{instance.instanceName}</h3>
          <p className="text-gray-500 text-sm font-mono">{instance.instanceId}</p>
        </div>
        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${colorClasses[stateColor]}`}>
          {instance.isIdle ? 'IDLE' : instance.state.toUpperCase()}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-600 text-sm font-medium">Type</span>
          <span className="text-gray-900 font-semibold">{instance.instanceType}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-600 text-sm font-medium">Availability Zone</span>
          <span className="text-gray-900 font-semibold">{instance.availabilityZone}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-600 text-sm font-medium">Public IP</span>
          <span className="text-gray-900 font-semibold font-mono text-sm">{instance.publicIp}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-600 text-sm font-medium">Private IP</span>
          <span className="text-gray-900 font-semibold font-mono text-sm">{instance.privateIp}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-600 text-sm font-medium">Launch Time</span>
          <span className="text-gray-900 font-semibold text-sm">{formatDate(instance.launchTime)}</span>
        </div>

        {instance.cpuAverage !== undefined && (
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600 text-sm font-medium">Avg CPU (7 days)</span>
            <span className={`font-bold ${instance.isIdle ? 'text-yellow-600' : 'text-green-600'}`}>
              {instance.cpuAverage.toFixed(2)}%
            </span>
          </div>
        )}

        {instance.monthlyCost !== undefined && instance.isIdle && (
          <div className="flex justify-between items-center pt-3 border-t-2 border-red-100 bg-red-50 -mx-6 px-6 py-3 mt-4 rounded-b-2xl">
            <span className="text-red-700 text-sm font-bold">Est. Monthly Waste</span>
            <span className="text-red-600 font-bold text-lg">${instance.monthlyCost.toFixed(2)}</span>
          </div>
        )}
      </div>

      {instance.state === 'running' && (
        <button
          onClick={() => onStop(instance.instanceId, instance.region)}
          className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
          Stop Instance
        </button>
      )}
    </div>
  );
};

export default InstanceCard;
