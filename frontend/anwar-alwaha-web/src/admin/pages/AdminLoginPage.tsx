import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    try {
      setSubmitting(true);
      await login(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'بيانات الدخول غير صحيحة.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-brand-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900/90 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-brand-600/20 text-brand-400 border border-brand-500/30 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-lg shadow-brand-500/10">
            🔒
          </div>
          <h1 className="text-xl font-black text-white">لوحة تحكم المشرف</h1>
          <p className="text-xs text-gray-400">مكتبة أنوار الواحة - بوابة الإدارة المركزية</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-gray-300 font-bold block">البريد الإلكتروني للإدارة</label>
            <div className="relative">
              <input
                type="email"
                required
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@anwaralwaha.com"
                className="w-full bg-gray-800 text-white p-3.5 pl-10 rounded-xl border border-gray-700 focus:outline-none focus:border-brand-500 text-left font-medium"
              />
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-300 font-bold block">كلمة المرور</label>
            <div className="relative">
              <input
                type="password"
                required
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-gray-800 text-white p-3.5 pl-10 rounded-xl border border-gray-700 focus:outline-none focus:border-brand-500 text-left font-medium"
              />
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 active:scale-95 transition-all disabled:opacity-50 mt-2"
          >
            <span>{submitting ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
            <ArrowLeft size={16} />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-800 text-[11px] text-gray-500">
          دخول مقتصر على المشرفين المصرح لهم فقط
        </div>
      </div>
    </div>
  );
};
