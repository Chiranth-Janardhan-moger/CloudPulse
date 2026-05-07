interface StatsCardProps {
  title: string;
  value: string | number;
  color: 'blue' | 'green' | 'yellow' | 'red';
  icon: React.ReactNode;
}

const StatsCard = ({ title, value, color, icon }: StatsCardProps) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-md`}>
          <div className="text-white">{icon}</div>
        </div>
      </div>
      <h3 className="text-gray-500 text-sm font-semibold mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default StatsCard;
