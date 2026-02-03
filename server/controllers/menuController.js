const MenuItem = require('../models/MenuItem');
const MenuCategory = require('../models/MenuCategory');

// ======================
// Category Controllers
// ======================

// @desc    Get all categories
// @route   GET /api/menu/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const { active, mealType } = req.query;

    let query = {};

    if (active === 'true') {
      query.isActive = true;
    }

    if (mealType) {
      query.mealType = mealType;
    }

    const categories = await MenuCategory.find(query)
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
    });
  }
};

// @desc    Get single category
// @route   GET /api/menu/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
  try {
    const category = await MenuCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
    });
  }
};

// @desc    Create category
// @route   POST /api/menu/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const category = await MenuCategory.create(req.body);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
    });
  }
};

// @desc    Update category
// @route   PUT /api/menu/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    const category = await MenuCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/menu/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await MenuCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if category has items
    const itemCount = await MenuItem.countDocuments({ category: req.params.id });
    if (itemCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing items. Move or delete items first.',
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
    });
  }
};

// ======================
// Menu Item Controllers
// ======================

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
exports.getMenuItems = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      minPrice,
      maxPrice,
      vegetarian,
      vegan,
      glutenFree,
      spicy,
      available,
      featured,
      search,
      sort,
    } = req.query;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (subcategory) {
      query.subcategory = subcategory;
    }

    if (available === 'true') {
      query.isAvailable = true;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Dietary filters
    if (vegetarian === 'true') {
      query['dietary.isVegetarian'] = true;
    }
    if (vegan === 'true') {
      query['dietary.isVegan'] = true;
    }
    if (glutenFree === 'true') {
      query['dietary.isGlutenFree'] = true;
    }

    // Spice level
    if (spicy) {
      query.spiceLevel = { $gte: Number(spicy) };
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Sorting
    let sortOption = { displayOrder: 1, name: 1 };
    if (sort === 'price-low') {
      sortOption = { price: 1 };
    } else if (sort === 'price-high') {
      sortOption = { price: -1 };
    } else if (sort === 'popular') {
      sortOption = { soldCount: -1 };
    } else if (sort === 'new') {
      sortOption = { createdAt: -1 };
    }

    const items = await MenuItem.find(query)
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .sort(sortOption)
      .lean();

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu items',
    });
  }
};

// @desc    Get menu items by category
// @route   GET /api/menu/category/:id
// @access  Public
exports.getItemsByCategory = async (req, res) => {
  try {
    const items = await MenuItem.find({
      category: req.params.id,
      isAvailable: true,
    })
      .populate('category', 'name')
      .sort({ displayOrder: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error('Get items by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching items',
    });
  }
};

// @desc    Get featured items
// @route   GET /api/menu/featured
// @access  Public
exports.getFeaturedItems = async (req, res) => {
  try {
    const items = await MenuItem.find({
      isFeatured: true,
      isAvailable: true,
    })
      .populate('category', 'name')
      .sort({ displayOrder: 1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error('Get featured items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured items',
    });
  }
};

// @desc    Search menu items
// @route   GET /api/menu/search
// @access  Public
exports.searchItems = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const items = await MenuItem.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { ingredients: { $regex: q, $options: 'i' } },
      ],
      isAvailable: true,
    })
      .populate('category', 'name')
      .limit(20)
      .lean();

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error('Search items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching items',
    });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/item/:id
// @access  Public
exports.getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id)
      .populate('category', 'name')
      .populate('subcategory', 'name');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu item',
    });
  }
};

// @desc    Create menu item
// @route   POST /api/menu/items
// @access  Private/Admin
exports.createMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating menu item',
    });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/items/:id
// @access  Private/Admin
exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating menu item',
    });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/items/:id
// @access  Private/Admin
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting menu item',
    });
  }
};

// @desc    Toggle item availability
// @route   PUT /api/menu/items/:id/availability
// @access  Private/Admin
exports.toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.status(200).json({
      success: true,
      data: item,
      message: item.isAvailable ? 'Item is now available' : 'Item is now unavailable',
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling availability',
    });
  }
};

// @desc    Get full menu with categories
// @route   GET /api/menu/full
// @access  Public
exports.getFullMenu = async (req, res) => {
  try {
    const categories = await MenuCategory.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .lean();

    const menu = await Promise.all(
      categories.map(async (category) => {
        const items = await MenuItem.find({
          category: category._id,
          isAvailable: true,
        })
          .sort({ displayOrder: 1 })
          .lean();

        return {
          ...category,
          items,
          itemCount: items.length,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    console.error('Get full menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching full menu',
    });
  }
};

