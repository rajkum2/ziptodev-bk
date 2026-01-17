import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Truck,
  MapPin, BarChart3, Settings, Image, Grid3x3, FolderTree, BookOpen, Search,
  MessageSquare, Bug
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/orders', icon: ShoppingBag, label: 'Orders' },
  { path: '/products', icon: Package, label: 'Products' },
  { path: '/categories', icon: FolderTree, label: 'Categories' },
  { path: '/users', icon: Users, label: 'Users' },
  { path: '/partners', icon: Truck, label: 'Delivery Partners' },
  { path: '/banners', icon: Image, label: 'Banners' },
  { path: '/shelves', icon: Grid3x3, label: 'Shelves' },
  { path: '/locations', icon: MapPin, label: 'Locations' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/knowledge/documents', icon: BookOpen, label: 'Knowledge Base', permission: 'KNOWLEDGE_MANAGE' },
  { path: '/knowledge/search', icon: Search, label: 'Knowledge Search', permission: 'KNOWLEDGE_MANAGE' },
  { path: '/support/conversations', icon: MessageSquare, label: 'Support Inbox', permission: 'SUPPORT_VIEW' },
  { path: '/support/rag-debug', icon: Bug, label: 'RAG Debug', permission: 'SUPPORT_RAG_DEBUG' }
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { hasPermission } = useAuth();

  const visibleItems = menuItems.filter(item => !item.permission || hasPermission(item.permission));

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary">Zipto Admin</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary border-r-4 border-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Zipto Admin v1.0
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;

