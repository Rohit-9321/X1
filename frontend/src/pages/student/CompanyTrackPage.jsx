import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { companyAPI, noteAPI } from '../../api';
import { useSelector } from 'react-redux';
import { BookOpen, Code2, FileText, Lock, ChevronRight, Briefcase } from 'lucide-react';

const CATEGORY_ICONS = { aptitude:'📊', reasoning:'🧩', english:'📝', coding:'💻', interview:'🎤' };
const CATEGORY_COLORS = { aptitude:'bg-blue-50 text-blue-600', reasoning:'bg-purple-50 text-purple-600', english:'bg-green-50 text-green-600', coding:'bg-orange-50 text-orange-600', interview:'bg-pink-50 text-pink-600' };

export default function CompanyTrackPage() {
  const { slug } = useParams();
  const { user } = useSelector(s => s.auth);
  const [activeCategory, setActiveCategory] = useState('aptitude');

  const { data, isLoading } = useQuery({
    queryKey: ['company', slug],
    queryFn: () => companyAPI.getBySlug(slug).then(r => r.data.data),
  });

  const company = data?.company;
  const topics  = data?.topics || [];
  const stats   = data?.stats  || {};
  const progress= data?.progress;

  const hasAccess = user?.subscription?.plan === 'premium' ||
    (user?.subscription?.companies || []).some(c => c === company?._id || c._id === company?._id);

  const byCategory = topics.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  const categories = ['aptitude','reasoning','english','coding','interview'];

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Company header */}
      <div className="card flex items-start gap-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black shrink-0"
          style={{background:company?.color||'#5B3BF5'}}>
          {company?.name?.slice(0,3).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-black text-ink">{company?.name} Prep Track</h1>
          <p className="text-gray-500 text-sm mt-1">{company?.description || `Complete placement preparation for ${company?.name}`}</p>
          <div className="flex gap-5 mt-4">
            {[['Questions',stats.questionCount],['Coding Probs',stats.codingCount],['Mock Tests',stats.testCount]].map(([l,v])=>(
              <div key={l} className="text-center">
                <div className="font-display text-xl font-black text-ink">{v||0}</div>
                <div className="text-xs text-gray-400">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-right shrink-0">
          {hasAccess
            ? <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">✅ Unlocked</div>
            : (
              <div>
                <div className="px-3 py-1.5 bg-red-50 text-red-500 rounded-full text-xs font-bold mb-2">🔒 Locked</div>
                <Link to="/pricing" className="btn-primary text-xs py-1.5 px-4">Unlock ₹{company?.price}</Link>
              </div>
            )
          }
        </div>
      </div>

      {/* Progress bar */}
      {progress && (
        <div className="card">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span>Overall Progress</span><span className="text-primary">{progress.percentage}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{width:`${progress.percentage}%`}}/>
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.filter(c=>byCategory[c]?.length).map(c=>(
          <button key={c} onClick={()=>setActiveCategory(c)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeCategory===c?'bg-primary text-white':'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'}`}>
            {CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase()+c.slice(1)}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory===c?'bg-white/20':'bg-gray-100'}`}>{byCategory[c]?.length}</span>
          </button>
        ))}
      </div>

      {/* Topics */}
      <div className="grid sm:grid-cols-2 gap-4">
        {(byCategory[activeCategory]||[]).map((topic, i) => (
          <div key={topic._id} className={`card flex items-center justify-between group ${!hasAccess&&i>1?'opacity-60':''}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${CATEGORY_COLORS[activeCategory]}`}>
                {i+1}
              </div>
              <div>
                <div className="font-semibold text-sm">{topic.name}</div>
                <div className="text-xs text-gray-400 capitalize">{activeCategory}</div>
              </div>
            </div>
            {!hasAccess && i > 1
              ? <Lock size={16} className="text-gray-300"/>
              : (
                <Link to={`/practice?company=${company?._id}&topic=${topic._id}`}
                  className="text-xs text-primary font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Practice <ChevronRight size={12}/>
                </Link>
              )
            }
          </div>
        ))}
      </div>

      {/* Locked state CTA */}
      {!hasAccess && (
        <div className="card text-center py-10 border-2 border-dashed border-primary/30 bg-primary/2">
          <Lock size={32} className="text-primary mx-auto mb-3"/>
          <h3 className="font-bold text-lg mb-2">Unlock {company?.name} Track</h3>
          <p className="text-gray-500 text-sm mb-5">Get full access to all topics, questions, mock tests, and interview prep</p>
          <Link to="/pricing" className="btn-primary px-8 py-3">Unlock for ₹{company?.price} →</Link>
        </div>
      )}
    </div>
  );
}
