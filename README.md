# 🏨 Hotel & Entertainment Complex Platform

A comprehensive full-stack MERN application for managing a Hotel, Sports Bar, Restaurant, and Garden/Event Space with booking and ordering capabilities.

## ✨ Features

### 🏨 Hotel Management
- Room bookings (Standard, Deluxe, Suite, Presidential)
- Room availability tracking
- Amenity management
- Dynamic pricing

### 🍺 Sports Bar & Restaurant
- Table reservations
- Location-based seating (Indoor, Outdoor, VIP)
- Minimum spend tracking
- Real-time availability

### 🌳 Garden/Event Space
- Event space bookings
- Wedding & corporate event management
- Hourly/daily pricing
- Capacity management

### 🍽️ Menu & Ordering System
- Full menu display with categories
- Dietary filters (Vegetarian, Vegan, Gluten-Free)
- Shopping cart
- Order tracking
- Dine-in, takeout, and delivery options

### 👤 User Dashboard
- Booking history
- Order history
- Profile management
- Loyalty points

### ⚙️ Admin Panel
- Room, table, garden management
- Menu management
- Order management
- User management
- Analytics & reports

## 🏗️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS v4** for styling
- **React Router DOM** for routing
- **Axios** for API calls
- **React Hook Form** + Zod for validation
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Backend
- **Node.js** + Express
- **MongoDB** + Mongoose
- **JWT** for authentication
- **Multer** + Cloudinary for file uploads
- **Nodemailer** for emails
- **Helmet** + Rate Limiting for security

## 📁 Project Structure

```
hotel-complex-platform/
├── client/                          # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── landing/             # Landing page components
│   │   │   ├── shared/              # Shared components
│   │   │   └── admin/               # Admin components
│   │   ├── pages/                   # Page components
│   │   │   └── admin/               # Admin pages
│   │   ├── services/                # API services
│   │   ├── context/                 # React contexts
│   │   ├── hooks/                   # Custom hooks
│   │   └── utils/                   # Utility functions
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Node.js Backend
│   ├── config/                      # Database config
│   ├── models/                      # Mongoose models
│   ├── controllers/                 # Route controllers
│   ├── routes/                      # API routes
│   ├── middleware/                  # Custom middleware
│   ├── utils/                       # Utility functions
│   ├── server.js                    # Entry point
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hotel_complex
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=http://localhost:5173
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/categories` - Get categories
- `GET /api/menu/:id` - Get single item
- `POST /api/menu/items` - Add item (Admin)
- `PUT /api/menu/items/:id` - Update item (Admin)
- `DELETE /api/menu/items/:id` - Delete item (Admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update status (Admin)

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room details
- `GET /api/rooms/available` - Check availability
- `POST /api/rooms` - Add room (Admin)
- `PUT /api/rooms/:id` - Update room (Admin)

### Tables
- `GET /api/tables` - Get all tables
- `GET /api/tables/available` - Check availability
- `POST /api/tables/reserve` - Reserve table

### Garden
- `GET /api/garden` - Get garden details
- `POST /api/garden/book` - Book garden
- `GET /api/garden/availability` - Check availability

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Manage users
- `GET /api/admin/analytics` - Analytics data

## 🎨 Design System

### Colors
- **Primary**: #2563eb (Blue)
- **Secondary**: #1e293b (Slate)
- **Acccent**: #f97316 (Orange)
- **Success**: #22c55e (Green)
- **Warning**: #eab308 (Yellow)
- **Error**: #ef4444 (Red)

### Components
- Buttons (Primary, Secondary, Outline, Ghost)
- Cards with hover effects
- Forms with validation
- Modals
- Badges
- Loading states

## 📱 Pages

### Public
- `/` - Landing page
- `/menu` - Full menu
- `/login` - Login
- `/register` - Register

### User (Protected)
- `/dashboard` - User dashboard
- `/book/room` - Book a room
- `/book/table` - Reserve table
- `/book/garden` - Book garden
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/orders` - Order history
- `/bookings` - Booking history
- `/profile` - Profile settings

### Admin (Protected)
- `/admin` - Admin dashboard
- `/admin/rooms` - Manage rooms
- `/admin/menu` - Manage menu
- `/admin/orders` - Manage orders
- `/admin/bookings` - Manage bookings
- `/admin/users` - Manage users
- `/admin/analytics` - Analytics

## 🔐 Security Features

- JWT authentication
- Role-based access control
- Password hashing with bcrypt
- Rate limiting
- Helmet security headers
- Input validation
- CORS configuration
- XSS protection

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
# La-cascada
