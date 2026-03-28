import { useEffect } from 'react';

export default function ContactPage() {
  useEffect(() => {
    document.title = 'Contact | Mi Inventario';
  }, []);

  return (
    <section className="info-card page-enter">
      <p className="eyebrow">Contact</p>
      <h2>Datos de contacto</h2>
      <div className="contact-grid">
        <div>
          <h3>Direccion</h3>
          <p>One Microsoft Way, Redmond, WA 98052-6399</p>
        </div>
        <div>
          <h3>Telefono</h3>
          <p>425.555.0100</p>
        </div>
        <div>
          <h3>Correos</h3>
          <p>
            <a href="mailto:Support@example.com">Support@example.com</a>
          </p>
          <p>
            <a href="mailto:Marketing@example.com">Marketing@example.com</a>
          </p>
        </div>
      </div>
    </section>
  );
}
