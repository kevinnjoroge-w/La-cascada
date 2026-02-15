import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1549294413-26f195200c16?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="La Cascada Garden"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary-900/70 via-secondary-900/50 to-secondary-900/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom text-center text-white px-4">
        <div className="animate-fade-in">
          <span className="inline-block px-4 py-2 bg-primary-600/30 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/20">
            ✨ Welcome to La Cascada Sports Bar & Gardens
          </span>
        </div>

        Experience <span className="text-gradient">Nature & Vibrant Life</span>
        <br />
        at La Cascada

        Discover a serene garden retreat with an enchanting waterfall,
        a top-tier restaurant, a lively sports bar, and stylish accommodations in Ruaka.

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-slide-up animate-delay-200">
          <Link to="/book/room" className="btn-primary group">
            <span>Book a Room</span>
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link to="/book/table" className="btn bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/30">
            <span>Reserve Table</span>
          </Link>
          <Link to="/menu" className="btn bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/30">
            <span>View Menu</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in animate-delay-300">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-1">90%</div>
            <div className="text-white/60 text-sm">Guest Approval</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-1">550+</div>
            <div className="text-white/60 text-sm">Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-1">24/7</div>
            <div className="text-white/60 text-sm">Open Daily</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-1">100%</div>
            <div className="text-white/60 text-sm">Nature Focused</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/60 rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

