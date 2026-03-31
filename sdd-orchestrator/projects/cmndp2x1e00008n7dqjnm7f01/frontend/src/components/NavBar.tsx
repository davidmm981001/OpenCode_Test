import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `nav-link ${isActive ? 'active fw-semibold' : ''}`;

export default function NavBar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <NavLink className="navbar-brand fw-bold" to="/" onClick={() => setExpanded(false)}>
          Inventario David
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          aria-label="Abrir navegación"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse ${expanded ? 'show' : ''}`}>
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className={linkClass} to="/" end onClick={() => setExpanded(false)}>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkClass} to="/about" onClick={() => setExpanded(false)}>
                About
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkClass} to="/contact" onClick={() => setExpanded(false)}>
                Contact
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
