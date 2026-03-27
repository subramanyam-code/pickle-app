import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, Sparkles, Users } from 'lucide-react';

const StorySection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-green-900 to-green-950 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <span className="text-amber-400 text-sm font-semibold uppercase tracking-widest">Our Story</span>
            <h2 className="text-3xl lg:text-4xl font-bold font-serif mt-3 leading-tight">
              Three Generations of{' '}
              <span className="text-amber-400">Pickle Perfection</span>
            </h2>
            <p className="mt-6 text-green-100/80 leading-relaxed">
              It all started in Grandma's kitchen — a small room filled with the aroma of mustard oil, 
              turmeric, and love. What began as a family tradition has grown into a passion for sharing 
              authentic, handcrafted pickles with the world.
            </p>
            <p className="mt-4 text-green-100/80 leading-relaxed">
              Every jar we make follows the same time-honored recipes, using only the freshest ingredients 
              sourced from local farms. No preservatives, no shortcuts — just pure, authentic flavor.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">50+</p>
                  <p className="text-sm text-green-300">Years of Tradition</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">12</p>
                  <p className="text-sm text-green-300">Unique Flavors</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">100%</p>
                  <p className="text-sm text-green-300">Natural Ingredients</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">10K+</p>
                  <p className="text-sm text-green-300">Happy Customers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden aspect-[3/4]">
                <img
                  src="https://d64gsuwffb70l.cloudfront.net/69c4c665978d2984325b4c28_1774503716457_645bbbf9.png"
                  alt="Artisanal pickle making"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square">
                <img
                  src="https://d64gsuwffb70l.cloudfront.net/69c4c665978d2984325b4c28_1774503775031_b5b9cd78.jpg"
                  alt="Fresh ingredients"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="rounded-2xl overflow-hidden aspect-square">
                <img
                  src="https://d64gsuwffb70l.cloudfront.net/69c4c665978d2984325b4c28_1774503829452_41611cb2.png"
                  alt="Spice blend"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-[3/4]">
                <img
                  src="https://d64gsuwffb70l.cloudfront.net/69c4c665978d2984325b4c28_1774503754394_d565dc33.png"
                  alt="Traditional recipe"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
