import { useState } from 'react';
import { Link } from 'react-router-dom';

const menuCategories = [
  { id: 'all', name: 'All', icon: '🍽️' },
  { id: 'appetizers', name: 'Appetizers', icon: '🥗' },
  { id: 'main-course', name: 'Main Course', icon: '🍖' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'seafood', name: 'Seafood', icon: '🦐' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' },
  { id: 'drinks', name: 'Drinks', icon: '🍺' },
];

const menuItems = [
  {
    id: 1,
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with parmesan, croutons, and house-made Caesar dressing',
    price: 1950,
    category: 'appetizers',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    isVegetarian: true,
    isFeatured: true,
  },
  {
    id: 2,
    name: 'Grilled Salmon',
    description: 'Atlantic salmon with lemon butter sauce, seasonal vegetables, and rice',
    price: 4350,
    category: 'seafood',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    isGlutenFree: true,
    isFeatured: true,
  },
  {
    id: 3,
    name: 'Margherita Pizza',
    description: 'Classic pizza with fresh mozzarella, tomatoes, and basil',
    price: 2550,
    category: 'pizza',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    isVegetarian: true,
  },
  {
    id: 4,
    name: 'Ribeye Steak',
    description: '12oz USDA Prime ribeye with garlic mashed potatoes and grilled asparagus',
    price: 6450,
    category: 'main-course',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    isGlutenFree: true,
    isFeatured: true,
  },
  {
    id: 5,
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
    price: 1500,
    category: 'desserts',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    isVegetarian: true,
  },
  {
    id: 6,
    name: 'Craft Beer Selection',
    description: 'Ask about our rotating selection of local craft beers',
    price: 1200,
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1575037614876-c38a4d44f5b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
];

const MenuSection = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <section id="menu" className="section bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary-600 font-medium mb-2 block">Our Menu</span>
          <h2 className="section-title">Culinary Delights</h2>
          <p className="section-subtitle">
            Discover our carefully crafted dishes made with the finest ingredients
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {menuCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div key={item.id} className="card group overflow-hidden">
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {item.isFeatured && (
                    <span className="badge bg-yellow-500 text-white">Featured</span>
                  )}
                  {item.isVegetarian && (
                    <span className="badge bg-green-500 text-white">V</span>
                  )}
                  {item.isGlutenFree && (
                    <span className="badge bg-blue-500 text-white">GF</span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-secondary-900">{item.name}</h3>
                  <span className="text-xl font-bold text-primary-600">KES {item.price.toLocaleString()}</span>
                </div>
                <p className="text-secondary-600 text-sm mb-4 line-clamp-2">{item.description}</p>

                <Link
                  to="/menu"
                  className="btn-outline w-full text-center py-2 text-sm"
                >
                  Add to Order
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View Full Menu */}
        <div className="text-center mt-12">
          <Link to="/menu" className="btn-primary">
            View Full Menu
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MenuSection;

