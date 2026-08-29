import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { companyAPI } from '../api';
import { Users, Star } from 'lucide-react';

export default function CompaniesPage() {
  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyAPI.getAll().then(r => r.data.data),
  });

  return (
    <div className="min-h-screen bg-surface">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl font-black text-ink">X<span className="text-primary">1</span></Link>
        <div className="flex gap-3">
          <Link to="/login" className="btn-ghost text-sm py-2">Login</Link>
          <Link to="/signup" className="btn-primary text-sm py-2">Sign Up</Link>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-6 py-16">
        ///////////////////////////
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {companies?.map(c => (
              <div key={c._id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-primary/30 hover:-translate-y-1 transition-all shadow-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-black" style={{background:c.color||'#5B3BF5'}}>
                    {c.name.slice(0,3).toUpperCase()}
                  </div>
                  {c.isFeatured && <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full flex items-center gap-1"><Star size={10}/>Popular</span>}
                </div>
                <h3 className="font-bold text-lg mb-1">{c.name}</h3>
                <p className="text-sm text-gray-400 mb-1 capitalize">{c.category} company</p>
                {c.selectionRate > 0 && <p className="text-xs text-green-600 font-semibold mb-3">{c.selectionRate}% selection rate</p>}
                <div className="flex items-center gap-2 mb-5 text-xs text-gray-400">
                  <Users size={12}/>{c.totalStudents?.toLocaleString() || '0'} students enrolled
                </div>
                ///////////////////////
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
