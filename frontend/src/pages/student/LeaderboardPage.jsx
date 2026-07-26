import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { leaderboardAPI } from '../../api';
import { Trophy, Zap, Flame } from 'lucide-react';

export default function LeaderboardPage() {
  const { user } = useSelector(s => s.auth);
  const [period, setPeriod] = useState('weekly');
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => leaderboardAPI.get({ period }).then(r => r.data),
  });

  const users = data?.data || [];
  const myRank = data?.myRank;

  const MEDALS = ['🥇','🥈','🥉'];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="font-display text-3xl font-black">Leaderboard</h1>
      <p className="text-gray-500 mt-1">Top students by XP earned</p></div>

      <div className="flex gap-2">
        {['daily','weekly','monthly','alltime'].map(p => (
          <button key={p} onClick={()=>setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${period===p?'bg-primary text-white':'bg-white border border-gray-200 text-gray-600 hover:border-primary'}`}>
            {p === 'alltime' ? 'All Time' : p}
          </button>
        ))}
      </div>

      {myRank && (
        <div className="card bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">Your Rank</span>
            <span className="font-display text-2xl font-black text-primary">#{myRank}</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <div className="space-y-2">
          {users.map((u, i) => (
            <div key={u._id}
              className={`card flex items-center gap-4 py-3 px-5 ${u._id === user?._id ? 'border-primary bg-primary/3' : ''}`}>
              <div className="w-8 text-center font-display font-black text-lg text-gray-400">{MEDALS[i] || `#${i+1}`}</div>
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                {u.fullName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{u.fullName} {u._id===user?._id&&<span className="text-xs text-primary">(you)</span>}</div>
                <div className="text-xs text-gray-400 flex items-center gap-2">
                  <Flame size={11} className="text-orange-400"/>{u.streak}d streak
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 font-bold text-sm"><Zap size={14} className="text-yellow-500"/>{u.xp?.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Lvl {u.level}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
