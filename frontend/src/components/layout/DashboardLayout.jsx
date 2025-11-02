import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  ClipboardList,
  History,
  BarChart3,
  Menu,
  X,
  LogOut,
  Bell,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  // Define navigation based on user role
  const getNavigationByRole = () => {
    const baseNav = [
      { name: 'Хяналтын самбар', href: '/', icon: Home, roles: ['admin', 'teacher', 'parent', 'guard'] },
    ];

    const roleSpecificNav = {
      admin: [
        { name: 'Сурагчид', href: '/students', icon: Users },
        { name: 'Авах хүсэлтүүд', href: '/pickup-requests', icon: ClipboardList },
        { name: 'Түүх', href: '/pickup-history', icon: History },
        { name: 'Тайлан', href: '/reports', icon: BarChart3 },
      ],
      teacher: [
        { name: 'Авах хүсэлтүүд', href: '/pickup-requests', icon: ClipboardList },
        { name: 'Миний анги', href: '/my-class', icon: Users },
        { name: 'Түүх', href: '/pickup-history', icon: History },
      ],
      parent: [
        { name: 'Миний хүүхдүүд', href: '/my-children', icon: Users },
        { name: 'Хүсэлт үүсгэх', href: '/create-pickup', icon: ClipboardList },
        { name: 'Миний хүсэлтүүд', href: '/my-requests', icon: History },
      ],
      guard: [
        { name: 'Авах хүсэлтүүд', href: '/pickup-requests', icon: ClipboardList },
        { name: 'Баталгаажуулах', href: '/verify-pickup', icon: CheckCircle },
        { name: 'Түүх', href: '/pickup-history', icon: History },
      ],
    };

    return [...baseNav, ...(roleSpecificNav[user?.role] || roleSpecificNav.parent)];
  };

  const navigation = getNavigationByRole();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <h1 className="text-xl font-bold text-primary-600">SPMS</h1>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-semibold">
                  {user?.fullName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role || 'Role'}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Гарах
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
