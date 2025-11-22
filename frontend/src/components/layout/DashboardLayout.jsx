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
  QrCode,
  AlertTriangle,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import NotificationCenter from '../common/NotificationCenter';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

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
        { name: 'Хүсэлт үүсгэх', href: '/pickup/create', icon: ClipboardList },
        { name: 'Миний хүсэлтүүд', href: '/pickup/requests', icon: History },
      ],
      guard: [
        { name: 'Баталгаажуулах', href: '/guard/verify', icon: QrCode },
        { name: 'Дараалал', href: '/guard/queue', icon: ClipboardList },
        { name: 'Яаралтай', href: '/guard/emergency', icon: AlertTriangle },
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
    <div className="min-h-screen bg-page">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-primary-50 shadow-xl transform transition-transform duration-300 ease-in-out border-r-2 border-primary-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 bg-primary-500 border-b border-primary-600">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-white" />
              <h1 className="text-xl font-bold text-white">SPMS</h1>
            </div>
            <button
              className="lg:hidden text-white hover:bg-primary-600 p-1 rounded"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-primary-800 font-medium shadow-sm border-l-4 border-primary-500'
                        : 'text-primary-900 hover:bg-primary-100 hover:translate-x-1'
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

          <div className="p-4 border-t border-primary-200 bg-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center border-2 border-primary-400">
                <span className="text-primary-800 font-semibold text-lg">
                  {user?.fullName?.charAt(0) || 'Х'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">
                  {user?.fullName || 'Хэрэглэгч'}
                </p>
                <p className="text-xs text-secondary capitalize">
                  {user?.role || 'Үүрэг'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white hover:bg-primary-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Гарах
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 bg-white shadow-md border-b-2 border-primary-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              className="lg:hidden text-primary-800 hover:bg-primary-50 p-2 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-4">
              <NotificationCenter />
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
