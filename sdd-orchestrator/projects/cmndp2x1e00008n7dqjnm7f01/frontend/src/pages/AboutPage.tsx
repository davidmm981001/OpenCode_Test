import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function AboutPage() {
  useDocumentTitle('About');

  return (
    <section className="page-section">
      <h1 className="h3">About</h1>
      <p className="lead mb-2">Your application description page.</p>
      <p>Use this area to provide additional information.</p>
    </section>
  );
}
