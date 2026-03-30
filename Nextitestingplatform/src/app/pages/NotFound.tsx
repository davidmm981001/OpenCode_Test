import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { TestTube2 } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-full py-32 gap-4 text-center">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: '#f0f3ff' }}>
        <TestTube2 size={24} style={{ color: '#202950' }} />
      </div>
      <h1 className="text-foreground">404 — Página No Encontrada</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        La página que busca no existe o ha sido movida.
      </p>
      <Button onClick={() => navigate('/')}>Ir al Panel</Button>
    </div>
  );
}