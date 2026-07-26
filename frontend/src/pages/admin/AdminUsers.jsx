import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';
import { Search, UserCheck, UserX } from 'lucide-react';

export default function AdminUsers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: () => adminAPI.getUsers({ search, page, limit: 20 }).then(r => r.data),
  });

  const toggleMut = useMutation({
    mutationFn: adminAPI.toggleUser,
    onSuccess: () => { toast.success('User status updated'); qc.invalidateQueries(['admin-users']); },
  });

  const users = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-white">Users</h1>
        <p className="text-gray-400 mt-1">{data?.pagination?.total || 0} registered students</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/>
        <input className="w-full max-w-sm bg-gray-800 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary-500"
          placeholder="Search by name or email…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>{['Name','Email','Plan','Level/XP','Streak','Joined','Status','Action'].map(h=>(
              <th key={h} className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-4 py-3">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-10 text-gray-500">Loading…</td></tr>
            ) : users.map(u => (
              <tr key={u._id} className="border-t border-gray-800 hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">{u.fullName?.[0]}</div>
                    <span className="text-white text-sm font-medium">{u.fullName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400 text-sm">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.subscription?.plan==='premium'?'bg-yellow-900/50 text-yellow-400':u.subscription?.plan!=='free'?'bg-green-900/50 text-green-400':'bg-gray-800 text-gray-400'}`}>
                    {u.subscription?.plan || 'free'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300 text-sm">Lv{u.level} · {u.xp}xp</td>
                <td className="px-4 py-3 text-gray-400 text-sm">🔥{u.streak}d</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.isActive?'bg-green-900/50 text-green-400':'bg-red-900/50 text-red-400'}`}>
                    {u.isActive?'Active':'Disabled'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={()=>toggleMut.mutate(u._id)}
                    className={`p-1.5 rounded-lg transition-all ${u.isActive?'text-red-400 hover:bg-red-900/30':'text-green-400 hover:bg-green-900/30'}`}>
                    {u.isActive ? <UserX size={14}/> : <UserCheck size={14}/>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && !isLoading && <div className="text-center py-10 text-gray-500">No users found.</div>}
      </div>

      {data?.pagination && (
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Page {page} of {data.pagination.pages || 1}</span>
          <div className="flex gap-2">
            <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-3 py-1.5 bg-gray-800 rounded-lg disabled:opacity-40 hover:bg-gray-700 transition-all">← Prev</button>
            <button disabled={page>=(data.pagination.pages||1)} onClick={()=>setPage(p=>p+1)} className="px-3 py-1.5 bg-gray-800 rounded-lg disabled:opacity-40 hover:bg-gray-700 transition-all">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
