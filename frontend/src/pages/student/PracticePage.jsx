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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-ink">Practice Questions</h1>
        <p className="text-gray-500 mt-1">Filter by company, topic and difficulty</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select className="input" value={filters.company} onChange={e=>setFilter('company',e.target.value)}>
            <option value="">All Companies</option>
            {companies?.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select className="input" value={filters.topic} onChange={e=>setFilter('topic',e.target.value)}>
            <option value="">All Topics</option>
            {topics?.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
          <select className="input" value={filters.category} onChange={e=>setFilter('category',e.target.value)}>
            <option value="">All Categories</option>
            {['aptitude','reasoning','english','interview'].map(c=><option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
          <select className="input" value={filters.difficulty} onChange={e=>setFilter('difficulty',e.target.value)}>
            <option value="">All Difficulty</option>
            {['easy','medium','hard'].map(d=><option key={d} value={d} className="capitalize">{d}</option>)}
          </select>
        </div>
      </div>

      {/* Question Card */}
      {isLoading ? (
        <div className="card flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : !q ? (
        <div className="card text-center py-16 text-gray-400">No questions found. Try different filters.</div>
      ) : (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <span className={`badge-${q.difficulty}`}>{q.difficulty}</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/8 text-primary font-semibold capitalize">{q.category}</span>
            </div>
            <span className="text-xs text-gray-400">{currentQ+1} / {questions.length}</span>
          </div>

          <h2 className="text-base font-semibold text-ink mb-6 leading-relaxed">{q.question}</h2>

          <div className="space-y-3 mb-6">
            {q.options?.map((opt, idx) => {
              let cls = 'border-2 border-gray-200 bg-gray-50 hover:border-primary/50 cursor-pointer';
              if (answered !== null) {
                if (idx === answered.correctIndex) cls = 'border-2 border-green-400 bg-green-50';
                else if (idx === selected && !answered.isCorrect) cls = 'border-2 border-red-400 bg-red-50';
                else cls = 'border-2 border-gray-100 bg-white opacity-60';
              } else if (selected === idx) cls = 'border-2 border-primary bg-primary/5';
              return (
                <div key={idx} onClick={()=>handleAnswer(idx)}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-all ${cls}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${selected===idx&&answered===null?'bg-primary text-white':'bg-gray-200 text-gray-600'}`}>
                    {String.fromCharCode(65+idx)}
                  </span>
                  <span className="text-sm">{opt}</span>
                  {answered !== null && idx === answered.correctIndex && <CheckCircle size={16} className="ml-auto text-green-500 shrink-0"/>}
                  {answered !== null && idx === selected && !answered.isCorrect && idx !== answered.correctIndex && <XCircle size={16} className="ml-auto text-red-500 shrink-0"/>}
                </div>
              );
            })}
          </div>

          {answered !== null && (
            <div className={`rounded-xl p-4 mb-4 ${answered.isCorrect?'bg-green-50 border border-green-200':'bg-red-50 border border-red-200'}`}>
              <div className={`font-bold text-sm mb-1 ${answered.isCorrect?'text-green-700':'text-red-700'}`}>
                {answered.isCorrect ? '✅ Correct! +10 XP' : '❌ Wrong Answer'}
              </div>
              {answered.explanation && <p className="text-sm text-gray-600">{answered.explanation}</p>}
            </div>
          )}

          {answered !== null && (
            <button onClick={next} className="btn-primary flex items-center gap-2 ml-auto">
              Next Question <ChevronRight size={16}/>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
