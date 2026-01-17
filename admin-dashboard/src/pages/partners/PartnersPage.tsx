import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, MapPin, Star, Phone, Mail, Truck, MoreVertical, Edit, Trash2, X, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import apiClient from '../../api/apiClient';

interface CurrentLocation {
  type: string;
  coordinates: [number, number];
}

interface Rating {
  average: number;
  count: number;
}

interface Earnings {
  today: number;
  total: number;
}

interface ActiveOrder {
  _id?: string;
  orderId?: string;
  status?: string;
}

interface DeliveryPartner {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  vehicleType: 'bike' | 'scooter' | 'van' | 'bicycle';
  vehicleNumber?: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation: CurrentLocation;
  activeOrderId?: ActiveOrder | null;
  rating: Rating;
  totalDeliveries: number;
  todayDeliveries: number;
  earnings: Earnings;
  isActive: boolean;
  joinedDate: string;
  lastLocationUpdate?: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface PartnersResponse {
  success: boolean;
  data: DeliveryPartner[];
  pagination: Pagination;
  message: string;
}

const PartnersPage = () => {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; partner: DeliveryPartner | null }>({
    isOpen: false,
    partner: null
  });
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPartners = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (activeFilter !== 'all') {
        params.append('isActive', activeFilter === 'active' ? 'true' : 'false');
      }

      const response = await apiClient.get<PartnersResponse>(`/admin/partners?${params}`);

      if (response.success) {
        // Filter by search term if provided
        let filteredData = response.data;
        if (search) {
          filteredData = response.data.filter(
            (partner) =>
              partner.name.toLowerCase().includes(search.toLowerCase()) ||
              partner.phone.includes(search) ||
              partner.vehicleNumber?.toLowerCase().includes(search.toLowerCase())
          );
        }
        setPartners(filteredData);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners(1);
  }, [statusFilter, activeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPartners(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchPartners(newPage);
    }
  };

  const handleStatusChange = async (partnerId: string, newStatus: 'available' | 'busy' | 'offline') => {
    try {
      await apiClient.patch(`/admin/partners/${partnerId}/status`, { status: newStatus });
      fetchPartners(pagination.page);
      setActionMenu(null);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update partner status');
    }
  };

  const openDeleteModal = (partner: DeliveryPartner) => {
    setDeleteModal({ isOpen: true, partner });
    setActionMenu(null);
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, partner: null });
  };

  const confirmDelete = async () => {
    if (!deleteModal.partner) return;

    try {
      setDeleting(deleteModal.partner._id);
      await apiClient.delete(`/admin/partners/${deleteModal.partner._id}`);
      closeDeleteModal();
      fetchPartners(pagination.page);
    } catch (error: any) {
      console.error('Failed to delete partner:', error);
      alert(error.response?.data?.message || 'Failed to delete partner');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVehicleIcon = (vehicleType: string) => {
    return <Truck className="w-4 h-4" />;
  };

  const formatLocation = (location: CurrentLocation) => {
    if (!location || !location.coordinates || location.coordinates.length < 2) {
      return 'Location not available';
    }
    return `${location.coordinates[1].toFixed(4)}, ${location.coordinates[0].toFixed(4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Delivery Partners</h1>
          <p className="text-gray-600 mt-1">Manage delivery partners with live location tracking</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or vehicle number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
          </select>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Partners</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partner
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deliveries
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                    <p className="text-gray-500 mt-2">Loading partners...</p>
                  </td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No delivery partners found
                  </td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr key={partner._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{partner.name}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <Phone className="w-3 h-3" />
                          <span>{partner.phone}</span>
                        </div>
                        {partner.email && (
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <Mail className="w-3 h-3" />
                            <span>{partner.email}</span>
                          </div>
                        )}
                        <div className="mt-1">
                          {partner.isActive ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <X className="w-3 h-3 mr-1" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getVehicleIcon(partner.vehicleType)}
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{partner.vehicleType}</p>
                          {partner.vehicleNumber && (
                            <p className="text-sm text-gray-500">{partner.vehicleNumber}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(partner.status)}`}>
                          {partner.status === 'available' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {partner.status === 'busy' && <Clock className="w-3 h-3 mr-1" />}
                          {partner.status === 'offline' && <X className="w-3 h-3 mr-1" />}
                          {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                        </span>
                        {partner.activeOrderId && (
                          <p className="text-xs text-gray-500 mt-1">
                            Order: {partner.activeOrderId.orderId || 'N/A'}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{formatLocation(partner.currentLocation)}</span>
                      </div>
                      {partner.lastLocationUpdate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Updated: {formatDate(partner.lastLocationUpdate)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium text-gray-900">
                          {(partner.rating?.average || 0).toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({partner.rating?.count || 0})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{partner.totalDeliveries}</p>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-xs text-purple-600 mt-1">
                          {partner.todayDeliveries} today
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{formatCurrency(partner.earnings?.total || 0)}</p>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-xs text-green-600 mt-1">
                          {formatCurrency(partner.earnings?.today || 0)} today
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setActionMenu(actionMenu === partner._id ? null : partner._id)}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {actionMenu === partner._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => handleStatusChange(partner._id, 'available')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Set Available
                              </button>
                              <button
                                onClick={() => handleStatusChange(partner._id, 'busy')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Clock className="w-4 h-4" />
                                Set Busy
                              </button>
                              <button
                                onClick={() => handleStatusChange(partner._id, 'offline')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <X className="w-4 h-4" />
                                Set Offline
                              </button>
                              <div className="border-t my-1"></div>
                              <button
                                onClick={() => openDeleteModal(partner)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Partner
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && partners.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
            <p className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} partners
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
                {Array.from({ length: Math.min(pagination.pages, 10) }, (_, i) => i + 1).map((pageNum) => (
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
                ))}
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

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={closeDeleteModal}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto z-10">
              {/* Close button */}
              <button
                onClick={closeDeleteModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6">
                {/* Warning Icon */}
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Delete Delivery Partner
                </h3>

                {/* Message */}
                <p className="text-sm text-gray-500 text-center mb-6">
                  Are you sure you want to delete <span className="font-medium text-gray-900">"{deleteModal.partner?.name}"</span>? This action cannot be undone.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={closeDeleteModal}
                    disabled={deleting !== null}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting !== null}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting !== null ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close action menu */}
      {actionMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActionMenu(null)}
        />
      )}
    </div>
  );
};

export default PartnersPage;

