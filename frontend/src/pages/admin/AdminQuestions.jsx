import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionAPI, companyAPI, topicAPI } from '../../api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, CheckCircle } from 'lucide-react';

const EMPTY = { question:'', options:['','','',''], correctIndex:0, explanation:'', difficulty:'medium', category:'aptitude', company:'', topic:'', isPYQ:false };

export default function AdminQuestions() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [filters, setFilters] = useState({ company:'', category:'', page:1, limit:20 });

  const { data: companies } = useQuery({ queryKey:['companies'], queryFn:()=>companyAPI.getAll().then(r=>r.data.data) });
  const { data: topics }    = useQuery({ queryKey:['topics',form.company], queryFn:()=>form.company?topicAPI.getAll(form.company).then(r=>r.data.data):Promise.resolve([]) });
  const { data, isLoading } = useQuery({ queryKey:['questions',filters], queryFn:()=>questionAPI.getAll(filters).then(r=>r.data) });

  const createMut = useMutation({ mutationFn:questionAPI.create, onSuccess:()=>{ toast.success('Question added'); qc.invalidateQueries(['questions']); closeModal(); }, onError:e=>toast.error(e.response?.data?.message||'Error') });
  const updateMut = useMutation({ mutationFn:({id,d})=>questionAPI.update(id,d), onSuccess:()=>{ toast.success('Updated'); qc.invalidateQueries(['questions']); closeModal(); } });
  const deleteMut = useMutation({ mutationFn:questionAPI.delete, onSuccess:()=>{ toast.success('Deleted'); qc.invalidateQueries(['questions']); } });

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit   = (q) => { setEditing(q); setForm({...q}); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); setForm(EMPTY); };

  const setOption = (i, val) => setForm(p=>{ const opts=[...p.options]; opts[i]=val; return {...p,options:opts}; });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) updateMut.mutate({ id:editing._id, d:form });
    else createMut.mutate(form);
  };

  const questions = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-black text-white">MCQ Questions</h1>
          <p className="text-gray-400 mt-1">{data?.pagination?.total || 0} total questions</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all">
          <Plus size={16}/> Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select className="bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none"
          value={filters.company} onChange={e=>setFilters(p=>({...p,company:e.target.value,page:1}))}>
          <option value="">All Companies</option>
          {companies?.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select className="bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none"
          value={filters.category} onChange={e=>setFilters(p=>({...p,category:e.target.value,page:1}))}>
          <option value="">All Categories</option>
          {['aptitude','reasoning','english','interview'].map(c=><option key={c} value={c} className="capitalize">{c}</option>)}
        </select>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>{['Question','Category','Difficulty','Accuracy','Actions'].map(h=>(
              <th key={h} className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-500">Loading…</td></tr>
            ) : questions.map(q => (
              <tr key={q._id} className="border-t border-gray-800 hover:bg-gray-800/50">
                <td className="px-5 py-4 max-w-xs">
                  <p className="text-white text-sm truncate">{q.question}</p>
                  {q.isPYQ && <span className="text-xs text-yellow-500">PYQ</span>}
                </td>
                <td className="px-5 py-4"><span className="text-xs font-semibold text-gray-400 capitalize">{q.category}</span></td>
                <td className="px-5 py-4"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${q.difficulty==='easy'?'bg-green-900/50 text-green-400':q.difficulty==='medium'?'bg-yellow-900/50 text-yellow-400':'bg-red-900/50 text-red-400'}`}>{q.difficulty}</span></td>
                <td className="px-5 py-4 text-gray-400 text-sm">{q.attemptCount>0?Math.round((q.correctCount/q.attemptCount)*100)+'%':'—'}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button onClick={()=>openEdit(q)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"><Edit2 size={14}/></button>
                    <button onClick={()=>{ if(window.confirm('Delete?')) deleteMut.mutate(q._id); }} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-all"><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!questions.length && !isLoading && <div className="text-center py-10 text-gray-500">No questions found.</div>}
      </div>

      {/* Pagination */}
      {data?.pagination && (
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Page {filters.page} of {data.pagination.pages}</span>
          <div className="flex gap-2">
            <button disabled={filters.page<=1} onClick={()=>setFilters(p=>({...p,page:p.page-1}))} className="px-3 py-1.5 bg-gray-800 rounded-lg disabled:opacity-40">← Prev</button>
            <button disabled={filters.page>=data.pagination.pages} onClick={()=>setFilters(p=>({...p,page:p.page+1}))} className="px-3 py-1.5 bg-gray-800 rounded-lg disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl my-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="font-bold text-white text-lg">{editing?'Edit':'Add'} Question</h2>
              <button onClick={closeModal}><X size={20} className="text-gray-400"/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Company*</label>
                  <select required className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    value={form.company} onChange={e=>setForm(p=>({...p,company:e.target.value,topic:''}))}>
                    <option value="">Select…</option>
                    {companies?.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Topic*</label>
                  <select required className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    value={form.topic} onChange={e=>setForm(p=>({...p,topic:e.target.value}))}>
                    <option value="">Select…</option>
                    {topics?.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Category*</label>
                  <select required className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                    {['aptitude','reasoning','english','interview'].map(c=><option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Question*</label>
                <textarea required rows={3} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
                  value={form.question} onChange={e=>setForm(p=>({...p,question:e.target.value}))} />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400">Options* (click ✓ to mark correct)</label>
                {form.options.map((opt,i)=>(
                  <div key={i} className="flex gap-2 items-center">
                    <button type="button" onClick={()=>setForm(p=>({...p,correctIndex:i}))}
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${form.correctIndex===i?'bg-green-500 text-white':'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                      {String.fromCharCode(65+i)}
                    </button>
                    <input required className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                      placeholder={`Option ${String.fromCharCode(65+i)}`} value={opt} onChange={e=>setOption(i,e.target.value)} />
                    {form.correctIndex===i && <CheckCircle size={16} className="text-green-400 shrink-0"/>}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Difficulty</label>
                  <select className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    value={form.difficulty} onChange={e=>setForm(p=>({...p,difficulty:e.target.value}))}>
                    {['easy','medium','hard'].map(d=><option key={d} value={d} className="capitalize">{d}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input type="checkbox" checked={form.isPYQ} onChange={e=>setForm(p=>({...p,isPYQ:e.target.checked}))} className="w-4 h-4 accent-primary" />
                    <span className="text-sm text-gray-300">Previous Year Question</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Explanation</label>
                <textarea rows={2} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
                  value={form.explanation} onChange={e=>setForm(p=>({...p,explanation:e.target.value}))} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all">Cancel</button>
                <button type="submit" disabled={createMut.isPending||updateMut.isPending}
                  className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-bold transition-all">
                  {editing?'Update':'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
