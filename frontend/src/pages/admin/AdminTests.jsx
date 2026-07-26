import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testAPI, companyAPI } from '../../api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const EMPTY = { title:'', company:'', type:'mixed', duration:60, instructions:'', totalMarks:0, passingMarks:0, isPremium:false };

export default function AdminTests() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const { data: companies } = useQuery({ queryKey:['companies'], queryFn:()=>companyAPI.getAll().then(r=>r.data.data) });
  const { data, isLoading }  = useQuery({ queryKey:['tests-admin'], queryFn:()=>testAPI.getAll({}).then(r=>r.data.data) });

  const createMut = useMutation({ mutationFn:testAPI.create, onSuccess:()=>{ toast.success('Test created'); qc.invalidateQueries(['tests-admin']); closeModal(); }, onError:e=>toast.error(e.response?.data?.message||'Error') });
  const updateMut = useMutation({ mutationFn:({id,d})=>testAPI.update(id,d), onSuccess:()=>{ toast.success('Updated'); qc.invalidateQueries(['tests-admin']); closeModal(); } });
  const deleteMut = useMutation({ mutationFn:(id)=>testAPI.update(id,{isActive:false}), onSuccess:()=>{ toast.success('Deleted'); qc.invalidateQueries(['tests-admin']); } });

  const closeModal = () => { setModal(false); setEditing(null); setForm(EMPTY); };
  const openEdit = (t) => { setEditing(t); setForm({...t,company:t.company?._id||t.company}); setModal(true); };

  const tests = data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-3xl font-black text-white">Mock Tests</h1><p className="text-gray-400 mt-1">{tests.length} tests</p></div>
        <button onClick={()=>{ setEditing(null); setForm(EMPTY); setModal(true); }} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all"><Plus size={16}/>Create Test</button>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800"><tr>{['Title','Company','Type','Duration','Attempts','Actions'].map(h=><th key={h} className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {isLoading?<tr><td colSpan={6} className="text-center py-10 text-gray-500">Loading…</td></tr>:tests.map(t=>(
              <tr key={t._id} className="border-t border-gray-800 hover:bg-gray-800/50">
                <td className="px-5 py-4 text-white text-sm font-medium">{t.title}</td>
                <td className="px-5 py-4 text-gray-400 text-sm">{t.company?.name||'—'}</td>
                <td className="px-5 py-4"><span className="text-xs font-bold text-purple-400 bg-purple-900/30 px-2.5 py-1 rounded-full capitalize">{t.type}</span></td>
                <td className="px-5 py-4 text-gray-400 text-sm">{t.duration} min</td>
                <td className="px-5 py-4 text-gray-400 text-sm">{t.attemptCount}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button onClick={()=>openEdit(t)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"><Edit2 size={14}/></button>
                    <button onClick={()=>{ if(window.confirm('Delete?')) deleteMut.mutate(t._id); }} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg"><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!tests.length && !isLoading && <div className="text-center py-10 text-gray-500">No tests yet.</div>}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="font-bold text-white text-lg">{editing?'Edit':'Create'} Mock Test</h2>
              <button onClick={closeModal}><X size={20} className="text-gray-400"/></button>
            </div>
            <form onSubmit={e=>{ e.preventDefault(); editing?updateMut.mutate({id:editing._id,d:form}):createMut.mutate(form); }} className="p-6 space-y-4">
              <div><label className="block text-xs font-bold text-gray-400 mb-1">Title*</label><input required className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold text-gray-400 mb-1">Company*</label>
                  <select required className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none" value={form.company} onChange={e=>setForm(p=>({...p,company:e.target.value}))}>
                    <option value="">Select…</option>{companies?.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-bold text-gray-400 mb-1">Type</label>
                  <select className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                    {['aptitude','english','mixed','coding','full'].map(t=><option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-bold text-gray-400 mb-1">Duration (min)</label><input type="number" className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none" value={form.duration} onChange={e=>setForm(p=>({...p,duration:+e.target.value}))}/></div>
                <div><label className="block text-xs font-bold text-gray-400 mb-1">Total Marks</label><input type="number" className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none" value={form.totalMarks} onChange={e=>setForm(p=>({...p,totalMarks:+e.target.value}))}/></div>
              </div>
              <div><label className="block text-xs font-bold text-gray-400 mb-1">Instructions</label><textarea rows={2} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none resize-none" value={form.instructions} onChange={e=>setForm(p=>({...p,instructions:e.target.value}))}/></div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isPremium} onChange={e=>setForm(p=>({...p,isPremium:e.target.checked}))} className="accent-primary w-4 h-4"/><span className="text-sm text-gray-300">Premium only</span></label>
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
