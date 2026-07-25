import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getMe } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');
    if (error) { toast.error('OAuth login failed'); navigate('/login'); return; }
    if (token) {
      localStorage.setItem('x1_token', token);
      dispatch(getMe()).then((res) => {
        if (getMe.fulfilled.match(res)) {
          const role = res.payload?.role;
          toast.success('Logged in successfully!');
          navigate(role === 'student' ? '/dashboard' : '/admin');
        } else navigate('/login');
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Completing login…</p>
      </div>
    </div>
  );
}
