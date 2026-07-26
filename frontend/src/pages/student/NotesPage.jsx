import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { noteAPI, companyAPI } from '../../api';
import { FileText, Film, Image, BookOpen, ExternalLink } from 'lucide-react';

const TYPE_ICONS = { pdf:FileText, video:Film, image:Image, youtube:Film, text:BookOpen };
const TYPE_COLORS = { pdf:'text-red-500', video:'text-blue-500', image:'text-green-500', youtube:'text-red-500', text:'text-gray-500' };

export default function NotesPage() {
  const [companyFilter, setCompanyFilter] = useState('');
  const { data: companies } = useQuery({ queryKey:['companies'], queryFn:()=>companyAPI.getAll().then(r=>r.data.data) });
  const { data: notes, isLoading } = useQuery({
    queryKey:['notes',companyFilter],
    queryFn:()=>noteAPI.getAll(companyFilter?{company:companyFilter}:{}).then(r=>r.data.data),
  });

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-3xl font-black">Notes & Resources</h1>
      <p className="text-gray-500 mt-1">Study materials uploaded by instructors</p></div>

      <select className="input w-48" value={companyFilter} onChange={e=>setCompanyFilter(e.target.value)}>
        <option value="">All Companies</option>
        {companies?.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
      </select>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes?.map(n => {
            const Icon = TYPE_ICONS[n.type] || BookOpen;
            return (
              <div key={n._id} className="card hover:border-primary/30 hover:-translate-y-0.5 transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <Icon size={20} className={TYPE_COLORS[n.type]}/>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-ink truncate">{n.title}</h3>
                    <span className="text-xs text-gray-400 capitalize">{n.type}</span>
                  </div>
                </div>
                {n.content && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{n.content}</p>}
                {n.fileUrl && (
                  <a href={n.fileUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline mt-2">
                    <ExternalLink size={12}/> Open {n.type.toUpperCase()}
                  </a>
                )}
              </div>
            );
          })}
          {!notes?.length && <div className="col-span-3 text-center py-16 text-gray-400">No notes available.</div>}
        </div>
      )}
    </div>
  );
}
