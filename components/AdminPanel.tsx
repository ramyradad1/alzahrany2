import React, { useState, useEffect } from 'react';
import { Lock, LogOut, Package, Users, LayoutGrid, Home, Loader2, ChevronLeft, ChevronRight, Settings, Share2, FlaskConical, Menu, X } from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Auto-logout after 1 minute of inactivity
  useEffect(() => {
    if (!session) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/');
      }, 60000);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));
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

    await new Promise(resolve => setTimeout(resolve, 2000));

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      setError(error.message);
      setPassword('');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { to: '/admin/products', icon: Package, label: t.portfolio },
    { to: '/admin/partners', icon: Users, label: t.managePartners },
    { to: '/admin/sections', icon: LayoutGrid, label: 'Sections' },
  ];

  // --- LOGIN VIEW ---
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 p-4">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative w-full max-w-md">
          {/* Glass Card */}
          <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 overflow-hidden">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 pointer-events-none" />

            <div className="relative z-10">
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <FlaskConical className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-3xl blur-xl -z-10" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-center text-white mb-2">Admin Access</h2>
              <p className="text-center text-slate-300 mb-8">Enter your credentials to continue</p>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-white placeholder-slate-400 backdrop-blur-sm"
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-white placeholder-slate-400 backdrop-blur-sm"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Sign In'}
                </button>
              </form>

              <p className="mt-6 text-center text-slate-400 text-sm">
                Protected by Supabase Auth
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MODERN DASHBOARD LAYOUT ---
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex">
      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white whitespace-nowrap">Alzahrany</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }
                ${!sidebarOpen ? 'justify-center' : ''}
              `}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <Home className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="font-medium">View Site</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="font-medium">{t.logout}</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4 text-slate-600" /> : <ChevronRight className="w-4 h-4 text-slate-600" />}
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-16 bottom-0 w-64 bg-white dark:bg-slate-800 p-4 space-y-2" onClick={e => e.stopPropagation()}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
            <hr className="border-slate-200 dark:border-slate-700 my-4" />
            <button
              onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">View Site</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t.logout}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} pt-20 lg:pt-0`}>
        <div className="p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
              {location.pathname.includes('products') && t.portfolio}
              {location.pathname.includes('partners') && t.managePartners}
              {location.pathname.includes('sections') && 'Sections'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {location.pathname.includes('products') && 'Manage your product catalog'}
              {location.pathname.includes('partners') && 'Manage partner logos and information'}
              {location.pathname.includes('sections') && 'Customize page sections and layouts'}
            </p>
          </div>

          {/* Content Area */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
