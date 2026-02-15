import React, { useState } from 'react';
import { Partner, Translations } from '../../types';
import { Plus, Trash2, X, Image as ImageIcon } from 'lucide-react';

interface AdminPartnersProps {
    partners: Partner[];
    onAddPartner: (name: string, logo: string) => Promise<void>;
    onDeletePartner: (id: number) => Promise<void>;
    t: Translations;
}

export const AdminPartners: React.FC<AdminPartnersProps> = ({ partners, onAddPartner, onDeletePartner, t }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [logo, setLogo] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
      try {
        await onAddPartner(name, logo);
        setName('');
        setLogo('');
        setIsModalOpen(false);
    } catch (error) {
        console.error(error);
      }
  };

    return (
      <div>
          <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">{t.managePartners}</h1>
              <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20"
              >
                  <Plus className="w-5 h-5" />
                  {t.addPartner}
              </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {partners.map(partner => (
                  <div key={partner.id} className="group relative bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-all">
                      <img src={partner.logo} alt={partner.name} className="h-16 object-contain filter dark:brightness-0 dark:invert opacity-70 group-hover:opacity-100 transition-opacity" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{partner.name}</span>
                      <button
                          onClick={() => onDeletePartner(partner.id)}
                          className="absolute top-2 right-2 p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete Partner"
                          aria-label="Delete Partner"
                      >
                          <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
              ))}
              {partners.length === 0 && (
                  <p className="col-span-full text-center text-slate-500 py-10">{t.noPartners}</p>
              )}
          </div>

          {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                      <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-bold">{t.addPartner}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full" aria-label="Close Modal">
                              <X className="w-5 h-5" />
                          </button>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                                <label className="block text-sm font-medium mb-2" htmlFor="partner_name">{t.partnerName}</label>
                              <input 
                                    id="partner_name"
                                  type="text" 
                                  required
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                              />
                          </div>
                          <div>
                                <label className="block text-sm font-medium mb-2" htmlFor="partner_logo">{t.partnerLogo} (URL)</label>
                              <div className="relative">
                                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                  <input 
                                        id="partner_logo"
                                      type="url"
                                      required
                                      value={logo}
                                      onChange={(e) => setLogo(e.target.value)}
                                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                                  />
                              </div>
                          </div>

                          <button
                              type="submit"
                              className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 mt-4"
                          >
                              {t.save}
                          </button>
                      </form>
                  </div>
              </div>
          )}
      </div>
  );
};
