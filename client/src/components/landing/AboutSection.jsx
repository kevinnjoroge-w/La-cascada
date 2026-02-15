import { Link } from 'react-router-dom';

const AboutSection = () => {
  const features = [
    {
      icon: '🏨',
      title: 'Luxury Accommodation',
      description: '150+ beautifully appointed rooms and suites with world-class amenities',
    },
    {
      icon: '🍺',
      title: 'Sports Bar & Restaurant',
      description: 'Vibrant dining experience with live sports and gourmet cuisine',
    },
    {
      icon: '🌳',
      title: 'Garden Event Space',
      description: 'Stunning outdoor venue for weddings, corporate events, and celebrations',
    },
  ];

  return (
    <section id="about" className="section bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary-600 font-medium mb-2 block">About Us</span>
          <h2 className="section-title">Discover Our World</h2>
          <p className="section-subtitle">
            Welcome to La Cascada Sports Bar and Gardens — where nature meets vibrant life
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-secondary-900">
              A Premier Destination for <span className="text-primary-600">Every Occasion</span>
            </h3>
            <p className="text-secondary-600 mb-6 leading-relaxed">
              Located along Limuru Road in Ruaka, Nairobi, La Cascada is a serene garden
              retreat featuring an enchanting waterfall. We offer a unique blend of
              relaxation and entertainment, making us a true gem for nature lovers.
            </p>
            <p className="text-secondary-600 mb-8 leading-relaxed">
              From our top-tier restaurant and lively sports bar to stylish accommodations
              and versatile event spaces, we provide a "home away from home" atmosphere
              that guests have loved and recommended for years.
            </p>
            <Link to="/book/room" className="btn-primary">
              Explore Our Services
            </Link>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1025&q=80"
              alt="Hotel Interior"
              className="rounded-2xl shadow-2xl w-full"
            />
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 hidden md:block">
              <div className="text-4xl font-bold text-primary-600">15+</div>
              <div className="text-secondary-600">Years of Excellence</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="card p-8 text-center group hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4 text-secondary-900">{feature.title}</h3>
              <p className="text-secondary-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

