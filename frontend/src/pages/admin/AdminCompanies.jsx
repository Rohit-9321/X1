import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyAPI } from '../../api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const EMPTY = { name:'', description:'', color:'#5B3BF5', price:299, category:'service', difficulty:'medium', website:'' };

export default function AdminCompanies() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const { data: companies, isLoading } = useQuery({ queryKey:['companies'], queryFn:()=>companyAPI.getAll().then(r=>r.data.data) });

  const createMut = useMutation({
    mutationFn: companyAPI.create,
    onSuccess: () => { toast.success('Company created'); qc.invalidateQueries(['companies']); closeModal(); },
    onError: e => toast.error(e.response?.data?.message || 'Error'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => companyAPI.update(id, data),
    onSuccess: () => { toast.success('Company updated'); qc.invalidateQueries(['companies']); closeModal(); },
    onError: e => toast.error(e.response?.data?.message || 'Error'),
  });
  const deleteMut = useMutation({
    mutationFn: companyAPI.delete,
    onSuccess: () => { toast.success('Company deleted'); qc.invalidateQueries(['companies']); },
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name:c.name, description:c.description||'', color:c.color||'#5B3BF5', price:c.price, category:c.category, difficulty:c.difficulty, website:c.website||'' }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); setForm(EMPTY); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) updateMut.mutate({ id: editing._id, data: form });
    else createMut.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-black text-white">Companies</h1>
          <p className="text-gray-400 mt-1">Manage company preparation tracks</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all">
          <Plus size={16}/> Add Company
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>{['Company','Category','Difficulty','Price','Students','Actions'].map(h => (
                <th key={h} className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {companies?.map(c => (
                <tr key={c._id} className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0" style={{background:c.color}}>
                        {c.name.slice(0,3).toUpperCase()}
                      </div>
                      <span className="font-semibold text-white text-sm">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-sm capitalize">{c.category}</td>
                  <td className="px-5 py-4"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.difficulty==='easy'?'bg-green-900/50 text-green-400':c.difficulty==='medium'?'bg-yellow-900/50 text-yellow-400':'bg-red-900/50 text-red-400'}`}>{c.difficulty}</span></td>
                  <td className="px-5 py-4 text-white font-bold text-sm">₹{c.price}</td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{c.totalStudents || 0}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={()=>openEdit(c)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"><Edit2 size={14}/></button>
                      <button onClick={()=>{ if(window.confirm('Delete this company?')) deleteMut.mutate(c._id); }} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-all"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="font-bold text-white text-lg">{editing ? 'Edit Company' : 'Add Company'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Company Name*</label>
                  <input required className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500"
                    value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Category</label>
                  <select className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                    value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                    {['service','product','startup'].map(c=><option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Difficulty</label>
                  <select className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                    value={form.difficulty} onChange={e=>setForm(p=>({...p,difficulty:e.target.value}))}>
                    {['easy','medium','hard'].map(d=><option key={d} value={d} className="capitalize">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Price (₹)</label>
                  <input type="number" className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none"
                    value={form.price} onChange={e=>setForm(p=>({...p,price:+e.target.value}))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Brand Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" className="w-10 h-10 rounded-lg border-0 bg-transparent cursor-pointer"
                      value={form.color} onChange={e=>setForm(p=>({...p,color:e.target.value}))} />
                    <span className="text-gray-400 text-sm font-mono">{form.color}</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Description</label>
                  <textarea rows={2} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
                    value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all">Cancel</button>
                <button type="submit" disabled={createMut.isPending||updateMut.isPending}
                  className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-bold transition-all">
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
