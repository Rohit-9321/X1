import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import { DollarSign } from 'lucide-react';

export default function AdminPayments() {
  const { data, isLoading } = useQuery({ queryKey:['admin-payments'], queryFn:()=>adminAPI.getPayments().then(r=>r.data.data) });

  const total = data?.reduce((s,p)=>s+p.amount,0)||0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-white">Payments</h1>
        <p className="text-gray-400 mt-1">All successful transactions</p>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 inline-flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-green-900/40 flex items-center justify-center"><DollarSign size={20} className="text-green-400"/></div>
        <div>
          <div className="font-display text-2xl font-black text-white">₹{(total/100).toLocaleString()}</div>
          <div className="text-xs text-gray-400">Total Revenue ({data?.length||0} orders)</div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>{['User','Plan','Companies','Amount','Date','Status'].map(h=>(
              <th key={h} className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">Loading…</td></tr>
            ) : data?.map(p=>(
              <tr key={p._id} className="border-t border-gray-800 hover:bg-gray-800/50">
                <td className="px-5 py-4">
                  <div className="text-white text-sm font-medium">{p.user?.fullName}</div>
                  <div className="text-gray-500 text-xs">{p.user?.email}</div>
                </td>
                <td className="px-5 py-4"><span className="text-xs font-bold text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded-full capitalize">{p.plan}</span></td>
                <td className="px-5 py-4 text-gray-400 text-sm">{p.companies?.map(c=>c.name).join(', ')||'All'}</td>
                <td className="px-5 py-4 text-green-400 font-bold text-sm">₹{(p.amount/100).toLocaleString()}</td>
                <td className="px-5 py-4 text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-4"><span className="text-xs font-bold text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full">Paid</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.length && !isLoading && <div className="text-center py-10 text-gray-500">No payments yet.</div>}
      </div>
    </div>
  );
}
