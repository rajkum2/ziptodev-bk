import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, AlertTriangle, ChevronRight, FolderOpen } from 'lucide-react';
import apiClient from '../../api/apiClient';

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  color?: string;
  priority: number;
  isActive: boolean;
  description?: string;
  parentId: string | null;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesResponse {
  success: boolean;
  data: Category[];
  message: string;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; category: Category | null }>({
    isOpen: false,
    category: null
  });
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    image: '',
    color: '#22c55e',
    parentId: '',
    priority: 1,
    isActive: true
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<CategoriesResponse>('/admin/categories');
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Get parent categories (no parentId)
  const parentCategories = categories.filter(c => !c.parentId);

  // Get subcategories for a parent
  const getSubcategories = (parentId: string) => {
    return categories.filter(c => c.parentId === parentId);
  };

  // Filter categories based on search
  const filteredParentCategories = parentCategories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
      image: '',
      color: '#22c55e',
      parentId: '',
      priority: 1,
      isActive: true
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      image: category.image || '',
      color: category.color || '#22c55e',
      parentId: category.parentId || '',
      priority: category.priority,
      isActive: category.isActive
    });
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        icon: formData.icon?.trim() || '',
        image: formData.image?.trim() || '',
        color: formData.color,
        parentId: formData.parentId || null,
        priority: Number(formData.priority),
        isActive: formData.isActive
      };

      if (editingCategory) {
        await apiClient.put(`/admin/categories/${editingCategory._id}`, payload);
      } else {
        await apiClient.post('/admin/categories', payload);
      }

      closeModal();
      fetchCategories();
    } catch (err: any) {
      console.error('Failed to save category:', err);
      const errorMsg = err.response?.data?.error?.message || 'Failed to save category';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (category: Category) => {
    setDeleteModal({ isOpen: true, category });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, category: null });
  };

  const confirmDelete = async () => {
    if (!deleteModal.category) return;

    try {
      setDeleting(true);
      await apiClient.delete(`/admin/categories/${deleteModal.category._id}`);
      closeDeleteModal();
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Categories Management</h1>
          <p className="text-gray-600 mt-1">Manage product categories and subcategories</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
            <p className="text-gray-500 mt-2">Loading categories...</p>
          </div>
        ) : filteredParentCategories.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No categories found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredParentCategories.map((category) => {
              const subcategories = getSubcategories(category._id);

              return (
                <div key={category._id}>
                  {/* Parent Category Row */}
                  <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      {/* Icon/Image */}
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ backgroundColor: category.color ? `${category.color}20` : '#f3f4f6' }}
                      >
                        {category.icon || (
                          <img
                            src={category.image || 'https://via.placeholder.com/48'}
                            alt={category.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{category.name}</h3>
                          {subcategories.length > 0 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {subcategories.length} sub
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{category.description}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-400">Slug: {category.slug}</span>
                          <span className="text-xs text-gray-400">Products: {category.productCount}</span>
                          <span className="text-xs text-gray-400">Priority: {category.priority}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status */}
                      {category.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(category)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {subcategories.length > 0 && (
                    <div className="bg-gray-50 border-t border-gray-100">
                      {subcategories.map((sub) => (
                        <div
                          key={sub._id}
                          className="flex items-center justify-between px-6 py-3 pl-16 hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <div
                              className="w-8 h-8 rounded-md flex items-center justify-center text-lg"
                              style={{ backgroundColor: sub.color ? `${sub.color}20` : '#e5e7eb' }}
                            >
                              {sub.icon || ''}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{sub.name}</p>
                              <span className="text-xs text-gray-400">Products: {sub.productCount}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {sub.isActive ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Inactive
                              </span>
                            )}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditModal(sub)}
                                className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(sub)}
                                className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={closeModal}
            />

            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-auto z-10">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Category name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={2}
                      placeholder="Brief description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Icon (emoji)
                      </label>
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., 🥬"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Category
                      </label>
                      <select
                        value={formData.parentId}
                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">None (Top Level)</option>
                        {parentCategories
                          .filter(c => c._id !== editingCategory?._id)
                          .map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.icon} {cat.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <input
                        type="number"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                    <span className="text-sm text-gray-700">Active</span>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      {submitting ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={closeDeleteModal}
            />

            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto z-10">
              <button
                onClick={closeDeleteModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Delete Category
                </h3>

                <p className="text-sm text-gray-500 text-center mb-6">
                  Are you sure you want to delete <span className="font-medium text-gray-900">"{deleteModal.category?.name}"</span>?
                  {deleteModal.category && getSubcategories(deleteModal.category._id).length > 0 && (
                    <span className="text-red-600 block mt-1">
                      Warning: This category has subcategories that will also be affected.
                    </span>
                  )}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={closeDeleteModal}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
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

export default CategoriesPage;
