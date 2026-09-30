import { useState } from 'react';
import { aiAPI, companyAPI } from '../../api';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { BrainCircuit, Send, Loader } from 'lucide-react';

export default function AICoachPage() {
  const [tab, setTab] = useState('doubt');
  const [doubt, setDoubt] = useState({ question:'', type:'aptitude' });
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [planForm, setPlanForm] = useState({ targetCompany:'TCS', availableHours:2, targetDate:'' });

  const { data: companies } = useQuery({ queryKey:['companies'], queryFn:()=>companyAPI.getAll().then(r=>r.data.data) });

  const askDoubt = async () => {
    if (!doubt.question.trim()) { toast.error('Enter a question'); return; }
    setLoading(true); setAnswer('');
    try {
      const { data } = await aiAPI.askDoubt(doubt);
      setAnswer(data.data.answer);
    } catch { toast.error('AI is unavailable. Check your Groq key.'); }
    finally { setLoading(false); }
  };

  const generatePlan = async () => {
    setLoading(true); setPlan(null);
    try {
      const { data } = await aiAPI.generatePlan(planForm);
      setPlan(data.data);
    } catch { toast.error('Failed to generate plan'); }
    finally { setLoading(false); }
  };

  
}
