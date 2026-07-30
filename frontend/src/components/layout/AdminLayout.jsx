import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useState } from 'react';
import {
  LayoutDashboard, Building2, FileQuestion, Code2,
  TestTube, BookOpen, Users, CreditCard, LogOut, Menu, Shield
} from 'lucide-react';

const links = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/companies',  icon: Building2,       label: 'Companies' },
  { to: '/admin/questions',  icon: FileQuestion,    label: 'Questions' },
  { to: '/admin/coding',     icon: Code2,           label: 'Coding Problems' },
  { to: '/admin/tests',      icon: TestTube,        label: 'Mock Tests' },
  { to: '/admin/notes',      icon: BookOpen,        label: 'Notes' },
  { to: '/admin/users',      icon: Users,           label: 'Users' },
  { to: '/admin/payments',   icon: CreditCard,      label: 'Payments' },
];

export default function AdminLayout() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const handleLogout = async () => { await dispatch(logout()); navigate('/'); };

  const Sidebar = () => (
    <aside className="flex flex-col w-60 bg-gray-950 h-screen sticky top-0 p-4">
      <div className="flex items-center gap-2 px-2 mb-8 mt-2">
        <Shield size={20} className="text-primary-500" />
        <span className="font-display text-xl font-black text-white">X<span className="text-primary-500">1</span> Admin</span>
      </div>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-6">
        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
          {user?.fullName?.[0]}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{user?.fullName}</div>
          <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {links.map(({ to, icon: Icon, label, exact }) => (
          <NavLink key={to} to={to} end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-primary-500 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}>
            <Icon size={16} /> {label}
          </NavLink>
        ))}
      </nav>
      <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
        <LogOut size={16} /> Logout
      </button>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
