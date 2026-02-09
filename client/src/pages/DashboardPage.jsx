import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      icon: '🏨',
      title: 'Book a Room',
      description: 'Luxury rooms & suites',
      link: '/book/room',
      color: 'bg-primary-500',
    },
    {
      icon: '🍺',
      title: 'Reserve Table',
      description: 'Sports bar & restaurant',
      link: '/book/table',
      color: 'bg-accent-500',
    },
    {
      icon: '🌳',
      title: 'Book Garden',
      description: 'Events & weddings',
      link: '/book/garden',
      color: 'bg-green-500',
    },
    {
      icon: '🍽️',
      title: 'Order Food',
      description: 'Browse menu & order',
      link: '/menu',
      color: 'bg-orange-500',
    },
  ];

  const stats = [
    { label: 'Total Bookings', value: '12', icon: '📅' },
    { label: 'Orders Placed', value: '28', icon: '🍴' },
    { label: 'Loyalty Points', value: '2,450', icon: '⭐' },
    { label: 'Total Spent', value: 'KES 648,000', icon: '💰' },
  ];

  const recentActivity = [
    { type: 'booking', title: 'Room Booking Confirmed', date: 'Dec 15, 2024', status: 'confirmed' },
    { type: 'order', title: 'Order #ORD-2024-1215', date: 'Dec 14, 2024', status: 'delivered' },
    { type: 'booking', title: 'Table Reservation', date: 'Dec 12, 2024', status: 'completed' },
  ];

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="container-custom">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-secondary-600 mt-2">
            Here's what's happening with your account
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="text-2xl font-bold text-secondary-900">{stat.value}</div>
              <div className="text-sm text-secondary-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.link}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <h3 className="font-semibold text-secondary-900 mb-1">{action.title}</h3>
                <p className="text-sm text-secondary-500">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-secondary-100">
            <h2 className="text-xl font-semibold text-secondary-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-secondary-100">
            {recentActivity.map((activity, index) => (
              <div key={index} className="p-6 flex items-center justify-between hover:bg-secondary-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
                    {activity.type === 'booking' ? '📅' : '🍴'}
                  </div>
                  <div>
                    <h4 className="font-medium text-secondary-900">{activity.title}</h4>
                    <p className="text-sm text-secondary-500">{activity.date}</p>
                  </div>
                </div>
                <span className={`badge ${
                  activity.status === 'confirmed' ? 'badge-success' :
                  activity.status === 'delivered' ? 'badge-primary' :
                  'badge-warning'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-secondary-100">
            <Link to="/bookings" className="text-primary-600 text-sm font-medium hover:text-primary-700">
              View all activity →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

