import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Award, Leaf } from 'lucide-react';

const HERO_IMAGE = 'https://d64gsuwffb70l.cloudfront.net/69c4c665978d2984325b4c28_1774503667078_86881ea9.png';

const HeroSection: React.FC = () => {
  return (
    <section className="relative">
      {/* Hero */}
      <div className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Artisanal pickles on rustic table"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-950/90 via-green-900/70 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-400/30 rounded-full text-amber-200 text-sm font-medium mb-6 backdrop-blur-sm">
              <Leaf className="w-4 h-4" />
              100% Handcrafted & Natural
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white font-serif leading-tight">
              Taste the{' '}
              <span className="text-amber-400">Tradition</span>
              <br />
              in Every Jar
            </h1>

            <p className="mt-6 text-lg text-green-100/90 leading-relaxed max-w-lg">
              Authentic homemade pickles crafted with love using generations-old family recipes.
              From tangy mango to fiery ghost pepper — discover flavors that bring memories to life.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/collections/all-pickles"
                className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5"
              >
                Shop Our Pickles
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/collections/bestsellers"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20"
              >
                View Bestsellers
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="bg-green-50 border-y border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 justify-center sm:justify-start">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="font-semibold text-green-900 text-sm">Free Shipping</p>
                <p className="text-xs text-green-600">On all orders</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                <Award className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <p className="font-semibold text-green-900 text-sm">Premium Quality</p>
                <p className="text-xs text-green-600">100% natural ingredients</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center sm:justify-end">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <Leaf className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="font-semibold text-green-900 text-sm">Small Batch</p>
                <p className="text-xs text-green-600">Handmade with love</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
