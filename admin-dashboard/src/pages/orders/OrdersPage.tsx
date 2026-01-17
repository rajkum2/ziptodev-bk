import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Eye, Filter, X, Phone, Package, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useSocket } from '../../contexts/SocketContext';

interface OrderItem {
  variantId: string;
  name: string;
  variantLabel?: string;
  quantity: number;
  price: number;
  mrp?: number;
  image?: string;
}

interface DeliveryAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
}

interface Payment {
  method: 'cod' | 'online' | 'wallet' | 'upi';
  status: 'pending' | 'success' | 'failed' | 'refunded';
  transactionId?: string;
  paidAt?: string;
  refundedAt?: string;
}

interface Pricing {
  itemTotal: number;
  deliveryFee: number;
  handlingFee: number;
  tip: number;
  totalSavings: number;
  grandTotal: number;
}

interface Order {
  _id: string;
  orderId: string;
  userId: {
    _id: string;
    phone: string;
    name?: string;
    email?: string;
  };
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  payment: Payment;
  pricing: Pricing;
  status: 'placed' | 'confirmed' | 'packing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note?: string;
    updatedBy?: any;
  }>;
  deliveryPartnerId?: {
    _id: string;
    name: string;
    phone: string;
    vehicleType?: string;
    status?: string;
  };
  estimatedDelivery?: string;
  actualDelivery?: string;
  cancelReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination: Pagination;
  message: string;
}

