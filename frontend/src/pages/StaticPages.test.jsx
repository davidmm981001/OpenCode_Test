import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';

describe('Paginas estaticas', () => {
  it('muestra contenido about', () => {
    render(<AboutPage />);

    expect(screen.getByText('Acerca de la aplicacion')).toBeInTheDocument();
  });

  it('muestra contenido contact', () => {
    render(<ContactPage />);

    expect(screen.getByText('Datos de contacto')).toBeInTheDocument();
    expect(screen.getByText('Support@example.com')).toBeInTheDocument();
  });
});
