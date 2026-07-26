import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, MinusCircle, BarChart2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function MockTestResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;
  if (!result) { navigate('/tests'); return null; }

  const data = [
    { name:'Correct', value:result.analysis?.correct||0, color:'#10B981' },
    { name:'Wrong',   value:result.analysis?.wrong||0,   color:'#EF4444' },
    { name:'Skipped', value:result.analysis?.skipped||0, color:'#9CA3AF' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className={`card text-center py-10 border-2 ${result.percentage>=60?'border-green-200 bg-green-50':'border-red-100 bg-red-50'}`}>
        <div className={`font-display text-6xl font-black mb-2 ${result.percentage>=60?'text-green-600':'text-red-500'}`}>{result.percentage}%</div>
        <div className="text-gray-500 text-sm">Score: {result.score}/{result.totalMarks}</div>
        <div className={`mt-3 inline-block px-4 py-1.5 rounded-full text-sm font-bold ${result.percentage>=60?'bg-green-100 text-green-700':'bg-red-100 text-red-600'}`}>
          {result.percentage>=60?'Passed ✅':'Failed — Try Again ❌'}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[['Correct',result.analysis?.correct||0,'text-green-600',CheckCircle],
          ['Wrong',  result.analysis?.wrong||0,  'text-red-500',  XCircle],
          ['Skipped',result.analysis?.skipped||0,'text-gray-400', MinusCircle]].map(([l,v,c,Icon])=>(
          <div key={l} className="card text-center">
            <Icon size={22} className={`${c} mx-auto mb-2`}/>
            <div className={`font-display text-3xl font-black ${c}`}>{v}</div>
            <div className="text-xs text-gray-400">{l}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-bold text-base mb-4 flex items-center gap-2"><BarChart2 size={18}/> Result Breakdown</h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
              {data.map((d,i)=><Cell key={i} fill={d.color}/>)}
            </Pie>
            <Tooltip formatter={(v,n)=>[v,n]}/>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-3">
        <button onClick={()=>navigate('/tests')} className="btn-ghost flex-1">Back to Tests</button>
        <button onClick={()=>navigate('/analytics')} className="btn-primary flex-1">View Analytics</button>
      </div>
    </div>
  );
}
