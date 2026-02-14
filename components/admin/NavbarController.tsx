import React, { useState, useEffect } from 'react';
import { Translations, NavbarConfig } from '../../types';
import { supabase } from '../../utils/supabase';
import { Save, AlertCircle, Upload } from 'lucide-react';

interface NavbarControllerProps {
    t: Translations;
}

export const NavbarController: React.FC<NavbarControllerProps> = ({ t }) => {
    const [config, setConfig] = useState<NavbarConfig>({
        logo_url: '/logo.png',
        site_name: 'Alzahrany',
        site_name_ar: 'الزهراني',
        logo_size: 40,
        logo_remove_background: false,
        menu_items: []
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      fetchConfig();
  }, []);

    const fetchConfig = async () => {
        const { data } = await supabase.from('navbar_config').select('*').single();
        if (data) setConfig(data);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
        const { error } = await supabase.from('navbar_config').upsert({ id: 'main', ...config });
        if (error) throw error;
        alert('Navbar settings updated!');
        // Force refresh or cached update logic here ideally
    } catch (error) {
        console.error(error);
        alert('Failed to update settings');
    } finally {
        setLoading(false);
    }
  };

    return (
      <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-8 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Logo Section */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-bold mb-4">Logo Settings</h3>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium mb-2">Logo URL</label>
                          <div className="flex gap-2">
                              <input 
                                  type="text"
                                  value={config.logo_url}
                                  onChange={e => setConfig({ ...config, logo_url: e.target.value })}
                                  className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium mb-2">Logo Size (px)</label>
                          <input
                              type="range"
                              min="20" 
                              max="100"
                              value={config.logo_size || 40}
                              onChange={e => setConfig({ ...config, logo_size: parseInt(e.target.value) })}
                              className="w-full accent-cyan-600"
                          />
                          <div className="text-right text-sm text-slate-500">{config.logo_size}px</div>
                      </div>

                      <div className="flex items-center gap-3">
                          <input
                              type="checkbox"
                              id="removeBg"
                              checked={config.logo_remove_background}
                              onChange={e => setConfig({ ...config, logo_remove_background: e.target.checked })}
                              className="w-5 h-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          <label htmlFor="removeBg" className="text-sm font-medium">Remove Background (AI Alpha)</label>
                      </div>
                  </div>
              </div>

              {/* Site Identity */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-bold mb-4">Site Identity</h3>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium mb-2">Site Name (English)</label>
                          <input 
                              type="text"
                              value={config.site_name}
                              onChange={e => setConfig({ ...config, site_name: e.target.value })}
                              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium mb-2">Site Name (Arabic)</label>
                          <input
                              type="text" 
                              value={config.site_name_ar}
                              onChange={e => setConfig({ ...config, site_name_ar: e.target.value })}
                              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 text-right"
                          />
                      </div>
                  </div>
              </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
              <button 
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
              >
                  {loading ? <AlertCircle className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
              </button>
          </div>
      </form>
  );
};
