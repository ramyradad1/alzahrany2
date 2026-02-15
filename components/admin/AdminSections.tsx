import React from 'react';
import { Section, Translations } from '../../types';
import { db } from '../../src/db';
import { addToSyncQueue } from '../../src/services/syncQueue';
import { GripVertical, Eye, EyeOff, Edit } from 'lucide-react';
import { AdminSectionEditor } from './AdminSectionEditor';

// Lazy load editor to avoid circular deps or heavy load if not needed immediately
// But here we need it. Assuming AdminSectionEditor exists or needed to be created.
// Wait, AdminSectionEditor might also be missing? The user had it open in context "Other open documents".
// Checking context... "c:\Users\Ramy\OneDrive - TECHNIFY\Desktop\New folder\components\admin\AdminSectionEditor.tsx" IS OPEN.
// So it exists! Great.

interface AdminSectionsProps {
    sections: Section[];
    onUpdateSections: (sections: Section[]) => Promise<void>;
    t: Translations;
}

export const AdminSections: React.FC<AdminSectionsProps> = ({ sections, onUpdateSections, t }) => {
    const [editingSection, setEditingSection] = React.useState<Section | null>(null);

    const toggleVisibility = async (section: Section) => {
        try {
            const updated = { ...section, is_visible: !section.is_visible };
            await db.sections.update(section.id, { is_visible: updated.is_visible });
            await addToSyncQueue('sections', 'UPDATE', { id: section.id, is_visible: updated.is_visible });
        } catch (e) {
            console.error(e);
        }
    };

    if (editingSection) {
    return (
        <div className="space-y-6">
            <button 
                onClick={() => setEditingSection(null)}
                className="text-cyan-600 hover:underline mb-4"
            >
                &larr; Back to List
            </button>
            <AdminSectionEditor
                section={editingSection}
                onUpdate={() => setEditingSection(null)}
                t={t}
            />
        </div>
    );
  }

    return (
      <div className="space-y-4">
          {sections.map((section, index) => (
              <div key={section.id} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-all">
                  <div className="cursor-move text-slate-400 hover:text-slate-600">
                      <GripVertical className="w-5 h-5" />
                  </div>
              <div className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {section.label}
                      <span className="text-xs font-normal text-slate-500 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                          {section.id}
                      </span>
                  </h3>
              </div>
              <div className="flex items-center gap-2">
                  <button 
                      onClick={() => toggleVisibility(section)}
                      className={`p-2 rounded-lg transition-colors ${section.is_visible ? 'text-green-500 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`}
                      title={section.is_visible ? 'Visible' : 'Hidden'}
                  >
                      {section.is_visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <button 
                      onClick={() => setEditingSection(section)}
                      className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                          title="Edit Section"
                          aria-label="Edit Section"
                  >
                      <Edit className="w-5 h-5" />
                  </button>
              </div>
          </div>
      ))}
      </div>
  );
};
