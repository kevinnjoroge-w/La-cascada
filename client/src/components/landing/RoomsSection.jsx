import { Link } from 'react-router-dom';

const rooms = [
  {
    id: 1,
    name: 'Standard Room',
    type: 'standard',
    price: 22500,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    features: ['King Bed', 'City View', 'Free WiFi', '32" TV'],
    size: 35,
    capacity: 2,
  },
  {
    id: 2,
    name: 'Deluxe Suite',
    type: 'deluxe',
    price: 37500,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    features: ['King Bed', 'Ocean View', 'Mini Bar', 'Smart TV'],
    size: 45,
    capacity: 2,
    featured: true,
  },
  {
    id: 3,
    name: 'Executive Suite',
    type: 'suite',
    price: 60000,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    features: ['King Bed', 'Balcony', 'Jacuzzi', 'Work Desk'],
    size: 65,
    capacity: 3,
  },
  {
    id: 4,
    name: 'Presidential Suite',
    type: 'presidential',
    price: 135000,
    image: 'https://images.unsplash.com/photo-1591088398332-c518a23170f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    features: ['2 Bedrooms', 'Panoramic View', 'Private Pool', 'Butler Service'],
    size: 120,
    capacity: 4,
  },
];

const RoomsSection = () => {
  return (
    <section id="rooms" className="section bg-secondary-50">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary-600 font-medium mb-2 block">Accommodations</span>
          <h2 className="section-title">Luxury Rooms & Suites</h2>
          <p className="section-subtitle">
            Experience comfort and elegance in our thoughtfully designed rooms
          </p>
        </div>

        {/* Rooms Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {rooms.map((room) => (
            <div key={room.id} className={`card group ${room.featured ? 'ring-2 ring-primary-500' : ''}`}>
              {/* Featured Badge */}
              {room.featured && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="badge-primary">Featured</span>
                </div>
              )}

              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="text-2xl font-bold">KES {room.price.toLocaleString()}</span>
                  <span className="text-sm opacity-80">/night</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-secondary-900">{room.name}</h3>
                </div>
                <p className="text-secondary-500 text-sm mb-4 capitalize">{room.type} Room</p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {room.features.slice(0, 3).map((feature) => (
                    <span key={feature} className="text-xs px-2 py-1 bg-secondary-100 rounded-full text-secondary-600">
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Details */}
                <div className="flex items-center gap-4 text-sm text-secondary-500 mb-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    {room.size}m²
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {room.capacity} Guests
                  </span>
                </div>

                <Link
                  to="/book/room"
                  className="btn-primary w-full text-center py-2 text-sm"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-12">
          <Link to="/book/room" className="btn-outline">
            View All Rooms
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RoomsSection;

