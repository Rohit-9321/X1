import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { userAPI, authAPI } from '../../api';
import { setUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import { Zap, Flame, Trophy } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [form, setForm] = useState({ fullName: user?.fullName||'', phone: user?.phone||'' });
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await userAPI.updateProfile(form);
      dispatch(setUser(data.data));
      toast.success('Profile updated');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed');
      setPwForm({ currentPassword:'', newPassword:'', confirm:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-3xl font-black">Profile</h1>

      {/* Stats */}
      <div className="card flex items-center gap-5 flex-wrap">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-black">
          {user?.fullName?.[0]}
        </div>
        <div>
          <h2 className="font-bold text-xl">{user?.fullName}</h2>
          <p className="text-gray-400 text-sm">{user?.email}</p>
        </div>
        <div className="ml-auto flex gap-5">
          {[
            [user?.xp||0,'XP',Zap,'text-yellow-500'],
            [user?.streak||0,'Streak',Flame,'text-orange-500'],
            [user?.level||1,'Level',Trophy,'text-primary'],
          ].map(([v,l,Icon,c])=>(
            <div key={l} className="text-center">
              <Icon size={18} className={`${c} mx-auto mb-1`}/>
              <div className="font-display text-xl font-black">{v}</div>
              <div className="text-xs text-gray-400">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile */}
      <div className="card">
        <h2 className="font-bold text-base mb-5">Edit Profile</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {[['fullName','Full Name','text'],['phone','Phone','tel']].map(([f,l,t])=>(
            <div key={f}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{l}</label>
              <input type={t} className="input" value={form[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" className="input opacity-60" value={user?.email} disabled />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">{saving?'Saving…':'Save Changes'}</button>
        </form>
      </div>

      {/* Change Password */}
      {user?.password !== undefined || !user?.googleId ? (
        <div className="card">
          <h2 className="font-bold text-base mb-5">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[['currentPassword','Current Password'],['newPassword','New Password'],['confirm','Confirm New Password']].map(([f,l])=>(
              <div key={f}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{l}</label>
                <input type="password" className="input" placeholder="••••••••" required
                  value={pwForm[f]} onChange={e=>setPwForm(p=>({...p,[f]:e.target.value}))} />
              </div>
            ))}
            <button type="submit" className="btn-primary">Update Password</button>
          </form>
        </div>
      ) : null}

      {/* Subscription */}
      <div className="card">
        <h2 className="font-bold text-base mb-3">Subscription</h2>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${user?.subscription?.plan==='premium'?'bg-primary text-white':user?.subscription?.plan!=='free'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-600'}`}>
          {user?.subscription?.plan === 'premium' ? '⭐ Premium' : user?.subscription?.plan === 'free' ? '🆓 Free Plan' : `📦 ${user?.subscription?.plan} Pack`}
        </div>
        {user?.subscription?.expiresAt && (
          <p className="text-xs text-gray-400 mt-2">Expires: {new Date(user.subscription.expiresAt).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  );
}
