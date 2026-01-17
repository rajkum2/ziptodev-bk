import { Bell, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const Header: React.FC = () => {
  const { admin, logout } = useAuth();
  const { isConnected } = useSocket();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-800">
          Welcome back, {admin?.firstName || admin?.username}!
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Socket Status */}
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile Menu */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">{admin?.username}</p>
            <p className="text-xs text-gray-500">{admin?.role}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={logout}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

