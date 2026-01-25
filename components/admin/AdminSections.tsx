import React, { useState } from 'react';
import { Section, Translations } from '../../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Edit, ChevronDown, ChevronUp, Plus, Trash2, Loader2 } from 'lucide-react';
import { AdminSectionEditor } from './AdminSectionEditor';
import { supabase } from '../../supabase';

interface AdminSectionsProps {
    sections: Section[];
    onUpdateSections: (sections: Section[]) => void;
    t: Translations;
}

interface SortableSectionRowProps {
    section: Section;
    onToggle: (id: string) => void;
    onEdit: (id: string) => void;
    isEditing: boolean;
    onUpdateSection: (section: Section) => void;
    onDelete?: (id: string) => void;
    t: Translations;
}

const SortableSectionRow: React.FC<SortableSectionRowProps> = ({ section, onToggle, onEdit, isEditing, onUpdateSection, onDelete, t }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-2 overflow-hidden transition-all">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    {/* Drag Handle - Listeners applied here only */}
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded touch-none text-slate-400">
                        <GripVertical className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white capitalize flex items-center gap-2">
                        {section.label}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => onEdit(section.id)}
                        className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        title="Edit Content"
                    >
                        {isEditing ? <ChevronUp className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    </button>
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => onToggle(section.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${section.is_visible ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
                    >
                        {section.is_visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {section.is_visible ? 'Visible' : 'Hidden'}
                    </button>
                    {onDelete && (
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this section?')) {
                                    onDelete(section.id);
                                }
                            }}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors"
                            title="Delete Section"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Expanded Editor */}
            {isEditing && (
                <div className="border-t border-slate-100 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/50">
                    <AdminSectionEditor section={section} onUpdate={onUpdateSection} t={t} />
                </div>
            )}
        </div>
    );
}

export const AdminSections: React.FC<AdminSectionsProps> = ({ sections, onUpdateSections, t }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = sections.findIndex((s) => s.id === active.id);
            const newIndex = sections.findIndex((s) => s.id === over.id);
            const newSections: Section[] = arrayMove(sections, oldIndex, newIndex);

            // Update order property
            const updated = newSections.map((s, idx) => ({ ...s, order: idx }));
            onUpdateSections(updated);
        }
    };

    const handleToggleVisibility = (id: string) => {
        const updated = sections.map(s => s.id === id ? { ...s, is_visible: !s.is_visible } : s);
        onUpdateSections(updated);
    };

    const handleEdit = (id: string) => {
        setEditingId(prev => prev === id ? null : id);
    };

    const handleUpdateSection = (updatedSection: Section) => {
        const newSections = sections.map(s => s.id === updatedSection.id ? updatedSection : s);
        onUpdateSections(newSections);
    };

    const handleAddSection = async () => {
        setAdding(true);
        const newId = `section_${Date.now()}`;
        const newSection: Section = {
            id: newId,
            label: 'New Section',
            is_visible: true,
            order: sections.length,
            content: {
                html: '<h2 class="text-3xl font-bold text-center">New Custom Section</h2><p class="text-center">Edit this content...</p>',
                bgColor: '#ffffff',
                textColor: '#000000'
            }
        };

        const { error } = await supabase.from('sections').insert([newSection]);

        if (error) {
            console.error('Error creating section:', error);
            alert('Failed to create section: ' + (error.message || JSON.stringify(error)));
        } else {
            onUpdateSections([...sections, newSection]);
            setEditingId(newId); // Auto-open editor
        }
        setAdding(false);
    };

    const handleDeleteSection = async (id: string) => {
        const { error } = await supabase.from('sections').delete().eq('id', id);
        if (error) {
            console.error('Error deleting section:', error);
            alert('Failed to delete section');
        } else {
            const updated = sections.filter(s => s.id !== id);
            onUpdateSections(updated);
        }
    };

    return (
        <div className="animate-fade-in-up max-w-3xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Home Page Sections</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Manage standard and custom sections.
                        </p>
                    </div>
                    <button
                        onClick={handleAddSection}
                        disabled={adding}
                        className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                    >
                        {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add Section
                    </button>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sections.map(s => s.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {sections.map((section) => (
                                <SortableSectionRow
                                    key={section.id}
                                    section={section}
                                    onToggle={handleToggleVisibility}
                                    onEdit={handleEdit}
                                    isEditing={editingId === section.id}
                                    onUpdateSection={handleUpdateSection}
                                    onDelete={section.id.startsWith('section_') ? handleDeleteSection : undefined}
                                    t={t}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {sections.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        <p>No sections configuration found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
