import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Plus, Edit, Trash2, X, AlertTriangle } from 'lucide-react';
import apiClient from '../../api/apiClient';

interface Variant {
  variantId: string;
  name: string;
  mrp: number;
  price: number;
  inStock: boolean;
  stock: number;
  sku: string;
  unit: string;
  weight: number;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: {
    _id: string;
    name: string;
    slug: string;
  };
  images: { url: string; alt: string }[];
  variants: Variant[];
  tags: string[];
  isActive: boolean;
  stock: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: Pagination;
  message: string;
}

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; product: Product | null }>({
    isOpen: false,
    product: null
  });

  const fetchProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (search) {
        params.append('search', search);
      }

      const response = await apiClient.get<ProductsResponse>(`/admin/products?${params}`);

      if (response.success) {
        setProducts(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchProducts(newPage);
    }
  };

  const openDeleteModal = (product: Product) => {
    setDeleteModal({ isOpen: true, product });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, product: null });
  };

  const confirmDelete = async () => {
    if (!deleteModal.product) return;

    try {
      setDeleting(deleteModal.product._id);
      await apiClient.delete(`/admin/products/${deleteModal.product._id}`);
      closeDeleteModal();
      fetchProducts(pagination.page);
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const getPrice = (variants: Variant[]) => {
    if (variants.length === 0) return { mrp: 0, price: 0 };
    return { mrp: variants[0].mrp, price: variants[0].price };
  };

  const getTotalStock = (variants: Variant[]) => {
    return variants.reduce((total, v) => total + v.stock, 0);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Products Management</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={() => navigate('/products/new')}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, brand, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variants
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                    <p className="text-gray-500 mt-2">Loading products...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const { mrp, price } = getPrice(product.variants);
                  const totalStock = getTotalStock(product.variants);
                  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

                  return (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0]?.url || 'https://via.placeholder.com/48'}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {product.categoryId?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">₹{price}</p>
                          {discount > 0 && (
                            <p className="text-xs text-gray-500">
                              <span className="line-through">₹{mrp}</span>
                              <span className="text-green-600 ml-1">({discount}% off)</span>
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${totalStock <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
                          {totalStock}
                        </span>
                        {totalStock <= 10 && (
                          <p className="text-xs text-red-500">Low stock</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{product.variants.length}</span>
                      </td>
                      <td className="px-6 py-4">
                        {product.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/products/${product._id}/edit`)}
                            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && products.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
            <p className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} products
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
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
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
                  Delete Product
                </h3>

                {/* Message */}
                <p className="text-sm text-gray-500 text-center mb-6">
                  Are you sure you want to delete <span className="font-medium text-gray-900">"{deleteModal.product?.name}"</span>? This action cannot be undone.
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
    </div>
  );
};

export default ProductsPage;
