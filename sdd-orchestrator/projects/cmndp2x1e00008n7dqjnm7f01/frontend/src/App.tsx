import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProductListPage from './pages/ProductListPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<ProductListPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
