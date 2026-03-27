import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'San Francisco, CA',
    text: 'The Classic Mango Pickle tastes exactly like my grandmother used to make. It brought tears to my eyes — pure nostalgia in a jar!',
    rating: 5,
    product: 'Classic Mango Pickle',
  },
  {
    name: 'David Chen',
    location: 'New York, NY',
    text: 'I ordered the Gift Sampler for my wife and she absolutely loved it. The quality is outstanding and the packaging is beautiful.',
    rating: 5,
    product: 'Pickle Gift Sampler',
  },
  {
    name: 'Anita Patel',
    location: 'Austin, TX',
    text: 'The Ghost Pepper Pickle is no joke! Perfect heat level for spice lovers. I\'ve been ordering monthly since I discovered this gem.',
    rating: 5,
    product: 'Ghost Pepper Pickle',
  },
  {
    name: 'Michael Torres',
    location: 'Chicago, IL',
    text: 'Best lemon pickle I\'ve ever had. The tangy flavor is perfectly balanced with the spices. My whole family is addicted!',
    rating: 5,
    product: 'Classic Lemon Pickle',
  },
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 bg-amber-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 font-serif">What Our Customers Say</h2>
          <p className="text-gray-600 mt-2">Real reviews from our pickle-loving community</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <Quote className="w-8 h-8 text-green-200 mb-4" />
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                <p className="text-xs text-gray-500">{testimonial.location}</p>
                <p className="text-xs text-green-600 mt-1 font-medium">{testimonial.product}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
