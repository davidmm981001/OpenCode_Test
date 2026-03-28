import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import NavBar from './NavBar';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="page-frame">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
