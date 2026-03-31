import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import NavBar from './NavBar';

export default function AppLayout() {
  return (
    <div className="app-shell d-flex flex-column min-vh-100">
      <NavBar />
      <main className="flex-grow-1 py-4">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
