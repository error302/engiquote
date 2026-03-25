import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban, FileText, Package, Settings, UserCog, LogOut, FileStack, Receipt, BarChart3, CheckSquare, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/quotes', icon: FileText, label: 'Quotes' },
  { to: '/invoices', icon: Receipt, label: 'Invoices' },
  { to: '/templates', icon: FileStack, label: 'Templates' },
  { to: '/materials', icon: Package, label: 'Materials' },
  { to: '/settings', icon: Settings, label: 'Settings' }
];

export default function Sidebar({ onClose }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-60 bg-primary text-white min-h-screen p-4 flex flex-col">
      {/* Mobile close button */}
      {onClose && (
        <div className="flex justify-end mb-4 lg:hidden">
          <button onClick={onClose} className="p-2 hover:bg-primary-light rounded">
            <X size={24} />
          </button>
        </div>
      )}
      
      <div className="text-xl font-bold mb-8 px-2">EngiQuote KE</div>
      
      <nav className="space-y-1 flex-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-primary-light' : 'hover:bg-primary-light/50'
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
        
        {isAdmin && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-primary-light' : 'hover:bg-primary-light/50'
              }`
            }
          >
            <UserCog size={20} />
            Users
          </NavLink>
        )}
      </nav>

      <div className="border-t border-primary-light pt-4 mt-4">
        <div className="px-3 py-2 mb-2">
          <p className="font-medium text-sm">{user?.name}</p>
          <p className="text-xs text-primary-light">{user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-primary-light rounded text-xs">
            {user?.role}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-primary-light/50 transition-colors text-left"
        >
          <LogOut size={20} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
