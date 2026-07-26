import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { testAPI, companyAPI } from '../../api';
import { useNavigate } from 'react-router-dom';
import { Clock, FileText, Trophy, Play } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MockTestPage() {
  const [companyFilter, setCompanyFilter] = useState('');
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [qIndex, setQIndex] = useState(0);
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const { data: companies } = useQuery({ queryKey:['companies'], queryFn:()=>companyAPI.getAll().then(r=>r.data.data) });
  const { data: tests, isLoading } = useQuery({
    queryKey:['tests',companyFilter],
    queryFn:()=>testAPI.getAll(companyFilter?{company:companyFilter}:{}).then(r=>r.data.data),
  });

  const startTest = async (test) => {
    const { data } = await testAPI.getById(test._id);
    setActiveTest(data.data);
    setAnswers({});
    setQIndex(0);
  };

  const handleAnswer = (qId, idx) => setAnswers(p => ({...p,[qId]:idx}));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answerArray = activeTest.questions.map(q => ({
        questionId: q._id,
        selected: answers[q._id] ?? null,
        timeTaken: Math.round((Date.now()-startTime)/1000/activeTest.questions.length),
      }));
      const { data } = await testAPI.submit(activeTest._id, { answers: answerArray, timeTaken: Math.round((Date.now()-startTime)/1000) });
      toast.success(`Test submitted! Score: ${data.data.result.percentage}%`);
      navigate(`/tests/${activeTest._id}/result`, { state: { result: data.data.result, test: activeTest } });
    } catch { toast.error('Submission failed'); }
    finally { setSubmitting(false); }
  };

  if (activeTest) {
    const q = activeTest.questions[qIndex];
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-bold text-lg">{activeTest.title}</h1>
            <span className="text-sm text-gray-500">{qIndex+1}/{activeTest.questions.length}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full mb-6">
            <div className="h-full bg-primary rounded-full transition-all" style={{width:`${((qIndex+1)/activeTest.questions.length)*100}%`}} />
          </div>

          <h2 className="text-base font-semibold mb-6 leading-relaxed">{q.question}</h2>

          <div className="space-y-3 mb-8">
            {q.options?.map((opt, idx) => (
              <div key={idx} onClick={()=>handleAnswer(q._id,idx)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers[q._id]===idx?'border-primary bg-primary/5':'border-gray-200 hover:border-gray-300'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${answers[q._id]===idx?'bg-primary text-white':'bg-gray-100 text-gray-600'}`}>
                  {String.fromCharCode(65+idx)}
                </span>
                <span className="text-sm">{opt}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button onClick={()=>setQIndex(i=>Math.max(0,i-1))} disabled={qIndex===0} className="btn-ghost disabled:opacity-40">← Prev</button>
            {qIndex < activeTest.questions.length-1
              ? <button onClick={()=>setQIndex(i=>i+1)} className="btn-primary">Next →</button>
              : <button onClick={handleSubmit} disabled={submitting} className="btn-primary bg-green-500 hover:bg-green-600">{submitting?'Submitting…':'Submit Test'}</button>}
          </div>
        </div>

        {/* Question navigator */}
        <div className="card">
          <div className="font-bold text-sm mb-3">Questions</div>
          <div className="flex flex-wrap gap-2">
            {activeTest.questions.map((_,i) => (
              <button key={i} onClick={()=>setQIndex(i)}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${i===qIndex?'bg-primary text-white':answers[activeTest.questions[i]._id]!==undefined?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>
                {i+1}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-3xl font-black text-ink">Mock Tests</h1>
      <p className="text-gray-500 mt-1">Company-pattern tests with detailed analysis</p></div>

      <div className="flex gap-3">
        <select className="input w-48" value={companyFilter} onChange={e=>setCompanyFilter(e.target.value)}>
          <option value="">All Companies</option>
          {companies?.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tests?.map(t => (
            <div key={t._id} className="card hover:border-primary/30 hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${t.type==='coding'?'bg-blue-50 text-blue-600':'bg-purple-50 text-purple-600'}`}>{t.type}</span>
                {t.isPremium && <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-50 text-yellow-600">Premium</span>}
              </div>
              <h3 className="font-bold text-base mb-2">{t.title}</h3>
              <div className="flex gap-4 text-xs text-gray-400 mb-5">
                <span className="flex items-center gap-1"><Clock size={12}/> {t.duration} min</span>
                <span className="flex items-center gap-1"><FileText size={12}/> {t.questions?.length||0} Qs</span>
                <span className="flex items-center gap-1"><Trophy size={12}/> {t.attemptCount} attempts</span>
              </div>
              <button onClick={()=>startTest(t)} className="btn-primary w-full flex items-center justify-center gap-2">
                <Play size={14}/> Start Test
              </button>
            </div>
          ))}
          {!tests?.length && <div className="col-span-3 text-center py-20 text-gray-400">No tests available yet.</div>}
        </div>
      )}
    </div>
  );
}
