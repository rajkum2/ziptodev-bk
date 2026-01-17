import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/apiClient';
import { TrendingUp, ShoppingCart, Users, Package } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => apiClient.get('/admin/analytics/overview')
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const stats = overview?.data?.stats || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your Zipto platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Orders Today"
          value={stats.totalOrdersToday || 0}
          icon={ShoppingCart}
          color="bg-blue-500"
        />
        <StatCard
          title="Revenue Today"
          value={`₹${(stats.revenueToday || 0).toFixed(0)}`}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers || 0}
          icon={Users}
          color="bg-purple-500"
        />
        <StatCard
          title="Available Partners"
          value={stats.availablePartners || 0}
          icon={Package}
          color="bg-orange-500"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3 px-4">Order ID</th>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {overview?.data?.recentOrders?.map((order: any) => (
                <tr key={order._id} className="border-b last:border-0">
                  <td className="py-3 px-4">{order.orderId}</td>
                  <td className="py-3 px-4">{order.userId?.name || order.userId?.phone}</td>
                  <td className="py-3 px-4">₹{order.pricing?.grandTotal?.toFixed(0)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; icon: any; color: string }> = ({
  title,
  value,
  icon: Icon,
  color
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    placed: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-indigo-100 text-indigo-800',
    packing: 'bg-yellow-100 text-yellow-800',
    out_for_delivery: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export default DashboardPage;

