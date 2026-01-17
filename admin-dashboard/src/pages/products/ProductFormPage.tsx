import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import apiClient from '../../api/apiClient';

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  parentId: string | null;
}

interface ExistingVariant {
  variantId: string;
  name: string;
  mrp: number;
  price: number;
  inStock: boolean;
  stock: number;
  sku: string;
  unit?: string;
  weight?: number;
  _id?: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  categoryId: {
    _id: string;
    name: string;
    slug: string;
  } | string;
  images: { url: string; alt: string }[];
  variants: ExistingVariant[];
  tags: string[];
  isActive: boolean;
}

interface CategoriesResponse {
  success: boolean;
  data: Category[];
  message: string;
}

interface ProductResponse {
  success: boolean;
  data: Product;
  message: string;
}

interface FormVariant {
  variantId: string;
  name: string;
  price: number;
  mrp: number;
  stock: number;
  sku: string;
}

const generateVariantId = () => {
  return `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    categoryId: '',
    tags: '',
    isActive: true
  });
  const [variants, setVariants] = useState<FormVariant[]>([
    { variantId: generateVariantId(), name: '', price: 0, mrp: 0, stock: 0, sku: '' }
  ]);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await apiClient.get<CategoriesResponse>('/admin/categories');
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Fetch product for edit mode
  const fetchProduct = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await apiClient.get<ProductResponse>(`/admin/products/${id}`);

      if (response.success) {
        const product = response.data;

        // Get categoryId - handle both object and string
        const categoryId = typeof product.categoryId === 'object'
          ? product.categoryId._id
          : product.categoryId;

        setFormData({
          name: product.name || '',
          description: product.description || '',
          brand: product.brand || '',
          categoryId: categoryId || '',
          tags: product.tags?.join(', ') || '',
          isActive: product.isActive ?? true
        });

        if (product.variants && product.variants.length > 0) {
          setVariants(product.variants.map(v => ({
            variantId: v.variantId,
            name: v.name || '',
            price: v.price || 0,
            mrp: v.mrp || 0,
            stock: v.stock || 0,
            sku: v.sku || ''
          })));
        }
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      setError('Failed to load product data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchCategories();
      if (isEditMode) {
        await fetchProduct();
      } else {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const addVariant = () => {
    setVariants([...variants, { variantId: generateVariantId(), name: '', price: 0, mrp: 0, stock: 0, sku: '' }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: keyof FormVariant, value: string | number) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }
    if (variants.some(v => !v.name.trim() || v.price <= 0 || v.mrp <= 0)) {
      setError('All variants must have name, price and MRP');
      return;
    }

    try {
      setSubmitting(true);

      // Build variants with proper structure
      const formattedVariants = variants.map(v => ({
        variantId: v.variantId || generateVariantId(),
        name: v.name.trim(),
        price: Number(v.price),
        mrp: Number(v.mrp),
        stock: Number(v.stock) || 0,
        sku: v.sku?.trim() || '',
        inStock: Number(v.stock) > 0
      }));

      // Build tags array
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(t => t.trim()).filter(t => t)
        : [];

      if (isEditMode && id) {
        // UPDATE - PUT /api/admin/products/:id
        const updatePayload = {
          name: formData.name.trim(),
          description: formData.description?.trim() || '',
          brand: formData.brand?.trim() || '',
          categoryId: formData.categoryId,
          variants: formattedVariants,
          tags: tagsArray,
          isActive: formData.isActive
        };

        await apiClient.put(`/admin/products/${id}`, updatePayload);
      } else {
        // CREATE - POST /api/admin/products
        const createPayload = {
          name: formData.name.trim(),
          description: formData.description?.trim() || '',
          brand: formData.brand?.trim() || '',
          categoryId: formData.categoryId,
          variants: formattedVariants,
          tags: tagsArray,
          isActive: formData.isActive
        };

        await apiClient.post('/admin/products', createPayload);
      }

      navigate('/products');
    } catch (err: any) {
      console.error('Failed to save product:', err);
      const errorMsg = err.response?.data?.error?.message ||
                       err.response?.data?.error?.details?.[0]?.message ||
                       'Failed to save product';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode ? 'Update product details' : 'Create a new product'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter product name"
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
                    rows={4}
                    placeholder="Enter product description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter brand name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., vegetables, fresh, organic"
                  />
                </div>
              </div>
            </div>

            {/* Variants Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Variants <span className="text-red-500">*</span>
                </h2>
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Variant
                </button>
              </div>

              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={variant.variantId} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-600">Variant {index + 1}</span>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Name *</label>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => updateVariant(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g., 500g, 1kg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">SKU</label>
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g., TOM-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">MRP *</label>
                        <input
                          type="number"
                          value={variant.mrp || ''}
                          onChange={(e) => updateVariant(index, 'mrp', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Price *</label>
                        <input
                          type="number"
                          value={variant.price || ''}
                          onChange={(e) => updateVariant(index, 'price', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Stock</label>
                        <input
                          type="number"
                          value={variant.stock || ''}
                          onChange={(e) => updateVariant(index, 'stock', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Status</h2>
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
                <span className="text-sm text-gray-700">
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formData.isActive
                  ? 'Product is visible to customers'
                  : 'Product is hidden from customers'}
              </p>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {submitting
                    ? (isEditMode ? 'Updating...' : 'Creating...')
                    : (isEditMode ? 'Update Product' : 'Create Product')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
