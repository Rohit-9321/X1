import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { noteAPI, companyAPI } from '../../api';
import { FileText, Film, Image, BookOpen, ExternalLink } from 'lucide-react';

const TYPE_ICONS = { pdf:FileText, video:Film, image:Image, youtube:Film, text:BookOpen };
const TYPE_COLORS = { pdf:'text-red-500', video:'text-blue-500', image:'text-green-500', youtube:'text-red-500', text:'text-gray-500' };

export default function NotesPage() {
  const [companyFilter, setCompanyFilter] = useState('');
  const { data: companies } = useQuery({ queryKey:['companies'], queryFn:()=>companyAPI.getAll().then(r=>r.data.data) });
  const { data: notes, isLoading } = useQuery({
    queryKey:['notes',companyFilter],
    queryFn:()=>noteAPI.getAll(companyFilter?{company:companyFilter}:{}).then(r=>r.data.data),
  });

 
}
