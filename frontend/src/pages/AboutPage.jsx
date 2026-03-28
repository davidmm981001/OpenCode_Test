import { useEffect } from 'react';

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About | Mi Inventario';
  }, []);

  return (
    <section className="info-card page-enter">
      <p className="eyebrow">About</p>
      <h2>Acerca de la aplicacion</h2>
      <p>Your application description page.</p>
      <p>Use this area to provide additional information.</p>
      <div className="contact-grid">
        <div>
          <h3>Enfoque</h3>
          <p>Menos ruido visual, mas claridad operativa.</p>
        </div>
        <div>
          <h3>Estilo</h3>
          <p>Una interfaz editorial, sobria y moderna.</p>
        </div>
        <div>
          <h3>Uso</h3>
          <p>Ideal para tareas rapidas del inventario diario.</p>
        </div>
      </div>
    </section>
  );
}
