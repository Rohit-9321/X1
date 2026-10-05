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

  
}
