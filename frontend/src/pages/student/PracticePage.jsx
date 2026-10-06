import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { questionAPI, companyAPI, topicAPI } from '../../api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, BookmarkPlus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PracticePage() {
  const [filters, setFilters] = useState({ company:'', topic:'', category:'', difficulty:'', page:1 });
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);

  const { data: companies } = useQuery({ queryKey:['companies'], queryFn:()=>companyAPI.getAll().then(r=>r.data.data) });
  const { data: topics }    = useQuery({ queryKey:['topics',filters.company], queryFn:()=>filters.company?topicAPI.getAll(filters.company).then(r=>r.data.data):Promise.resolve([]) });
  const { data, isLoading } = useQuery({
    queryKey:['questions',filters],
    queryFn:()=>questionAPI.getAll({...filters,limit:10}).then(r=>r.data),
  });

  const questions = data?.data || [];
  const q = questions[currentQ];

  const handleAnswer = async (idx) => {
    if (answered !== null) return;
    setSelected(idx);
    try {
      const { data: res } = await questionAPI.submit({ questionId: q._id, selectedIndex: idx });
      setAnswered(res.data);
      if (res.data.isCorrect) toast.success(`+10 XP earned!`);
    } catch { toast.error('Failed to submit'); }
  };

  const next = () => {
    if (currentQ < questions.length - 1) { setCurrentQ(c=>c+1); setSelected(null); setAnswered(null); }
    else { setFilters(f=>({...f,page:f.page+1})); setCurrentQ(0); setSelected(null); setAnswered(null); }
  };

  const setFilter = (k,v) => { setFilters(f=>({...f,[k]:v,page:1})); setCurrentQ(0); setSelected(null); setAnswered(null); };

  
}
