import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('muestra el saludo simple', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /hola, opencode/i }),
    ).toBeInTheDocument();
  });
});
