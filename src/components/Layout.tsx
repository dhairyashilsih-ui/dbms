import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Library, LayoutDashboard, BookOpen, Users, ArrowRightLeft, BookmarkCheck, LogOut, Menu, X, ChevronRight } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/books', label: 'Books', icon: BookOpen },
  { path: '/members', label: 'Members', icon: Users },
  { path: '/borrowings', label: 'Borrowings', icon: ArrowRightLeft },
  { path: '/reservations', label: 'Reservations', icon: BookmarkCheck },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const initials = user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U';

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full bg-white border-r border-gray-100 ${mobile ? 'w-72' : 'w-64'}`}>
      <div className="p-6 flex items-center gap-2.5">
        <Library className="w-8 h-8 text-emerald-600" />
        <span className="text-lg font-bold text-gray-900 tracking-tight">LibraVault</span>
        {mobile && <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>}
      </div>
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} onClick={() => mobile && setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
              {item.label}
              {isActive && <ChevronRight className="w-4 h-4 ml-auto text-emerald-400" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-semibold text-emerald-700">{initials}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.user_metadata?.full_name ?? 'User'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0"><SidebarContent /></aside>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50"><SidebarContent mobile /></div>
        </div>
      )}
      <div className="flex-1 lg:pl-64">
        <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1 text-gray-600 hover:text-gray-900"><Menu className="w-6 h-6" /></button>
          <Library className="w-6 h-6 text-emerald-600" />
          <span className="text-base font-bold text-gray-900">LibraVault</span>
        </header>
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
