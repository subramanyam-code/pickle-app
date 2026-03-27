import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import HeroSection from '@/components/HeroSection';
import FeaturedProducts from '@/components/FeaturedProducts';
import CollectionGrid from '@/components/CollectionGrid';
import AllProductsSection from '@/components/AllProductsSection';
import StorySection from '@/components/StorySection';
import TestimonialsSection from '@/components/TestimonialsSection';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-amber-50/30">
      <Header />
      <AuthModal />

      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Featured / Bestseller Products */}
        <FeaturedProducts />

        {/* Shop by Category */}
        <CollectionGrid />

        {/* Our Story */}
        <StorySection />

        {/* All Products with Search & Filter */}
        <AllProductsSection />

        {/* Testimonials */}
        <TestimonialsSection />
      </main>

      <Footer />
    </div>
  );
};

export default AppLayout;
