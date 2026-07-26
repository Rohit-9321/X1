import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../../api';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';
import { Zap, Flame, Code2, FileText, Target, Trophy } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: a, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsAPI.getMyAnalytics().then(r => r.data.data),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>;

  const placementScore = a?.overview?.placementScore || 0;
  const recommendedCompanies = ['TCS','Infosys','Wipro'].filter(() => placementScore >= 60);
  const improvementNeeded   = ['Amazon','Google','Microsoft'].filter(() => placementScore < 80);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-black text-ink">Analytics</h1>
        <p className="text-gray-500 mt-1">Track your preparation progress</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { l:'Placement Score', v:`${placementScore}/100`, icon:Target, c:'text-primary' },
          { l:'Level',           v:a?.overview?.level||1,  icon:Zap,    c:'text-yellow-500' },
          { l:'Streak',          v:`${a?.overview?.streak||0}d`, icon:Flame, c:'text-orange-500' },
          { l:'Questions',       v:a?.overview?.questionsSolved||0, icon:FileText, c:'text-blue-500' },
          { l:'Coding Solved',   v:a?.overview?.codingSolved||0,   icon:Code2,   c:'text-green-500' },
          { l:'Tests Done',      v:a?.overview?.testsAttempted||0, icon:Trophy,  c:'text-purple-500' },
        ].map(s => (
          <div key={s.l} className="card text-center">
            <s.icon size={20} className={`${s.c} mx-auto mb-2`} />
            <div className="font-display text-2xl font-black text-ink">{s.v}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Skill Radar */}
        <div className="card">
          <h2 className="font-bold text-base mb-4">Skill Radar</h2>
          {a?.skillRadar?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={a.skillRadar}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="skill" tick={{fontSize:12,fill:'#6b7280'}} />
                <Radar dataKey="value" stroke="#5B3BF5" fill="#5B3BF5" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-52 text-gray-300 text-sm">Practice to see your radar</div>}
        </div>

        {/* Weekly Activity */}
        <div className="card">
          <h2 className="font-bold text-base mb-4">Daily Activity (7 days)</h2>
          {a?.weeklyActivity?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={a.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{fontSize:11}} tickFormatter={d=>d.slice(5)} />
                <YAxis tick={{fontSize:11}} width={28} />
                <Tooltip contentStyle={{borderRadius:8,fontSize:12}} />
                <Bar dataKey="questionsAttempted" fill="#5B3BF5" radius={4} name="Questions" />
                <Bar dataKey="codingSolved" fill="#00D4AA" radius={4} name="Coding" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-52 text-gray-300 text-sm">No activity yet</div>}
        </div>
      </div>

      {/* Placement Readiness Score */}
      <div className="card">
        <h2 className="font-bold text-lg mb-6">Placement Readiness Score</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {(a?.skillRadar || []).map(s => (
            <div key={s.skill}>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span>{s.skill}</span><span className="text-primary">{s.value}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{width:`${s.value}%`}} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 grid md:grid-cols-2 gap-6">
          <div>
            <div className="font-bold text-sm text-green-700 mb-3">✅ Recommended Companies</div>
            <div className="flex flex-wrap gap-2">
              {recommendedCompanies.length
                ? recommendedCompanies.map(c => <span key={c} className="px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold">{c}</span>)
                : <span className="text-sm text-gray-400">Keep practicing to unlock recommendations</span>}
            </div>
          </div>
          <div>
            <div className="font-bold text-sm text-red-600 mb-3">⚠️ Need Improvement</div>
            <div className="flex flex-wrap gap-2">
              {improvementNeeded.map(c => <span key={c} className="px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-xs font-bold">{c}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Company Progress */}
      {a?.companyProgress?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-base mb-5">Company-wise Progress</h2>
          <div className="space-y-4">
            {a.companyProgress.map(cp => (
              <div key={cp.company?._id} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0"
                  style={{background:cp.company?.color||'#5B3BF5'}}>
                  {cp.company?.name?.slice(0,3).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span>{cp.company?.name}</span>
                    <span className="text-primary">{cp.accuracy}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{width:`${cp.accuracy}%`}} />
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{cp.attempted} questions attempted</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
