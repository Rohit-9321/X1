import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useState } from 'react';
import {
  LayoutDashboard, Building2, Code2, FileText, BarChart2,
  Trophy, BrainCircuit, BookOpen, User, LogOut, Menu, X, Zap, TestTube
} from 'lucide-react';

const links = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/practice',   icon: FileText,        label: 'Practice' },
  { to: '/coding',     icon: Code2,           label: 'Coding' },
  { to: '/tests',      icon: TestTube,        label: 'Mock Tests' },
  { to: '/notes',      icon: BookOpen,        label: 'Notes' },
  { to: '/analytics',  icon: BarChart2,       label: 'Analytics' },
  { to: '/leaderboard',icon: Trophy,          label: 'Leaderboard' },
  { to: '/ai-coach',   icon: BrainCircuit,    label: 'AI Coach' },
];

export default function StudentLayout() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => { await dispatch(logout()); navigate('/'); };

  const Sidebar = ({ mobile }) => (
    <aside className={`${mobile ? 'flex flex-col h-full' : 'hidden lg:flex flex-col'} w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 h-screen sticky top-0 p-4`}>
      <div className="flex items-center gap-2 px-2 mb-8 mt-2">
        <span className="font-display text-2xl font-black text-ink dark:text-white">X<span className="text-primary">1</span></span>
      </div>

      {/* User card */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 mb-6">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {user?.fullName?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-ink dark:text-white truncate">{user?.fullName}</div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Zap size={10} className="text-yellow-500" />
            <span>Level {user?.level || 1} · {user?.xp || 0} XP</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon size={17} /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-1">
        <NavLink to="/profile" onClick={() => setOpen(false)}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <User size={17} /> Profile
        </NavLink>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
          <LogOut size={17} /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-surface dark:bg-gray-950">
      <Sidebar />

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
          <button onClick={() => setOpen(true)}><Menu size={22} /></button>
          <span className="font-display font-black text-xl">X<span className="text-primary">1</span></span>
          <NavLink to="/profile"><User size={22} /></NavLink>
        </div>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
