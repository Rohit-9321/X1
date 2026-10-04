import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { analyticsAPI, companyAPI } from '../../api';
import { Zap, Flame, Trophy, Target, Code2, FileText, BookOpen, ArrowRight } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function DashboardPage() {
  const { user } = useSelector(s => s.auth);
  const { data: analytics } = useQuery({ queryKey:['analytics'], queryFn: () => analyticsAPI.getMyAnalytics().then(r => r.data.data) });
  const { data: companiesRes } = useQuery({ queryKey:['companies'], queryFn: () => companyAPI.getAll().then(r => r.data.data) });
  const companies = companiesRes || [];
  const a = analytics;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-ink">Good morning, {user?.fullName?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 mt-1">Here's your placement prep overview</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'XP Points',  val: a?.overview?.xp || 0,       icon: Zap,    color:'text-yellow-500', bg:'bg-yellow-50' },
          { label:'Day Streak', val: `${a?.overview?.streak||0}d`, icon: Flame,  color:'text-orange-500', bg:'bg-orange-50' },
          { label:'Questions',  val: a?.overview?.questionsSolved||0, icon: FileText, color:'text-primary', bg:'bg-primary/8' },
          { label:'Coding',     val: a?.overview?.codingSolved||0, icon: Code2,  color:'text-accent',    bg:'bg-accent/10' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div>
              <div className="font-display text-2xl font-black text-ink">{s.val}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

     
      {/* Weekly Activity */}
      {a?.weeklyActivity?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-base mb-4">Weekly Activity</h2>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={a.weeklyActivity}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5B3BF5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#5B3BF5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{fontSize:11}} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{fontSize:11}} width={28} />
              <Tooltip contentStyle={{borderRadius:8,fontSize:12}} />
              <Area type="monotone" dataKey="questionsAttempted" stroke="#5B3BF5" fill="url(#grad)" strokeWidth={2} name="Questions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Company Tracks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Company Tracks</h2>
          <Link to="/companies" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">View all <ArrowRight size={12}/></Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {companies.slice(0, 8).map(c => (
            <Link key={c._id} to={`/company/${c.slug}`}
              className="card hover:border-primary/30 hover:-translate-y-0.5 transition-all group cursor-pointer">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black mb-3"
                style={{background:c.color||'#5B3BF5'}}>
                {c.name.slice(0,3).toUpperCase()}
              </div>
              <div className="font-bold text-sm text-ink">{c.name}</div>
              <div className="text-xs text-gray-400 mt-0.5 mb-3">{c.category} · ₹{c.price}</div>
              {user?.subscription?.plan === 'premium' || user?.subscription?.companies?.includes(c._id) ? (
                <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Unlocked
                </div>
              ) : (
                <div className="text-xs text-primary font-semibold group-hover:underline">Unlock track →</div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
