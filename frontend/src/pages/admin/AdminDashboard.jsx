import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import { Users, Building2, CreditCard, TrendingUp, DollarSign, UserCheck } from 'lucide-react';

export default function AdminDashboard() {
  const { data } = useQuery({ queryKey: ['admin-stats'], queryFn: () => adminAPI.getStats().then(r => r.data.data) });

  const stats = [
    { label: 'Total Students',       val: data?.totalUsers || 0,          icon: Users,      color: 'text-blue-500',  bg: 'bg-blue-50' },
    { label: 'Premium Subscribers',  val: data?.activeSubscriptions || 0, icon: UserCheck,  color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Companies',            val: data?.totalCompanies || 0,       icon: Building2,  color: 'text-purple-500',bg: 'bg-purple-50' },
    { label: 'Total Revenue',        val: `₹${((data?.totalRevenue||0)/100).toLocaleString()}`, icon: DollarSign, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-black text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Platform overview and analytics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div>
              <div className="font-display text-2xl font-black text-white">{s.val}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['Add Company',  '/admin/companies'],
            ['Add Question', '/admin/questions'],
            ['Add Coding',   '/admin/coding'],
            ['Create Test',  '/admin/tests'],
          ].map(([l, to]) => (
            <a key={l} href={to} className="block text-center py-3 px-4 bg-gray-800 hover:bg-primary-500 rounded-xl text-sm font-semibold text-gray-300 hover:text-white transition-all">
              {l}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
