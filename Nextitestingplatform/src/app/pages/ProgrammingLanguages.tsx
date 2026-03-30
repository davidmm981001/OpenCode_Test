import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Code2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useApp } from '../context/AppContext';
import type { ProgrammingLanguage } from '../data/mockData';
import { CreateLanguageDrawer } from '../components/languages/CreateLanguageDrawer';
import { fadeUp } from '../components/motion/variants';

function LangAvatar({ name }: { name: string }) {
  const colors = ['#202950', '#8b5cf6', '#58B888', '#f59e0b', '#f43f5e', '#06b6d4'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center"
      style={{ backgroundColor: `${color}18` }}
    >
      <Code2 size={16} style={{ color }} />
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-EC', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProgrammingLanguages() {
  const { programmingLanguages, addProgrammingLanguage, updateProgrammingLanguage, deleteProgrammingLanguage } = useApp();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<ProgrammingLanguage | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = programmingLanguages.filter(
    l =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (data: { name: string; description: string }) => {
    const dup = programmingLanguages.some(
      l => l.name.toLowerCase() === data.name.toLowerCase() && l.id !== editingLanguage?.id
    );
    if (dup) {
      alert('Ya existe un lenguaje con ese nombre.');
      return false;
    }
    if (editingLanguage) {
      updateProgrammingLanguage(editingLanguage.id, data);
    } else {
      addProgrammingLanguage(data);
    }
    setEditingLanguage(null);
    return true;
  };

  const handleEdit = (lang: ProgrammingLanguage) => {
    setEditingLanguage(lang);
    setDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      deleteProgrammingLanguage(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <h1 className="text-foreground">Lenguajes de programación</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Catálogo global usado en la configuración de contexto del Análisis Funcional de cada proyecto.
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button
            onClick={() => { setEditingLanguage(null); setDrawerOpen(true); }}
            className="gap-2"
          >
            <Plus size={16} /> Nuevo lenguaje
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        className="rounded-lg p-4 flex items-start gap-3"
        style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <Code2 size={16} style={{ color: '#166534', flexShrink: 0, marginTop: 1 }} />
        <p className="text-sm" style={{ color: '#14532d' }}>
          Los cambios aquí se reflejan al instante en el workspace de proyectos: chips de lenguaje de script,
          panel «Gestionar lenguajes» y generación BDD. Más adelante el backend puede sustituir este estado local.
        </p>
      </motion.div>

      <motion.div
        className="bg-white rounded-lg"
        style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar lenguajes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} lenguaje{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              {['Lenguaje', 'Descripción', 'Creado', 'Acciones'].map(col => (
                <th
                  key={col}
                  className="px-5 py-3 text-left text-xs uppercase tracking-wider"
                  style={{ color: '#717182', fontWeight: 500 }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.tr
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Code2 size={32} className="opacity-20" />
                      <p className="text-sm">No se encontraron lenguajes.</p>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                filtered.map((lang: ProgrammingLanguage, idx: number) => (
                  <motion.tr
                    key={lang.id}
                    style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f8f9fb'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <LangAvatar name={lang.name} />
                        <span className="text-sm font-medium text-foreground">{lang.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-md">
                      <p className="text-sm text-muted-foreground line-clamp-2">{lang.description}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">{formatDate(lang.createdAt)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <motion.button
                          onClick={() => handleEdit(lang)}
                          className="p-1.5 rounded-md transition-colors text-muted-foreground"
                          title="Editar lenguaje"
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f0f0f4'; (e.currentTarget as HTMLElement).style.color = '#030213'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#717182'; }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit3 size={14} />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(lang.id)}
                          className="p-1.5 rounded-md transition-colors"
                          title={confirmDelete === lang.id ? 'Haga clic de nuevo para confirmar' : 'Eliminar lenguaje'}
                          style={{ color: confirmDelete === lang.id ? '#ef4444' : '#717182' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fff1f2'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; if (confirmDelete !== lang.id) (e.currentTarget as HTMLElement).style.color = '#717182'; }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 size={14} />
                        </motion.button>
                        <AnimatePresence>
                          {confirmDelete === lang.id && (
                            <motion.span
                              className="text-xs text-rose-500 ml-1 whitespace-nowrap"
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -6 }}
                              transition={{ duration: 0.2 }}
                            >
                              Haga clic de nuevo para confirmar
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>

      <CreateLanguageDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingLanguage(null);
        }}
        onSave={handleSave}
        editingLanguage={editingLanguage}
      />
    </div>
  );
}
