const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Business Traveler',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    rating: 5,
    text: 'Absolutely stunning hotel! The room service was exceptional, and the sports bar became my go-to spot for watching games. Will definitely be coming back.',
    stay: 'Stayed in March 2024',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Wedding Guest',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    rating: 5,
    text: 'We hosted our wedding reception in the garden space and it was magical! The team went above and beyond to make our day perfect.',
    stay: 'Stayed in February 2024',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Food Enthusiast',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    rating: 5,
    text: 'The restaurant menu is incredible! Every dish I tried was a masterpiece. The chef even came out to say hello. Highly recommend the ribeye steak!',
    stay: 'Stayed in January 2024',
  },
  {
    id: 4,
    name: 'David Park',
    role: 'Family Vacation',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    rating: 5,
    text: 'Perfect family getaway! The kids loved the pool, and we enjoyed the peaceful garden. The Deluxe Suite was spacious and comfortable.',
    stay: 'Stayed in December 2023',
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="section bg-secondary-50">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary-600 font-medium mb-2 block">Testimonials</span>
          <h2 className="section-title">What Our Guests Say</h2>
          <p className="section-subtitle">
            Real experiences from our valued guests
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="card p-6">
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Text */}
              <p className="text-secondary-600 mb-6 italic">"{testimonial.text}"</p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-secondary-900">{testimonial.name}</h4>
                  <p className="text-sm text-secondary-500">{testimonial.role}</p>
                </div>
              </div>

              {/* Stay Date */}
              <p className="text-xs text-secondary-400 mt-4">{testimonial.stay}</p>
            </div>
          ))}
        </div>

        {/* Overall Rating */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <div className="text-5xl font-bold text-secondary-900 mb-2">4.8</div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-secondary-600">out of 5</span>
              </div>
              <p className="text-secondary-500">Based on 2,500+ reviews</p>
            </div>

            <div className="flex-1 grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-secondary-900">98%</div>
                <div className="text-sm text-secondary-500">Cleanliness</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary-900">96%</div>
                <div className="text-sm text-secondary-500">Service</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary-900">94%</div>
                <div className="text-sm text-secondary-500">Dining</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

