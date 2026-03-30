import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, CalendarIcon, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Calendar } from '../components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useApp } from '../context/AppContext';
import { ProjectStatus } from '../data/mockData';
import { cn } from '../components/ui/utils';

const STATUS_OPTIONS: ProjectStatus[] = ['Planificación', 'Activo', 'En Espera', 'En Riesgo', 'Completado'];

function DatePickerField({
  label,
  value,
  onChange,
  id,
}: {
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  id: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [dropUp, setDropUp] = useState(false);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      // Check if there's enough space below
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setDropUp(spaceBelow < 320);
      }
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleClickOutside]);

  return (
    <div ref={ref} className="relative">
      <Label htmlFor={id} className="text-sm mb-1.5 block">{label}</Label>
      <div
        id={id}
        role="button"
        tabIndex={0}
        onClick={() => setOpen(prev => !prev)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(prev => !prev); }}
        className={cn(
          'flex items-center w-full h-9 rounded-md border px-3 text-sm bg-input-background cursor-pointer transition-colors hover:bg-accent/50 select-none',
          !value && 'text-muted-foreground',
          open && 'ring-2 ring-ring/50 border-ring'
        )}
        style={{ borderColor: open ? undefined : 'rgba(0,0,0,0.1)' }}
      >
        <CalendarIcon className="mr-2 size-4 text-[#717182] shrink-0" />
        <span>{value ? format(value, 'dd/MM/yyyy', { locale: es }) : 'Seleccionar fecha'}</span>
      </div>
      {open && (
        <div
          ref={calendarRef}
          className={cn(
            'absolute left-0 z-[100] rounded-md border bg-white shadow-lg',
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
          )}
          style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
            locale={es}
          />
        </div>
      )}
    </div>
  );
}

export default function CreateProject() {
  const navigate = useNavigate();
  const { addProject } = useApp();

  const [form, setForm] = useState({
    name: '',
    description: '',
    owner: '',
    status: 'Planificación' as ProjectStatus,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    realStartDate: undefined as Date | undefined,
    realEndDate: undefined as Date | undefined,
  });

  const [errors, setErrors] = useState<{ name?: string }>({});

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'name' && value.trim()) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const handleDateChange = (field: string, date: Date | undefined) => {
    setForm(prev => ({ ...prev, [field]: date }));
  };

  const formatDateStr = (d: Date | undefined) => d ? format(d, 'yyyy-MM-dd') : '';

  const handleSave = () => {
    if (!form.name.trim()) {
      setErrors({ name: 'El nombre del proyecto es requerido.' });
      return;
    }
    addProject({
      name: form.name.trim(),
      description: form.description.trim(),
      owner: form.owner.trim() || 'Sin asignar',
      components: 0,
      progress: 0,
      status: form.status,
      startDate: formatDateStr(form.startDate),
      endDate: formatDateStr(form.endDate),
      realStartDate: formatDateStr(form.realStartDate) || undefined,
      realEndDate: formatDateStr(form.realEndDate) || undefined,
    });
    navigate('/projects');
  };

  return (
    <div className="p-6 max-w-[860px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/projects')}
          className="shrink-0"
        >
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-foreground">Crear Nuevo Proyecto</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Complete los datos para inicializar un nuevo proyecto de pruebas.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div
        className="bg-white rounded-lg"
        style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="p-6 space-y-8">
          {/* Información Básica */}
          <section>
            <h4
              className="text-sm uppercase tracking-wide mb-4"
              style={{ color: '#717182', letterSpacing: '0.05em', fontWeight: 600 }}
            >
              Información Básica
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="proj-name" className="text-sm mb-1.5 block">
                    Nombre del Proyecto <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="proj-name"
                    placeholder="ej. Rediseño de Plataforma E-Commerce"
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    className={errors.name ? 'border-rose-400 focus-visible:ring-rose-200' : ''}
                  />
                  {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="proj-owner" className="text-sm mb-1.5 block">Responsable</Label>
                  <Input
                    id="proj-owner"
                    placeholder="ej. Juan Pérez"
                    value={form.owner}
                    onChange={e => handleChange('owner', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="proj-desc" className="text-sm mb-1.5 block">Descripción</Label>
                <Textarea
                  id="proj-desc"
                  placeholder="Describa el alcance, objetivos y contexto del proyecto..."
                  value={form.description}
                  onChange={e => handleChange('description', e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="proj-status" className="text-sm mb-1.5 block">Estado</Label>
                <Select value={form.status} onValueChange={v => handleChange('status', v)}>
                  <SelectTrigger id="proj-status">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Fechas Planificadas */}
          <section>
            <h4
              className="text-sm uppercase tracking-wide mb-4"
              style={{ color: '#717182', letterSpacing: '0.05em', fontWeight: 600 }}
            >
              Fechas Planificadas
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <DatePickerField
                label="Fecha de Inicio"
                id="proj-start"
                value={form.startDate}
                onChange={d => handleDateChange('startDate', d)}
              />
              <DatePickerField
                label="Fecha de Fin"
                id="proj-end"
                value={form.endDate}
                onChange={d => handleDateChange('endDate', d)}
              />
            </div>
          </section>

          {/* Fechas Reales */}
          <section>
            <h4
              className="text-sm uppercase tracking-wide mb-4"
              style={{ color: '#717182', letterSpacing: '0.05em', fontWeight: 600 }}
            >
              Fechas Reales{' '}
              <span className="normal-case font-normal text-xs text-muted-foreground">(opcional)</span>
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <DatePickerField
                label="Inicio Real"
                id="proj-real-start"
                value={form.realStartDate}
                onChange={d => handleDateChange('realStartDate', d)}
              />
              <DatePickerField
                label="Fin Real"
                id="proj-real-end"
                value={form.realEndDate}
                onChange={d => handleDateChange('realEndDate', d)}
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4"
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
        >
          <Button variant="outline" onClick={() => navigate('/projects')}>Cancelar</Button>
          <Button onClick={handleSave} className="gap-2">
            <Save size={15} />
            Guardar Proyecto
          </Button>
        </div>
      </div>
    </div>
  );
}