const OrdersPage = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [cityFilter, setCityFilter] = useState('');
  const [pincodeFilter, setPincodeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Status update
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState<{ isOpen: boolean; order: Order | null }>({
    isOpen: false,
    order: null
  });
  
  // Notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchOrders = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (searchOrderId) params.append('orderId', searchOrderId);
      if (searchPhone) params.append('phone', searchPhone);
      if (statusFilter) params.append('status', statusFilter);
      if (paymentMethodFilter) params.append('paymentMethod', paymentMethodFilter);
      if (paymentStatusFilter) params.append('paymentStatus', paymentStatusFilter);
      if (cityFilter) params.append('city', cityFilter);
      if (pincodeFilter) params.append('pincode', pincodeFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiClient.get<OrdersResponse>(`/admin/orders?${params}`);

      if (response.success) {
        setOrders(response.data);
        setPagination(response.pagination);
      }
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      setNotification({ type: 'error', message: error?.response?.data?.error?.message || 'Failed to fetch orders' });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, []);

  // Socket.io integration for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = () => {
      fetchOrders(pagination.page);
      setNotification({ type: 'success', message: 'New order received!' });
      setTimeout(() => setNotification(null), 5000);
    };

    const handleStatusChange = () => {
      fetchOrders(pagination.page);
    };

    const handlePartnerAssignment = () => {
      fetchOrders(pagination.page);
    };

    socket.on('new:order', handleNewOrder);
    socket.on('order:status_changed', handleStatusChange);
    socket.on('order:partner_assigned', handlePartnerAssignment);

    return () => {
      socket.off('new:order', handleNewOrder);
      socket.off('order:status_changed', handleStatusChange);
      socket.off('order:partner_assigned', handlePartnerAssignment);
    };
  }, [socket, pagination.page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchOrders(newPage);
    }
  };

  const handleStatusUpdate = async (newStatus: string, note?: string) => {
    if (!statusUpdateModal.order) return;

    try {
      setUpdatingStatus(statusUpdateModal.order._id);
      await apiClient.patch(`/admin/orders/${statusUpdateModal.order.orderId}/status`, {
        status: newStatus,
        note
      });
      setNotification({ type: 'success', message: 'Order status updated successfully' });
      setTimeout(() => setNotification(null), 5000);
      setStatusUpdateModal({ isOpen: false, order: null });
      fetchOrders(pagination.page);
    } catch (error: any) {
      console.error('Failed to update status:', error);
      setNotification({ type: 'error', message: error?.response?.data?.error?.message || 'Failed to update order status' });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openStatusModal = (order: Order) => {
    setStatusUpdateModal({ isOpen: true, order });
  };

  const closeStatusModal = () => {
    setStatusUpdateModal({ isOpen: false, order: null });
  };

  const clearFilters = () => {
    setSearchOrderId('');
    setSearchPhone('');
    setStatusFilter('');
    setPaymentMethodFilter('');
    setPaymentStatusFilter('');
    setCityFilter('');
    setPincodeFilter('');
    setStartDate('');
    setEndDate('');
    fetchOrders(1);
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

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      success: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getValidStatusTransitions = (currentStatus: string): string[] => {
    const transitions: Record<string, string[]> = {
      placed: ['confirmed', 'cancelled'],
      confirmed: ['packing', 'cancelled'],
      packing: ['out_for_delivery', 'cancelled'],
      out_for_delivery: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: []
    };
    return transitions[currentStatus] || [];
  };

  return (
    <div>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
    <div>
      <h1 className="text-3xl font-bold">Orders Management</h1>
          <p className="text-gray-600 mt-1">Manage all orders with real-time updates</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Filter className="w-5 h-5" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID..."
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Phone..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="placed">Placed</option>
                <option value="confirmed">Confirmed</option>
                <option value="packing">Packing</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Methods</option>
                <option value="cod">Cash on Delivery</option>
                <option value="online">Online</option>
                <option value="wallet">Wallet</option>
                <option value="upi">UPI</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="Enter city"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                value={pincodeFilter}
                onChange={(e) => setPincodeFilter(e.target.value)}
                placeholder="Enter pincode"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => fetchOrders(1)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Address
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partner
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                    <p className="text-gray-500 mt-2">Loading orders...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{order.orderId}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.userId?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">{order.userId?.phone}</div>
                      {order.userId?.email && (
                        <div className="text-xs text-gray-400">{order.userId.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.items.slice(0, 2).map(item => item.name).join(', ')}
                        {order.items.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{order.pricing.grandTotal.toFixed(2)}
                      </div>
                      {order.pricing.totalSavings > 0 && (
                        <div className="text-xs text-green-600">
                          Saved ₹{order.pricing.totalSavings.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 capitalize">
                        {order.payment.method}
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${getPaymentStatusColor(order.payment.status)}`}>
                        {order.payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.deliveryAddress.addressLine1}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.deliveryAddress.city}, {order.deliveryAddress.pincode}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.deliveryPartnerId ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.deliveryPartnerId.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.deliveryPartnerId.phone}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/orders/${order.orderId}`)}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openStatusModal(order)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Update Status"
                        >
                          <Package className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && orders.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
            <p className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} orders
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pagination.pages, 10) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 10) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.pages - 4) {
                    pageNum = pagination.pages - 9 + i;
                  } else {
                    pageNum = pagination.page - 4 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg ${
                        pagination.page === pageNum
                          ? 'bg-purple-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {statusUpdateModal.isOpen && statusUpdateModal.order && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={closeStatusModal}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto z-10">
              {/* Close button */}
              <button
                onClick={closeStatusModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6">
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Update Order Status
                </h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Order: <span className="font-medium text-gray-900">{statusUpdateModal.order.orderId}</span>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Current Status: <span className={`font-medium ${getStatusColor(statusUpdateModal.order.status)} px-2 py-1 rounded`}>
                    {statusUpdateModal.order.status.replace('_', ' ')}
                  </span>
                </p>

                {/* Status Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    id="newStatus"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    defaultValue=""
                  >
                    <option value="">Select status...</option>
                    {getValidStatusTransitions(statusUpdateModal.order.status).map((status) => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Note */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (Optional)
                  </label>
                  <textarea
                    id="statusNote"
                    rows={3}
                    placeholder="Add a note about this status change..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={closeStatusModal}
                    disabled={updatingStatus !== null}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const select = document.getElementById('newStatus') as HTMLSelectElement;
                      const textarea = document.getElementById('statusNote') as HTMLTextAreaElement;
                      const newStatus = select.value;
                      const note = textarea.value;
                      if (newStatus) {
                        handleStatusUpdate(newStatus, note || undefined);
                      } else {
                        setNotification({ type: 'error', message: 'Please select a status' });
                        setTimeout(() => setNotification(null), 5000);
                      }
                    }}
                    disabled={updatingStatus !== null}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updatingStatus !== null ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Status'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
