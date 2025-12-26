#Backend
# Halchash Backend System

Complete PHP + MySQL backend system for Halchash e-commerce website.

## Setup Instructions

### 1. Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE halchash_db;
```

2. Import the database schema:
```bash
mysql -u "your database username -p"password" "Name of database" < database.sql
```

Or use phpMyAdmin to import `database.sql`

### 2. Configuration

Update database credentials in `config/database.php` if needed:
- DB_HOST: localhost
- DB_USER: ....
- DB_PASS: ...
- DB_NAME: 

### 3. File Permissions

Make sure uploads directory is writable:
```bash
chmod 755 uploads/products/
```

### 4. Default Admin Credentials

- Username: ``
- Password: ``

**Important:** Change the default password after first login!

## Directory Structure

```
backend/
├── config/
│   ├── database.php      # Database connection
│   └── cors.php          # CORS configuration
├── api/
│   ├── auth/            # User authentication
│   │   ├── login.php
│   │   └── signup.php
│   ├── admin/           # Admin APIs
│   │   ├── login.php
│   │   ├── categories.php
│   │   └── products.php
│   └── products/        # Public product APIs
│       └── index.php
├── admin/               # Admin panel
│   ├── index.php       # Dashboard
│   ├── login.php       # Admin login
│   ├── categories.php  # Category management
│   └── products.php    # Product management
├── uploads/
│   └── products/       # Product images
├── database.sql        # Database schema
└── .htaccess          # Apache configuration
```

## Free Hosting Setup

### Option 1: InfinityFree (Recommended)

1. Sign up at https://infinityfree.net
2. Create a new account
3. Upload all backend files via FTP
4. Create database in InfinityFree control panel
5. Import `database.sql`
6. Update `config/database.php` with InfinityFree database credentials

### Option 2: 000webhost

1. Sign up at https://www.000webhost.com
2. Create a new website
3. Upload files via File Manager or FTP
4. Create MySQL database
5. Import schema
6. Update database config

### Option 3: Freehostia

1. Sign up at https://www.freehostia.com
2. Upload files
3. Create database
4. Import schema

## API Endpoints

### User Authentication
- `POST /api/auth/login.php` - User login
- `POST /api/auth/signup.php` - User registration

### Admin APIs
- `POST /api/admin/login.php` - Admin login
- `GET /api/admin/categories.php` - Get all categories
- `POST /api/admin/categories.php` - Create category
- `PUT /api/admin/categories.php` - Update category
- `DELETE /api/admin/categories.php?id=X` - Delete category
- `GET /api/admin/products.php` - Get all products
- `POST /api/admin/products.php` - Create product
- `PUT /api/admin/products.php` - Update product
- `DELETE /api/admin/products.php?id=X` - Delete product
- `POST /api/admin/upload.php` - Upload product image
- `GET /api/admin/orders.php` - Get all orders
- `GET /api/admin/orders.php?id=X` - Get single order with items
- `PUT /api/admin/orders.php` - Update order status

### Public APIs
- `GET /api/products/index.php` - Get products (supports ?category=X&search=Y)
- `POST /api/orders/create.php` - Place an order (auto account creation supported)

## Admin Panel

Access admin panel at: `http://yourdomain.com/backend/admin/`

Features:
- Dashboard with statistics
- Category management (CRUD)
- Product management (CRUD)
- Image upload for products
- Secure authentication

## Security Features

- Password hashing (bcrypt)
- SQL injection prevention (prepared statements)
- XSS protection (input sanitization)
- Session-based authentication
- CORS configuration
- File upload validation

## Notes

- All admin operations require authentication
- Product images are stored in `uploads/products/`
- Default admin password should be changed
- Database backup recommended regularly

#Frontend
# 🛍️ Halchash - Bengali E-commerce Website

A modern, responsive e-commerce website frontend featuring authentic Bengali products, built with React and designed to closely match the halchash.com aesthetic.

![Website Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-6.3.5-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.0-cyan)

## ✨ Features

