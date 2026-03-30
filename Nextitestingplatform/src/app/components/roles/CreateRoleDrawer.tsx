import React, { useState, useEffect } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '../ui/sheet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { AIRole } from '../../data/mockData';

interface CreateRoleDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (role: { name: string; description: string }) => void;
  editingRole?: AIRole | null;
}

export function CreateRoleDrawer({ open, onClose, onSave, editingRole }: CreateRoleDrawerProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingRole) {
      setName(editingRole.name);
      setDescription(editingRole.description);
    } else {
      setName('');
      setDescription('');
    }
    setError('');
  }, [editingRole, open]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('El nombre del rol es requerido.');
      return;
    }
    onSave({ name: name.trim(), description: description.trim() });
    handleClose();
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
          <SheetTitle>{editingRole ? 'Editar Rol' : 'Crear Rol de IA'}</SheetTitle>
          <SheetDescription>
            {editingRole
              ? 'Actualice la configuración de este rol de IA.'
              : 'Defina un nuevo rol de IA para usar en el contexto del Análisis Funcional.'
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <Label htmlFor="role-name" className="text-sm mb-1.5 block">
              Nombre del Rol <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="role-name"
              placeholder="ej. Experto COBOL, Especialista UX..."
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              className={error ? 'border-rose-400' : ''}
            />
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
          </div>
          <div>
            <Label htmlFor="role-desc" className="text-sm mb-1.5 block">Descripción</Label>
            <Textarea
              id="role-desc"
              placeholder="Describa la experiencia y área de enfoque de este rol de IA..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="resize-none"
              rows={5}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Esta descripción ayuda a la IA a comprender la perspectiva y experiencia que debe aplicar al generar escenarios BDD.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>{editingRole ? 'Actualizar Rol' : 'Crear Rol'}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}