import { NavLink } from 'react-router-dom';

export default function NavBar() {
  return (
    <header className="topbar">
      <div className="brand-block">
        <div className="brand-mark" aria-hidden="true">
          MI
        </div>
        <div>
          <p className="eyebrow">Mi Inventario</p>
          <h1>Gestion clara de productos</h1>
          <p className="topbar-copy">Una experiencia mas limpia, rapida y visual para operar el inventario.</p>
        </div>
      </div>

      <nav className="nav-links" aria-label="Navegacion principal">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Home
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          About
        </NavLink>
        <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Contact
        </NavLink>
      </nav>
    </header>
  );
}