### 🎯 Core E-commerce Functionality
- **Product Catalog**: 20 authentic Bengali products with professional images
- **Shopping Cart**: Real-time cart updates with cookie persistence
- **Product Search & Filter**: Advanced filtering by category, price, and rating
- **Responsive Design**: Mobile-first approach with perfect cross-device compatibility
- **Authentication Ready**: Login/signup forms with cookie-based session management

### 🎨 Design & User Experience
- **Bengali Theme**: Authentic colors and typography matching halchash.com
- **Interactive Hero Section**: Animated product slider with Framer Motion
- **Professional Product Cards**: Ratings, badges, and Bengali Taka (৳) pricing
- **Modern Animations**: Smooth transitions and micro-interactions
- **SEO Optimized**: Complete meta tags and structured data

### 📱 Mobile Excellence
- **Mobile-First Design**: Prioritizes mobile user experience
- **Touch-Friendly Interface**: 44px minimum touch targets
- **Responsive Grid**: 1-column mobile to 4-column desktop layout
- **Fast Loading**: Optimized images and code splitting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation
```bash
# Clone or extract the project
cd halchash

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Available Scripts
```bash
npm run dev          # Start development server at http://localhost:5173
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📦 Project Structure

```
src/
├── components/
│   ├── common/          # Header, Footer, Navigation
│   ├── hero/            # Hero section with slider
│   ├── product/         # Product cards and grids
│   ├── auth/            # Login/signup forms
│   └── ui/              # Reusable UI components
├── context/
│   ├── AuthContext.jsx  # Authentication state management
│   └── CartContext.jsx  # Shopping cart state management
├── data/
│   └── products.js      # Product catalog and categories
├── pages/
│   ├── Home.jsx         # Homepage with hero and featured products
│   ├── Products.jsx     # Product listing with filters
│   ├── ProductDetail.jsx # Individual product pages
│   ├── Cart.jsx         # Shopping cart page
│   └── Auth.jsx         # Authentication page
├── assets/              # Product images and static assets
├── App.jsx              # Main application component
├── App.css              # Global styles and responsive design
└── main.jsx             # Application entry point
```

## 🛍️ Product Categories

### Traditional Bengali Products
- **Shari & Clothing**: Jamdani, Katan Silk, Cotton Tant, Dhakai Muslin
- **Traditional Sweets**: Coconut Naru, Date Palm Naru, Til Naru, Mixed Dry Fruit Naru
- **Bed Sheets & Home**: Cotton, Muslin, and Jamdani bed covers
- **Traditional Items**: Kansa plates, Nakshi Kantha, Terracotta tea sets
- **Beauty & Care**: Natural skincare and hair care products

## 🎨 Customization

### Adding New Products
1. Edit `src/data/products.js`
2. Add product images to `src/assets/`
3. Products automatically appear in relevant sections

### Changing Theme Colors
```css
/* In src/App.css */
:root {
  --bengali-primary: #059669;    /* Main green */
  --bengali-secondary: #f97316;  /* Orange accent */
  --bengali-accent: #8b5cf6;     /* Purple accent */
}
```

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Update navigation in `src/components/common/Header.jsx`

## 🔧 Backend Integration

The frontend is designed for easy backend integration:

### API Integration Points
```javascript
// Authentication (src/context/AuthContext.jsx)
const login = async (credentials) => {
  // Replace with your API endpoint
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return response.json();
};

// Products (src/data/products.js)
const fetchProducts = async () => {
  // Replace static data with API call
  const response = await fetch('/api/products');
  return response.json();
};

// Cart (src/context/CartContext.jsx)
const addToCart = async (product) => {
  // Sync with backend
  await fetch('/api/cart/add', {
    method: 'POST',
    body: JSON.stringify(product)
  });
};
```

## 🚀 Deployment

### Netlify (Recommended)
```bash
# Build the project
npm run build

# Deploy dist folder to Netlify
# Or connect GitHub repo with build command: npm run build
```

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```
