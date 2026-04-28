const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    text: 'text-blue-900',
    border: 'border-blue-100'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    text: 'text-green-900',
    border: 'border-green-100'
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    text: 'text-yellow-900',
    border: 'border-yellow-100'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    text: 'text-purple-900',
    border: 'border-purple-100'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    text: 'text-red-900',
    border: 'border-red-100'
  }
};

export default function StatCard({ title, value, icon, color = 'blue' }) {
  const classes = colorClasses[color];

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${classes.border} p-5 hover:shadow-md transition-shadow flex-1 min-w-0`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
          <p className={`text-3xl font-bold ${classes.text}`}>{value}</p>
        </div>
        <div className={`${classes.bg} rounded-lg p-3 ml-4 flex-shrink-0`}>
          <div className={classes.icon}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}