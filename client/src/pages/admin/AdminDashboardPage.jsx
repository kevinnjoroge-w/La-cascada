// Admin Dashboard Page
const AdminDashboardPage = () => (
  <div className="min-h-screen bg-secondary-50 py-8">
    <div className="container-custom">
      <h1 className="text-3xl font-bold text-secondary-900 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="text-3xl mb-2">🏨</div>
          <div className="text-2xl font-bold">150</div>
          <div className="text-secondary-500">Total Rooms</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-2xl font-bold">45</div>
          <div className="text-secondary-500">Today's Bookings</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="text-3xl mb-2">🍽️</div>
          <div className="text-2xl font-bold">128</div>
          <div className="text-secondary-500">Orders Today</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold">$12,450</div>
          <div className="text-secondary-500">Today's Revenue</div>
        </div>
      </div>
    </div>
  </div>
);

export default AdminDashboardPage;
