import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { codingAPI, companyAPI } from '../../api';
import { Code2, CheckCircle } from 'lucide-react';

export default function CodingPlatformPage() {
  const [filters, setFilters] = useState({ company:'', difficulty:'' });
  const { data: companies } = useQuery({ queryKey:['companies'], queryFn:()=>companyAPI.getAll().then(r=>r.data.data) });
  const { data, isLoading } = useQuery({
    queryKey:['coding',filters],
    queryFn:()=>codingAPI.getAll(filters).then(r=>r.data),
  });
  const problems = data?.data || [];

  
}
