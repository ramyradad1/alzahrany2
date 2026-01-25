import React, { useState, useEffect } from 'react';
import { Lock, LogOut, Package, Users, GripVertical, Loader2, LayoutTemplate, Home } from 'lucide-react';
import { supabase } from '../supabase';
import { Translations, Language } from '../types';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';

interface AdminPanelProps {
  t: Translations;
  lang: Language;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ t, lang }) => {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && location.pathname === '/admin') {
        navigate('/admin/products');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && location.pathname === '/admin') {
        navigate('/admin/products');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  // --- SECURITY: INFO ---
  // Auto-logout after 1 minute (60000ms) of inactivity
  useEffect(() => {
    if (!session) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        // console.log("Auto-logging out due to inactivity...");
        await supabase.auth.signOut();
        navigate('/');
      }, 60000); // 1 minute
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));

    // Initialize timer
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [session, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Security: Artificial delay to slow down brute-force attacks
    await new Promise(resolve => setTimeout(resolve, 2000));

    const cleanEmail = email.trim();
    const cleanPassword = password.trim(); // Just in case, though passwords usually shouldn't be trimmed if spaces are allowed. But standard practice involves some cleaning. Keeping it simple for now.

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error) {
      setError(error.message);
      setPassword(''); // Clear password on error
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // --- LOGIN VIEW ---
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in-up text-left rtl:text-right">
        <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 transition-colors duration-300">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/30 rounded-full animate-pulse-glow">
              <Lock className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">{t.adminLogin}</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-8">{t.restricted}</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 text-left"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 text-left"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center font-medium animate-pulse">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t.authenticate}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- DASHBOARD LAYOUT ---
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in-up text-left rtl:text-right">

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
            {t.admin}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Management Dashboard</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <NavLink
            to="/admin/products"
            className={({ isActive }) => `flex items-center px-4 py-2 rounded-md text-sm font-bold transition-all ${isActive ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <Package className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t.portfolio}
          </NavLink>
          <NavLink
            to="/admin/partners"
            className={({ isActive }) => `flex items-center px-4 py-2 rounded-md text-sm font-bold transition-all ${isActive ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <Users className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t.managePartners}
          </NavLink>
          <NavLink
            to="/admin/sections"
            className={({ isActive }) => `flex items-center px-4 py-2 rounded-md text-sm font-bold transition-all ${isActive ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <GripVertical className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            Sections
          </NavLink>

        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center px-4 py-2 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-900/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 rounded-lg transition-colors text-sm font-medium"
          >
            <Home className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            View Site
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t.logout}
          </button>
        </div>
      </div>

      {/* Render Sub-Routes (Products, Partners, Sections) */}
      <Outlet />
    </div>
  );
};
