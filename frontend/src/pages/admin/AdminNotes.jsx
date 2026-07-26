import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noteAPI, companyAPI, topicAPI } from '../../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, FileText, Film, BookOpen } from 'lucide-react';

export default function AdminNotes() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title:'', type:'pdf', company:'', topic:'', content:'', order:0 });
  const [file, setFile] = useState(null);
  const [companyFilter, setCompanyFilter] = useState('');

  const { data: companies } = useQuery({ queryKey:['companies'], queryFn:()=>companyAPI.getAll().then(r=>r.data.data) });
  const { data: topics }    = useQuery({ queryKey:['topics',form.company], queryFn:()=>form.company?topicAPI.getAll(form.company).then(r=>r.data.data):Promise.resolve([]) });
  const { data: notes, isLoading } = useQuery({ queryKey:['notes-admin',companyFilter], queryFn:()=>noteAPI.getAll(companyFilter?{company:companyFilter}:{}).then(r=>r.data.data) });

  const createMut = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v])=>fd.append(k,v));
      if (file) fd.append('file', file);
      return noteAPI.create(fd);
    },
    onSuccess: () => { toast.success('Note added'); qc.invalidateQueries(['notes-admin']); setModal(false); setForm({title:'',type:'pdf',company:'',topic:'',content:'',order:0}); setFile(null); },
    onError: e => toast.error(e.response?.data?.message||'Error'),
  });
  const deleteMut = useMutation({ mutationFn:noteAPI.delete, onSuccess:()=>{ toast.success('Deleted'); qc.invalidateQueries(['notes-admin']); } });

  const TYPE_ICONS = { pdf:FileText, video:Film, youtube:Film, image:FileText, text:BookOpen };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-3xl font-black text-white">Notes & Resources</h1><p className="text-gray-400 mt-1">Upload PDFs, videos, YouTube links</p></div>
        <button onClick={()=>setModal(true)} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all"><Plus size={16}/>Add Note</button>
      </div>

      <select className="bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none" value={companyFilter} onChange={e=>setCompanyFilter(e.target.value)}>
        <option value="">All Companies</option>{companies?.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
      </select>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading?<div className="col-span-3 text-center py-10 text-gray-500">Loading…</div>:notes?.map(n=>{
          const Icon = TYPE_ICONS[n.type]||BookOpen;
          return (
            <div key={n._id} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center"><Icon size={18} className="text-primary-400"/></div>
                <button onClick={()=>{ if(window.confirm('Delete?')) deleteMut.mutate(n._id); }} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-all"><Trash2 size={14}/></button>
              </div>
              <h3 className="font-semibold text-white text-sm mb-1">{n.title}</h3>
              <span className="text-xs font-bold text-gray-500 uppercase">{n.type}</span>
              {n.fileUrl && <a href={n.fileUrl} target="_blank" rel="noreferrer" className="block text-xs text-primary-400 hover:underline mt-2">View file →</a>}
            </div>
          );
        })}
        {!notes?.length && !isLoading && <div className="col-span-3 text-center py-10 text-gray-500">No notes yet.</div>}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="font-bold text-white text-lg">Add Note / Resource</h2>
              <button onClick={()=>setModal(false)}><X size={20} className="text-gray-400"/></button>
            </div>
            <form onSubmit={e=>{e.preventDefault();createMut.mutate();}} className="p-6 space-y-4">
              <div><label className="block text-xs font-bold text-gray-400 mb-1">Title*</label><input required className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold text-gray-400 mb-1">Company*</label>
                  <select required className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none" value={form.company} onChange={e=>setForm(p=>({...p,company:e.target.value}))}>
                    <option value="">Select…</option>{companies?.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-bold text-gray-400 mb-1">Type</label>
                  <select className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                    {['pdf','image','video','youtube','text'].map(t=><option key={t} value={t}>{t.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
              {(form.type==='youtube'||form.type==='text') ? (
                <div><label className="block text-xs font-bold text-gray-400 mb-1">{form.type==='youtube'?'YouTube URL':'Content'}</label>
                  <textarea rows={3} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none resize-none" value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))}/></div>
              ) : (
                <div><label className="block text-xs font-bold text-gray-400 mb-1">Upload File</label>
                  <input type="file" className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-500 file:text-white file:font-semibold hover:file:bg-primary-600 cursor-pointer" onChange={e=>setFile(e.target.files[0])}/></div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setModal(false)} className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all">Cancel</button>
                <button type="submit" disabled={createMut.isPending} className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-bold transition-all">{createMut.isPending?'Uploading…':'Add Note'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
