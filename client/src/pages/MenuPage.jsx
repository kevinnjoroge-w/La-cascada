import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { menuAPI } from '../services/api';
import toast from 'react-hot-toast';

const MenuPage = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo data for now
    setCategories([
      { _id: 'all', name: 'All Items', icon: '🍽️' },
      { _id: 'appetizers', name: 'Appetizers', icon: '🥗' },
      { _id: 'main-course', name: 'Main Course', icon: '🍖' },
      { _id: 'pizza', name: 'Pizza', icon: '🍕' },
      { _id: 'seafood', name: 'Seafood', icon: '🦐' },
      { _id: 'desserts', name: 'Desserts', icon: '🍰' },
      { _id: 'drinks', name: 'Drinks', icon: '🍺' },
    ]);

    setItems([
      { _id: 1, name: 'Caesar Salad', description: 'Fresh romaine with parmesan and croutons', price: 1950, category: 'appetizers', isVegetarian: true, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400' },
      { _id: 2, name: 'Grilled Salmon', description: 'Atlantic salmon with lemon butter', price: 4350, category: 'seafood', isGlutenFree: true, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400' },
      { _id: 3, name: 'Margherita Pizza', description: 'Classic pizza with fresh mozzarella', price: 2550, category: 'pizza', isVegetarian: true, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
      { _id: 4, name: 'Ribeye Steak', description: '12oz USDA Prime with garlic mashed potatoes', price: 6450, category: 'main-course', isGlutenFree: true, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
      { _id: 5, name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center', price: 1500, category: 'desserts', isVegetarian: true, image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400' },
      { _id: 6, name: 'Craft Beer', description: 'Local craft beer selection', price: 1200, category: 'drinks', image: 'https://images.unsplash.com/photo-1575037614876-c38a4d44f5b8?w=400' },
    ]);
    setLoading(false);
  }, []);

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter(item => item.category === activeCategory);

  const handleAddToCart = (item) => {
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-primary-600 font-medium mb-2 block">Our Menu</span>
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">Culinary Delights</h1>
          <p className="text-secondary-600 max-w-2xl mx-auto">
            Discover our carefully crafted dishes made with the finest ingredients
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeCategory === cat._id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white text-secondary-600 hover:bg-secondary-100'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {item.isVegetarian && <span className="badge bg-green-500 text-white">V</span>}
                    {item.isGlutenFree && <span className="badge bg-blue-500 text-white">GF</span>}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-secondary-900">{item.name}</h3>
                    <span className="text-xl font-bold text-primary-600">KES {item.price.toLocaleString()}</span>
                  </div>
                  <p className="text-secondary-600 text-sm mb-4">{item.description}</p>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="btn-primary w-full"
                  >
                    Add to Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;

