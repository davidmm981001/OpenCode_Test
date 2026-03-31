export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer mt-auto py-3 border-top bg-light">
      <div className="container text-center small text-muted">
        © {year} - Inventario David
      </div>
    </footer>
  );
}
