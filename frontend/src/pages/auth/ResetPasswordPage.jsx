import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, form.password);
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-3xl font-black">X<span className="text-primary">1</span></Link>
          <h1 className="text-2xl font-bold mt-4">Reset Password</h1>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[['password','New Password'],['confirm','Confirm Password']].map(([f,l]) => (
              <div key={f}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{l}</label>
                <input className="input" type="password" placeholder="••••••••" required
                  value={form[f]} onChange={e => setForm(p=>({...p,[f]:e.target.value}))} />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
