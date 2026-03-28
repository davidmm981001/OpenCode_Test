export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-bar">
      <div>
        <strong>Mi Inventario</strong>
        <p>Inventario moderno con foco en claridad, velocidad y consistencia.</p>
      </div>
      <p>© {year} Mi Inventario. Todos los derechos reservados.</p>
    </footer>
  );
}
