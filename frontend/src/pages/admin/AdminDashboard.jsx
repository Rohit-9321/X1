import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import { Users, Building2, CreditCard, TrendingUp, DollarSign, UserCheck } from 'lucide-react';

export default function AdminDashboard() {
  const { data } = useQuery({ queryKey: ['admin-stats'], queryFn: () => adminAPI.getStats().then(r => r.data.data) });

 
}
