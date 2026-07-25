import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { authAPI } from '../../api';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    authAPI.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="card text-center py-12 max-w-sm w-full">
        {status === 'loading' && <><div className="text-5xl mb-4">⏳</div><h2 className="font-bold text-lg">Verifying…</h2></>}
        {status === 'success' && <><div className="text-5xl mb-4">✅</div><h2 className="font-bold text-lg">Email Verified!</h2><p className="text-gray-500 text-sm mt-2 mb-6">You can now login to X1.</p><Link to="/login" className="btn-primary">Go to Login</Link></>}
        {status === 'error' && <><div className="text-5xl mb-4">❌</div><h2 className="font-bold text-lg">Invalid or Expired Link</h2><p className="text-gray-500 text-sm mt-2 mb-6">Please request a new verification email.</p><Link to="/login" className="btn-ghost">Back to Login</Link></>}
      </div>
    </div>
  );
}
