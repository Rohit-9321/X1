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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black flex items-center gap-3">
          <BrainCircuit size={32} className="text-primary"/>AI Coach
        </h1>
        <p className="text-gray-500 mt-1">Powered by Groq — get instant help and personalised plans</p>
      </div>

      <div className="flex gap-2">
        {[['doubt','AI Doubt Solver'],['plan','Study Plan Generator']].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab===t?'bg-primary text-white':'bg-white border border-gray-200 text-gray-600 hover:border-primary'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'doubt' && (
        <div className="card space-y-4">
          <h2 className="font-bold text-base">Ask Any Doubt</h2>
          <select className="input" value={doubt.type} onChange={e=>setDoubt(p=>({...p,type:e.target.value}))}>
            {['aptitude','coding','reasoning','english'].map(t=>(
              <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase()+t.slice(1)}</option>
            ))}
          </select>
          <textarea className="input" rows={4} placeholder="Type your question here… e.g. 'Explain the approach to solve probability problems in TCS NQT'"
            value={doubt.question} onChange={e=>setDoubt(p=>({...p,question:e.target.value}))} />
          <button onClick={askDoubt} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <><Loader size={16} className="animate-spin"/> Thinking…</> : <><Send size={16}/> Ask AI</>}
          </button>
          {answer && (
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 font-bold text-sm text-primary mb-3"><BrainCircuit size={16}/> AI Answer</div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{answer}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'plan' && (
        <div className="card space-y-4">
          <h2 className="font-bold text-base">Generate Personalised Study Plan</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Company</label>
              <select className="input" value={planForm.targetCompany} onChange={e=>setPlanForm(p=>({...p,targetCompany:e.target.value}))}>
                {companies?.map(c=><option key={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Hours/day available</label>
              <input type="number" className="input" min={1} max={12} value={planForm.availableHours}
                onChange={e=>setPlanForm(p=>({...p,availableHours:+e.target.value}))} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Date (optional)</label>
              <input type="date" className="input" value={planForm.targetDate}
                onChange={e=>setPlanForm(p=>({...p,targetDate:e.target.value}))} />
            </div>
          </div>
          <button onClick={generatePlan} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <><Loader size={16} className="animate-spin"/>Generating…</> : <><BrainCircuit size={16}/>Generate Plan</>}
          </button>

          {plan && (
            <div className="space-y-4 mt-4">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p className="text-sm text-gray-700 font-medium">{plan.summary}</p>
              </div>
              {plan.weeks?.map(w => (
                <div key={w.week} className="card border border-gray-100">
                  <h3 className="font-bold text-sm mb-3 text-primary">Week {w.week}: {w.focus}</h3>
                  <div className="space-y-2">
                    {w.days?.map(d => (
                      <div key={d.day} className="flex items-start gap-3 text-sm">
                        <span className="font-bold text-gray-400 w-12 shrink-0 text-xs pt-0.5">{d.day?.slice(0,3).toUpperCase()}</span>
                        <div className="flex flex-wrap gap-2">
                          {d.tasks?.map((t,i) => (
                            <span key={i} className="px-2.5 py-1 bg-gray-50 rounded-lg text-xs font-medium">{t.topic} ({t.duration})</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {plan.tips?.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                  <div className="font-bold text-sm text-yellow-800 mb-2">💡 Tips</div>
                  <ul className="space-y-1">{plan.tips.map((t,i)=><li key={i} className="text-xs text-yellow-700">• {t}</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
