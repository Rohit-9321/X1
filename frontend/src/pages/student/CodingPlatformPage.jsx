import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { codingAPI, companyAPI } from '../../api';
import { Code2, CheckCircle } from 'lucide-react';

export default function CodingPlatformPage() {
  const [filters, setFilters] = useState({ company:'', difficulty:'' });
  const { data: companies } = useQuery({ queryKey:['companies'], queryFn:()=>companyAPI.getAll().then(r=>r.data.data) });
  const { data, isLoading } = useQuery({
    queryKey:['coding',filters],
    queryFn:()=>codingAPI.getAll(filters).then(r=>r.data),
  });
  const problems = data?.data || [];

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-3xl font-black text-ink">Coding Platform</h1>
      <p className="text-gray-500 mt-1">Practice company-tagged coding problems</p></div>

      <div className="flex gap-3 flex-wrap">
        <select className="input w-44" value={filters.company} onChange={e=>setFilters(p=>({...p,company:e.target.value}))}>
          <option value="">All Companies</option>
          {companies?.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select className="input w-36" value={filters.difficulty} onChange={e=>setFilters(p=>({...p,difficulty:e.target.value}))}>
          <option value="">All Difficulty</option>
          {['easy','medium','hard'].map(d=><option key={d} value={d} className="capitalize">{d}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['#','Title','Difficulty','Companies','Acceptance'].map(h=>(
                <th key={h} className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {problems.map((p,i) => (
                <tr key={p._id} className="border-b border-gray-50 hover:bg-primary/2 transition-colors group">
                  <td className="px-5 py-3.5 text-sm text-gray-400">{i+1}</td>
                  <td className="px-5 py-3.5">
                    <Link to={`/coding/${p.slug}`} className="font-semibold text-sm text-ink group-hover:text-primary transition-colors">{p.title}</Link>
                  </td>
                  <td className="px-5 py-3.5"><span className={`badge-${p.difficulty}`}>{p.difficulty}</span></td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1 flex-wrap">
                      {p.company?.map(c=>(
                        <span key={c._id} className="text-xs px-2 py-0.5 rounded font-semibold" style={{background:`${c.color}18`,color:c.color}}>{c.name}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-green-600">{p.acceptanceRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!problems.length && <div className="text-center py-16 text-gray-400">No problems found.</div>}
        </div>
      )}
    </div>
  );
}
