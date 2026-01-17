import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { Toaster } from './components/ui/toaster';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import ProductsPage from './pages/products/ProductsPage';
import ProductFormPage from './pages/products/ProductFormPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import UsersPage from './pages/users/UsersPage';
import PartnersPage from './pages/partners/PartnersPage';
import BannersPage from './pages/banners/BannersPage';
import ShelvesPage from './pages/shelves/ShelvesPage';
import LocationsPage from './pages/locations/LocationsPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import SettingsPage from './pages/settings/SettingsPage';
import KnowledgeDocumentsPage from './pages/knowledge/KnowledgeDocumentsPage';
import KnowledgeDocumentDetailPage from './pages/knowledge/KnowledgeDocumentDetailPage';
import KnowledgeSearchPage from './pages/knowledge/KnowledgeSearchPage';

// Protected Route
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Dashboard Routes */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/" element={<DashboardPage />} />
              
              {/* Orders */}
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:orderId" element={<OrderDetailPage />} />
              
              {/* Products */}
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/new" element={<ProductFormPage />} />
              <Route path="/products/:id/edit" element={<ProductFormPage />} />
              
              {/* Categories */}
              <Route path="/categories" element={<CategoriesPage />} />
              
              {/* Users */}
              <Route path="/users" element={<UsersPage />} />
              
              {/* Delivery Partners */}
              <Route path="/partners" element={<PartnersPage />} />
              
              {/* Banners & Shelves */}
              <Route path="/banners" element={<BannersPage />} />
              <Route path="/shelves" element={<ShelvesPage />} />
              
              {/* Locations */}
              <Route path="/locations" element={<LocationsPage />} />
              
              {/* Analytics */}
              <Route path="/analytics" element={<AnalyticsPage />} />
              
              {/* Settings */}
              <Route path="/settings" element={<SettingsPage />} />

              {/* Knowledge Base */}
              <Route path="/knowledge/documents" element={<KnowledgeDocumentsPage />} />
              <Route path="/knowledge/documents/:id" element={<KnowledgeDocumentDetailPage />} />
              <Route path="/knowledge/search" element={<KnowledgeSearchPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

