import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { PromoSection } from '@/components/home/PromoSection';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading, needsProfileCompletion } = useAuth();

  useEffect(() => {
    // Si el usuario está autenticado y necesita completar su perfil, redirigir
    if (!isLoading && user && needsProfileCompletion === true) {
      navigate('/completar-perfil');
    }
  }, [user, isLoading, needsProfileCompletion, navigate]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturedProducts />
        <CategoriesSection />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Index;
