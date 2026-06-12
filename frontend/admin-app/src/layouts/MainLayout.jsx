import { Outlet } from 'react-router-dom';  // 👈 add this
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { MobileBottomNav } from '../components/common/MobileBottomNav';
import './Layout.css';

export const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-content">
        {children || <Outlet />}  {/* 👈 change this */}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};
