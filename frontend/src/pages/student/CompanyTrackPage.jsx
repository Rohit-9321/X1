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

  
}
