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

  
}
