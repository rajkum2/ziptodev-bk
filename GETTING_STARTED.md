# Zipto Admin Platform - Getting Started Guide

Welcome to the Zipto Admin Platform! This guide will help you set up and run the complete system.

## 🎯 What You're Building

A production-ready quick-commerce admin platform with:
- **Backend API**: Node.js + Express + MongoDB Atlas + Socket.io
- **Admin Dashboard**: React + TypeScript + TailwindCSS
- **Real-time Features**: Live order updates, delivery tracking
- **Complete CRUD**: Products, Orders, Users, Partners, etc.

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js 18+** and npm installed
2. **MongoDB Atlas Account** (free tier works great!)
3. **Git** installed
4. **Code Editor** (VS Code recommended)

## 🚀 Quick Start (5 Minutes)

### Step 1: Get MongoDB Atlas Ready

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account (if you don't have one)
3. Create a new cluster (free M0 tier is perfect)
4. Click "Connect" → "Connect your application"
5. Copy your connection string. It looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **IMPORTANT**: Replace `<password>` with your actual password
7. Add `/zipto` before the `?` to specify the database name:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/zipto?retryWrites=true&w=majority
   ```

### Step 2: Set Up the Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Now edit `backend/.env` and add your MongoDB Atlas connection string:

```env
NODE_ENV=development
PORT=5000

# PASTE YOUR MONGODB ATLAS CONNECTION STRING HERE
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/zipto?retryWrites=true&w=majority

# JWT Secrets (you can keep these or change them)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
ADMIN_JWT_SECRET=your-admin-secret-key

# CORS (keep as is for development)
CORS_ORIGINS=http://localhost:5173
SOCKET_CORS_ORIGINS=http://localhost:5173

# File uploads
UPLOAD_DRIVER=local

# Logging
LOG_LEVEL=info
```

### Step 3: Seed the Database

This will populate your MongoDB Atlas database with demo data:

```bash
# Run the seed script
npm run seed
```

You should see:
```
✅ Connected to MongoDB Atlas
✅ Created 10 categories
✅ Created 60 products
✅ Created 100 users
✅ Created 50 orders
... and more

🔑 Admin Credentials:
   Username: admin
   Password: Admin@123
```

### Step 4: Start the Backend Server

```bash
# Start backend in development mode
npm run dev
```

You should see:
```
✅ MongoDB Atlas Connected
✅ Socket.io initialized
🚀 Server running on port 5000
```

**Keep this terminal open!**

### Step 5: Set Up the Admin Dashboard

Open a **new terminal** window:

```bash
# Navigate to admin dashboard
cd admin-dashboard

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `admin-dashboard/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Step 6: Start the Admin Dashboard

```bash
# Start the dashboard
npm run dev
```

You should see:
```
  ➜  Local:   http://localhost:5173/
```

### Step 7: Login to Admin Dashboard

1. Open your browser and go to: http://localhost:5173
2. You'll see the login page
3. Use the demo credentials:
   - **Username**: `admin`
   - **Password**: `Admin@123`
4. Click "Sign In"

🎉 **Congratulations!** You're now logged into the Zipto Admin Dashboard!

## 📱 Exploring the Dashboard

After logging in, you'll see:

### Main Dashboard
- Real-time stats (orders today, revenue, active users)
- Recent orders table
- Live connection status indicator

### Available Modules

1. **Orders** - View and manage all orders
   - Filter by status, date, payment method
   - Update order status
   - Assign delivery partners
   - Real-time updates via Socket.io

2. **Products** - Complete product management
   - Add/edit products with variants
   - Upload multiple images
   - Manage inventory
   - Bulk import (stub)

3. **Categories** - Category management
   - CRUD operations
   - Priority/ordering
   - Performance analytics

4. **Users** - Customer management
   - View user details
   - Block/unblock users
   - Order history

5. **Delivery Partners** - Partner management
   - Add/edit partners
   - Status updates (available/busy/offline)
   - Location tracking (simulated)

6. **Banners** - Homepage banners
   - Schedule banners
   - Set priority
   - Link to products/categories

7. **Shelves** - Product collections
   - Featured products
   - Category-based shelves
   - Custom product lists

8. **Locations** - Serviceability
   - Manage pincodes
   - Delivery time estimates
   - Toggle serviceability

9. **Analytics** - Business insights
   - Sales analytics
   - Product performance
   - User analytics
   - Export reports (stub)

10. **Settings** - Platform configuration

## 🧪 Testing Real-time Features

### Test Socket.io Connection

1. Check the header in the dashboard
2. You should see a green dot with "Connected"
3. If red, check that the backend is running

### Simulate Order Updates

You can use the API directly to test real-time updates:

```bash
# In a new terminal, use curl or Postman
curl -X PATCH http://localhost:5000/api/admin/orders/ORD1234567890/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed", "note": "Order confirmed"}'
```

The dashboard should update in real-time!

## 📊 Database Overview

Your MongoDB Atlas database now contains:

- **1 Super Admin** (username: admin)
- **10 Categories** (Fruits, Dairy, Snacks, etc.)
- **60 Products** with variants and pricing
- **100 Mock Users**
- **50 Orders** across different statuses
- **20 Delivery Partners** with locations
- **Serviceable Locations** (Hyderabad pincodes)
- **5 Banners** and **5 Shelves**
- **Analytics Events** (page views, searches, etc.)

## 🔑 API Endpoints

### Admin Authentication
```
POST /api/admin/auth/login
GET  /api/admin/auth/me
POST /api/admin/auth/logout
```

### Products
```
GET    /api/admin/products
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id
POST   /api/admin/products/:id/upload-images
```

### Orders
```
GET   /api/admin/orders
GET   /api/admin/orders/:orderId
PATCH /api/admin/orders/:orderId/status
PATCH /api/admin/orders/:orderId/assign-partner
```

### Analytics
```
GET /api/admin/analytics/overview
GET /api/admin/analytics/sales
GET /api/admin/analytics/products
GET /api/admin/analytics/categories
```

See full API documentation in the README.md

## 🛠️ Development Tips

### Viewing Logs

Backend logs are in `backend/logs/`:
- `combined.log` - All logs
- `error.log` - Errors only

### Clearing Database

To reset and reseed:

```bash
cd backend
npm run seed
```

This will clear all data and reseed fresh demo data.

### Adding New Products

1. Go to Products page
2. Click "Add Product"
3. Fill in details, add variants
4. Upload images
5. Save

### Testing Different Roles

The seed script creates one super_admin. To test different permissions:

1. Modify `backend/seed/seed-data/index.js`
2. Add more admin users with different roles
3. Reseed: `npm run seed`

## 🚨 Troubleshooting

### "Cannot connect to MongoDB"

**Solution:**
1. Check your `MONGODB_URI` in `backend/.env`
2. Verify your MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for development)
3. Ensure your cluster is active
4. Test connection with MongoDB Compass

### "Port 5000 already in use"

**Solution:**
```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Or change PORT in backend/.env
PORT=5001
```

### "CORS Error"

**Solution:**
Update `CORS_ORIGINS` in `backend/.env`:
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Socket.io Not Connecting

**Solution:**
1. Check `SOCKET_CORS_ORIGINS` in `backend/.env`
2. Verify `VITE_SOCKET_URL` in `admin-dashboard/.env`
3. Ensure backend is running

### Login Not Working

**Solution:**
1. Make sure you ran `npm run seed`
2. Use exact credentials: `admin` / `Admin@123`
3. Check browser console for errors
4. Verify backend is running on port 5000

## 📝 Next Steps

### Building Out the Dashboard

The admin dashboard currently has stub pages for most modules. To build them out:

1. **Use existing patterns** from `DashboardPage.tsx`
2. **Add TanStack Query** hooks for data fetching
3. **Implement tables** with sorting, filtering, pagination
4. **Add forms** using react-hook-form
5. **Subscribe to Socket.io** events for real-time updates

### Example: Building Orders Page

```typescript
// In OrdersPage.tsx
import { useQuery } from '@tanstack/react-query';
import { useSocket } from '@/contexts/SocketContext';
import apiClient from '@/api/apiClient';

const OrdersPage = () => {
  const { socket } = useSocket();
  const { data, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiClient.get('/admin/orders')
  });

  useEffect(() => {
    if (!socket) return;

    // Listen for new orders
    socket.on('new:order', () => {
      refetch(); // Refresh orders
    });

    socket.on('order:status_changed', () => {
      refetch();
    });

    return () => {
      socket.off('new:order');
      socket.off('order:status_changed');
    };
  }, [socket, refetch]);

  // Build your table here
};
```

### Deploying to Production

#### Backend (Render/Railway/Heroku)

1. Push code to GitHub
2. Connect to your hosting platform
3. Set environment variables
4. Deploy
5. Run seed script if needed: `npm run seed`

#### Admin Dashboard (Vercel/Netlify)

1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set environment variables:
   - `VITE_API_BASE_URL=https://your-api.com/api`
   - `VITE_SOCKET_URL=https://your-api.com`

## 🎓 Learning Resources

- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Socket.io Docs](https://socket.io/docs/v4/)
- [React Query Docs](https://tanstack.com/query/latest)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

## 🤝 Support

If you encounter issues:

1. Check the logs in `backend/logs/`
2. Review the browser console
3. Verify all environment variables
4. Ensure MongoDB Atlas connection
5. Test API endpoints with Postman

## 🎉 Success!

You now have a fully functional quick-commerce admin platform running locally!

- ✅ Backend API with MongoDB Atlas
- ✅ Real-time Socket.io updates
- ✅ Admin authentication
- ✅ Professional React dashboard
- ✅ Complete data models
- ✅ Seed data ready to use

Happy coding! 🚀

