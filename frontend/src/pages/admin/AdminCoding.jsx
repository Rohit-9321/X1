import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { codingAPI, companyAPI } from '../../api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const EMPTY = { title:'', description:'', difficulty:'medium', tags:[], constraints:'', company:[], examples:[{input:'',output:'',explanation:''}], testCases:[{input:'',expectedOutput:'',isHidden:false}], timeLimit:2, memoryLimit:256 };

export default function AdminCoding() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const { data: companies } = useQuery({ queryKey:['companies'], queryFn:()=>companyAPI.getAll().then(r=>r.data.data) });
  const { data, isLoading } = useQuery({ queryKey:['coding-admin'], queryFn:()=>codingAPI.getAll({limit:50}).then(r=>r.data) });

  const createMut = useMutation({ mutationFn:codingAPI.create, onSuccess:()=>{ toast.success('Problem created'); qc.invalidateQueries(['coding-admin']); closeModal(); }, onError:e=>toast.error(e.response?.data?.message||'Error') });
  const updateMut = useMutation({ mutationFn:({id,d})=>codingAPI.update(id,d), onSuccess:()=>{ toast.success('Updated'); qc.invalidateQueries(['coding-admin']); closeModal(); } });
  const deleteMut = useMutation({ mutationFn:(id)=>codingAPI.update(id,{isActive:false}), onSuccess:()=>{ toast.success('Deleted'); qc.invalidateQueries(['coding-admin']); } });

  const closeModal = () => { setModal(false); setEditing(null); setForm(EMPTY); };
  const openEdit   = (p) => { setEditing(p); setForm({...p, company:p.company?.map(c=>c._id)||[]}); setModal(true); };

  const addTC  = () => setForm(p=>({...p,testCases:[...p.testCases,{input:'',expectedOutput:'',isHidden:false}]}));
  const setTC  = (i,k,v) => setForm(p=>{ const t=[...p.testCases]; t[i]={...t[i],[k]:v}; return {...p,testCases:t}; });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {...form, tags: typeof form.tags==='string'?form.tags.split(',').map(s=>s.trim()):form.tags};
    if (editing) updateMut.mutate({id:editing._id,d:payload});
    else createMut.mutate(payload);
  };

  const problems = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-3xl font-black text-white">Coding Problems</h1><p className="text-gray-400 mt-1">{problems.length} problems</p></div>
        <button onClick={()=>{ setEditing(null); setForm(EMPTY); setModal(true); }} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all"><Plus size={16}/>Add Problem</button>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800"><tr>{['Title','Difficulty','Companies','Acceptance','Actions'].map(h=><th key={h} className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {isLoading?<tr><td colSpan={5} className="text-center py-10 text-gray-500">Loading…</td></tr>:problems.map(p=>(
              <tr key={p._id} className="border-t border-gray-800 hover:bg-gray-800/50">
                <td className="px-5 py-4 text-white text-sm font-medium">{p.title}</td>
                <td className="px-5 py-4"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.difficulty==='easy'?'bg-green-900/50 text-green-400':p.difficulty==='medium'?'bg-yellow-900/50 text-yellow-400':'bg-red-900/50 text-red-400'}`}>{p.difficulty}</span></td>
                <td className="px-5 py-4 text-gray-400 text-sm">{p.company?.map(c=>c.name).join(', ')||'—'}</td>
                <td className="px-5 py-4 text-green-400 text-sm">{p.acceptanceRate||'0'}%</td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button onClick={()=>openEdit(p)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"><Edit2 size={14}/></button>
                    <button onClick={()=>{ if(window.confirm('Delete?')) deleteMut.mutate(p._id); }} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-all"><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl my-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="font-bold text-white text-lg">{editing?'Edit':'Add'} Coding Problem</h2>
              <button onClick={closeModal}><X size={20} className="text-gray-400"/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Title*</label>
                <input required className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Difficulty</label>
                  <select className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none" value={form.difficulty} onChange={e=>setForm(p=>({...p,difficulty:e.target.value}))}>
                    {['easy','medium','hard'].map(d=><option key={d} value={d} className="capitalize">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Tags (comma-sep)</label>
                  <input className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none" placeholder="arrays, dp…"
                    value={Array.isArray(form.tags)?form.tags.join(','):form.tags} onChange={e=>setForm(p=>({...p,tags:e.target.value}))}/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Description*</label>
                <textarea required rows={4} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none resize-none" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Companies</label>
                <select multiple className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none h-24"
                  value={form.company} onChange={e=>setForm(p=>({...p,company:[...e.target.selectedOptions].map(o=>o.value)}))}>
                  {companies?.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2"><label className="text-xs font-bold text-gray-400">Test Cases</label><button type="button" onClick={addTC} className="text-xs text-primary-400 hover:text-primary-300 font-semibold">+ Add</button></div>
                {form.testCases.map((tc,i)=>(
                  <div key={i} className="grid grid-cols-2 gap-2 mb-2 p-3 bg-gray-800/50 rounded-xl">
                    <div><label className="text-xs text-gray-500 mb-1 block">Input</label><input className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none" value={tc.input} onChange={e=>setTC(i,'input',e.target.value)}/></div>
                    <div><label className="text-xs text-gray-500 mb-1 block">Expected Output</label><input className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none" value={tc.expectedOutput} onChange={e=>setTC(i,'expectedOutput',e.target.value)}/></div>
                    <label className="col-span-2 flex items-center gap-2 text-xs text-gray-400 cursor-pointer"><input type="checkbox" checked={tc.isHidden} onChange={e=>setTC(i,'isHidden',e.target.checked)} className="accent-primary"/>Hidden test case</label>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all">Cancel</button>
                <button type="submit" disabled={createMut.isPending||updateMut.isPending} className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-bold transition-all">{editing?'Update':'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
