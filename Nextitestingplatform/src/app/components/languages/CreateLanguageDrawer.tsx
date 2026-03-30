import React, { useState, useEffect } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '../ui/sheet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import type { ProgrammingLanguage } from '../../data/mockData';

interface CreateLanguageDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Devuelve false para mantener el drawer abierto (p. ej. nombre duplicado). */
  onSave: (lang: { name: string; description: string }) => boolean | void;
  editingLanguage?: ProgrammingLanguage | null;
}

export function CreateLanguageDrawer({ open, onClose, onSave, editingLanguage }: CreateLanguageDrawerProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingLanguage) {
      setName(editingLanguage.name);
      setDescription(editingLanguage.description);
    } else {
      setName('');
      setDescription('');
    }
    setError('');
  }, [editingLanguage, open]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('El nombre del lenguaje es requerido.');
      return;
    }
    const ok = onSave({ name: name.trim(), description: description.trim() });
    if (ok !== false) handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={v => !v && handleClose()}>
      <SheetContent side="right" className="!w-[400px] !max-w-[400px] flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 py-5" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <SheetTitle>{editingLanguage ? 'Editar lenguaje' : 'Nuevo lenguaje de programación'}</SheetTitle>
          <SheetDescription>
            {editingLanguage
              ? 'Actualice el nombre o la descripción de este lenguaje.'
              : 'Añada un lenguaje al catálogo global. Estará disponible en todos los proyectos (Análisis Funcional).'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <Label htmlFor="lang-name" className="text-sm mb-1.5 block">
              Nombre del lenguaje <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="lang-name"
              placeholder="ej. Kotlin, Rust, PHP…"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              className={error ? 'border-rose-400' : ''}
            />
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
          </div>
          <div>
            <Label htmlFor="lang-desc" className="text-sm mb-1.5 block">Descripción</Label>
            <Textarea
              id="lang-desc"
              placeholder="Uso típico en pruebas o integración (frameworks, runtime…)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="resize-none"
              rows={5}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ayuda al equipo a elegir el lenguaje adecuado para generar y mantener scripts de prueba.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>{editingLanguage ? 'Actualizar' : 'Crear lenguaje'}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
