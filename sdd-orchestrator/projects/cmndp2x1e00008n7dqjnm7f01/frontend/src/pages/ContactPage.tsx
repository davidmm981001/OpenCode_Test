import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function ContactPage() {
  useDocumentTitle('Contact');

  return (
    <section className="page-section">
      <h1 className="h3 mb-3">Contact</h1>
      <address className="mb-4">
        One Microsoft Way<br />
        Redmond, WA 98052-6399<br />
        <abbr title="Phone">P:</abbr> 425.555.0100
      </address>

      <p className="mb-1">
        <strong>Support:</strong>{' '}
        <a href="mailto:Support@example.com">Support@example.com</a>
      </p>
      <p>
        <strong>Marketing:</strong>{' '}
        <a href="mailto:Marketing@example.com">Marketing@example.com</a>
      </p>
    </section>
  );
}
