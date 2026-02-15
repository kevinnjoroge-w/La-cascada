require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const MenuCategory = require('./models/MenuCategory');
const MenuItem = require('./models/MenuItem');

const africanCategories = [
  { name: 'Appetizers', _key: 'appetizers', icon: '🥟' },
  { name: 'Main Course', _key: 'main-course', icon: '🍛' },
  { name: 'Desserts', _key: 'desserts', icon: '🍮' },
  { name: 'Drinks', _key: 'drinks', icon: '🧋' },
];

const africanItems = [
  {
    name: 'Ugali with Sukuma Wiki',
    description: 'Classic Kenyan staple — maize meal served with sautéed collard greens and onions',
    price: 250,
    categoryKey: 'main-course',
    images: [{ url: 'https://images.unsplash.com/photo-1606787620884-4e5fe4330454?auto=format&fit=crop&w=400&q=80' }],
    isAvailable: true,
  },
  {
    name: 'Nyama Choma (Grilled Beef)',
    description: 'Charcoal-grilled beef served with kachumbari and ugali or fries',
    price: 1200,
    categoryKey: 'main-course',
    images: [{ url: 'https://images.unsplash.com/photo-1555939594-58d7cb561411?auto=format&fit=crop&w=400&q=80' }],
    isAvailable: true,
  },
  {
    name: 'Pilau Rice with Beef',
    description: 'Aromatic spiced rice cooked with tender beef, served with salad',
    price: 450,
    categoryKey: 'main-course',
    images: [{ url: 'https://images.unsplash.com/photo-1596040424546-1f77f1b0f6b5?auto=format&fit=crop&w=400&q=80' }],
    isAvailable: true,
  },
  {
    name: 'Githeri (Beans & Maize)',
    description: 'Hearty homemade mix of boiled maize and beans with light seasoning',
    price: 220,
    categoryKey: 'main-course',
    images: [{ url: 'https://images.unsplash.com/photo-1589980811487-07d9c4dd2c6f?auto=format&fit=crop&w=400&q=80' }],
    isAvailable: true,
  },
  {
    name: 'Samosas (3 pcs)',
    description: 'Crispy filled pastries with spiced beef or vegetable filling',
    price: 180,
    categoryKey: 'appetizers',
    images: [{ url: 'https://images.unsplash.com/photo-1599599810694-b4ea1a1c8f4b?auto=format&fit=crop&w=400&q=80' }],
    isAvailable: true,
  },
  {
    name: 'Chapati & Beef Stew',
    description: 'Soft chapati served with slow-cooked beef stew and vegetables',
    price: 420,
    categoryKey: 'main-course',
    images: [{ url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=400&q=80' }],
    isAvailable: true,
  },
  {
    name: 'Mandazi (3 pcs)',
    description: 'Light and fluffy East African doughnuts, perfect with tea',
    price: 90,
    categoryKey: 'desserts',
    images: [{ url: 'https://images.unsplash.com/photo-1585518419759-98f5ff49e08a?auto=format&fit=crop&w=400&q=80' }],
    isAvailable: true,
  },
  {
    name: 'Chai (Kenyan Tea)',
    description: 'Strong brewed Kenyan tea with milk and a touch of sugar',
    price: 60,
    categoryKey: 'drinks',
    images: [{ url: 'https://images.unsplash.com/photo-1597318013269-cd5a4b21afc2?auto=format&fit=crop&w=400&q=80' }],
    isAvailable: true,
  },
  {
    name: 'Fresh Passion Fruit Juice',
    description: 'Freshly squeezed passion fruit juice, lightly sweetened',
    price: 180,
    categoryKey: 'drinks',
    images: [{ url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=400&q=80' }],
    isAvailable: true,
  },
];

const importData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing menu categories and items...');
    await MenuItem.deleteMany({});
    await MenuCategory.deleteMany({});

    console.log('Creating categories...');
    const createdCategories = {};
    for (const cat of africanCategories) {
      const created = await MenuCategory.create({ name: cat.name, icon: cat.icon });
      createdCategories[cat._key] = created._id;
    }

    console.log('Creating menu items...');
    for (const it of africanItems) {
      const itemData = { ...it };
      const categoryKey = itemData.categoryKey;
      itemData.category = createdCategories[categoryKey] || null;
      delete itemData.categoryKey;
      await MenuItem.create(itemData);
    }

    console.log('Data import completed.');
    process.exit();
  } catch (error) {
    console.error('Seeder error:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await MenuItem.deleteMany({});
    await MenuCategory.deleteMany({});
    console.log('Data destroyed.');
    process.exit();
  } catch (error) {
    console.error('Destroy error:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
