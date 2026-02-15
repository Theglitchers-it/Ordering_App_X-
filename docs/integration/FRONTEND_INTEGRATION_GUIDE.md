# 🎨 Frontend Integration Guide

**Status:** ✅ Phase 2 Complete - Frontend Ready to Connect with Backend APIs

---

## 📦 What's Been Integrated

### **1. API Client Infrastructure**

#### **Core Files Created:**
- ✅ `src/api/apiClient.js` - Axios instance with JWT auto-refresh
- ✅ `src/api/authService.js` - Authentication (login, register, logout)
- ✅ `src/api/merchantService.js` - Merchant CRUD operations
- ✅ `src/api/productService.js` - Product catalog management
- ✅ `src/api/categoryService.js` - Category management
- ✅ `src/api/orderService.js` - Order creation and tracking
- ✅ `src/api/tableService.js` - QR code table management
- ✅ `src/api/paymentService.js` - Stripe payment integration
- ✅ `src/api/socketClient.js` - WebSocket real-time notifications

#### **Environment Configuration:**
- ✅ `.env` - Local development environment
- ✅ `.env.example` - Example template

```bash
VITE_API_URL=http://localhost:5000/api
VITE_FRONTEND_URL=http://localhost:5173
VITE_ENABLE_WEBSOCKET=true
```

---

## 🚀 How to Use the API Services

### **Authentication Example**

```jsx
import * as authService from '../api/authService';

// Login
const handleLogin = async () => {
  const result = await authService.login(email, password);

  if (result.success) {
    console.log('User:', result.user);
    // Tokens are automatically saved to localStorage
  } else {
    console.error('Error:', result.message);
  }
};

// Register
const handleRegister = async () => {
  const result = await authService.register({
    email: 'user@example.com',
    password: 'password123',
    first_name: 'John',
    last_name: 'Doe',
    phone: '+39 123 456 7890',
    role: 'user' // or 'merchant_admin'
  });

  if (result.success) {
    console.log('Registered:', result.user);
  }
};

// Logout
const handleLogout = async () => {
  await authService.logout();
  // Tokens automatically cleared
};

// Check if authenticated
const isLoggedIn = authService.isAuthenticated();

// Get current user
const currentUser = authService.getCurrentUser();
```

---

### **Merchant Service Example**

```jsx
import * as merchantService from '../api/merchantService';

// Get all active merchants
const loadMerchants = async () => {
  const result = await merchantService.getActiveMerchants();

  if (result.success) {
    setMerchants(result.merchants);
  }
};

// Get merchant by slug
const loadMerchant = async (slug) => {
  const result = await merchantService.getMerchantBySlug(slug);

  if (result.success) {
    setMerchant(result.merchant);
  }
};

// Create new merchant (merchant registration)
const createMerchant = async (data) => {
  const result = await merchantService.createMerchant({
    business_name: 'Pizza Italia',
    business_type: 'restaurant',
    vat_number: 'IT12345678901',
    phone: '+39 06 1234567',
    email: 'info@pizzaitalia.com',
    address: 'Via Roma 1',
    city: 'Roma',
    postal_code: '00100',
    country: 'IT'
  });

  if (result.success) {
    console.log('Merchant created:', result.merchant);
  }
};

// Get merchant stats (for dashboard)
const loadStats = async (merchantId) => {
  const result = await merchantService.getMerchantStats(merchantId);

  if (result.success) {
    console.log('Stats:', result.stats);
  }
};
```

---

### **Product Service Example**

```jsx
import * as productService from '../api/productService';

// Get products for a merchant
const loadMenu = async (merchantId) => {
  const result = await productService.getProductsByMerchant(merchantId);

  if (result.success) {
    setProducts(result.products);
  }
};

// Create product
const addProduct = async () => {
  const result = await productService.createProduct({
    merchant_id: 1,
    category_id: 5,
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato and mozzarella',
    price: 8.50,
    image_url: 'https://example.com/pizza.jpg',
    is_available: true,
    is_featured: true
  });

  if (result.success) {
    console.log('Product created:', result.product);
  }
};

// Toggle availability
const toggleAvailability = async (productId) => {
  const result = await productService.toggleProductAvailability(productId);

  if (result.success) {
    console.log('Updated:', result.product.is_available);
  }
};
```

---

### **Order Service Example**

```jsx
import * as orderService from '../api/orderService';

// Create order
const placeOrder = async (cart, merchantId) => {
  const result = await orderService.createOrder({
    merchant_id: merchantId,
    order_type: 'dine_in', // or 'takeaway', 'delivery'
    table_id: 5, // if dine_in
    items: cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      special_instructions: item.notes
    })),
    customer_name: 'John Doe',
    customer_phone: '+39 123 456 7890',
    customer_email: 'john@example.com',
    delivery_address: null, // if delivery type
    special_instructions: 'Extra napkins please'
  });

  if (result.success) {
    console.log('Order created:', result.order.order_number);
    // Redirect to payment or confirmation
  }
};

// Get my orders
const loadMyOrders = async () => {
  const result = await orderService.getMyOrders();

  if (result.success) {
    setOrders(result.orders);
  }
};

// Track order
const trackOrder = async (orderId) => {
  const result = await orderService.getOrderById(orderId);

  if (result.success) {
    setOrder(result.order);
  }
};

// Update order status (merchant)
const updateStatus = async (orderId, newStatus) => {
  const result = await orderService.updateOrderStatus(orderId, newStatus);
  // newStatus: 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed'

  if (result.success) {
    console.log('Status updated:', result.order.order_status);
  }
};
```

---

### **Table Service Example**

```jsx
import * as tableService from '../api/tableService';

// Get all tables for merchant
const loadTables = async (merchantId) => {
  const result = await tableService.getTablesByMerchant(merchantId);

  if (result.success) {
    setTables(result.tables);
  }
};

// Create table (auto-generates QR)
const addTable = async () => {
  const result = await tableService.createTable({
    merchant_id: 1,
    table_number: 'A1',
    seats: 4,
    location: 'Main Floor'
  });

  if (result.success) {
    console.log('QR Code:', result.table.qr_code_data); // base64 PNG
  }
};

// Download QR code
const downloadQR = async (tableId) => {
  await tableService.downloadQRCode(tableId);
  // Automatically triggers download
};

// Update table status
const updateTableStatus = async (tableId, status) => {
  const result = await tableService.updateTableStatus(tableId, status);
  // status: 'available', 'occupied', 'reserved', 'maintenance'

  if (result.success) {
    console.log('Table status:', result.table.current_status);
  }
};
```

---

### **Payment Service Example**

```jsx
import * as paymentService from '../api/paymentService';

// Create payment intent
const initiatePayment = async (orderId) => {
  const result = await paymentService.createPaymentIntent(orderId);

  if (result.success) {
    const { clientSecret, paymentIntentId } = result;

    // Use clientSecret with Stripe.js on frontend
    // const stripe = await loadStripe('pk_test_...');
    // const { error } = await stripe.confirmCardPayment(clientSecret);
  }
};

// Check payment status
const checkPayment = async (orderId) => {
  const result = await paymentService.getPaymentStatus(orderId);

  if (result.success) {
    console.log('Payment:', result.payment);
  }
};
```

---

## 🔔 WebSocket Real-Time Updates

### **Setup WebSocket Connection**

```jsx
import {
  initializeSocket,
  onNewOrder,
  onOrderStatusUpdate,
  disconnectSocket
} from '../api/socketClient';
import { useEffect } from 'react';

function MerchantDashboard() {
  useEffect(() => {
    // Initialize socket on mount
    initializeSocket();

    // Listen for new orders
    onNewOrder((orderData) => {
      console.log('New order received!', orderData);
      // Show notification, update order list
      setOrders(prev => [orderData, ...prev]);
      playNotificationSound();
    });

    // Listen for order status updates
    onOrderStatusUpdate((orderData) => {
      console.log('Order updated:', orderData.order_number);
      // Update order in list
      setOrders(prev => prev.map(o =>
        o.id === orderData.id ? orderData : o
      ));
    });

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, []);

  return <div>...</div>;
}
```

### **Available WebSocket Events**

```jsx
import {
  onNewOrder,          // New order created
  onOrderStatusUpdate, // Order status changed
  onOrderCancelled,    // Order cancelled
  onPaymentConfirmed,  // Payment successful
  onTableStatusUpdate  // Table status changed
} from '../api/socketClient';
```

---

## ✅ AuthContext Integration

**Status:** ✅ Already Updated

The `AuthContext` has been updated to use real APIs:

```jsx
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { loginAdmin, loginUser, isAuthenticated } = useAuth();

  const handleAdminLogin = async () => {
    const result = await loginAdmin({ email, password });

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message);
    }
  };

  const handleUserLogin = async () => {
    const result = await loginUser(email, password);

    if (result.success) {
      navigate('/');
    }
  };

  return <div>...</div>;
}
```

---

## 📝 Next Steps for Full Integration

### **Pages to Update:**

1. **Login/Register Pages** ✅ (AuthContext already integrated)
   - `src/pages/LoginPage.jsx`
   - `src/pages/MerchantRegisterPage.jsx`

2. **Merchant Dashboard** (Replace mock data)
   - `src/pages/merchant/MerchantDashboardPage.jsx`
   - Use `merchantService.getMyMerchant()`
   - Use `merchantService.getMerchantStats()`

3. **Menu Builder** (Replace mock products)
   - `src/pages/merchant/MerchantMenuBuilderPage.jsx`
   - Use `productService` and `categoryService`

4. **Orders Page** (Replace mock orders)
   - `src/pages/merchant/MerchantOrdersPage.jsx`
   - Use `orderService.getOrdersByMerchant()`
   - Add WebSocket listeners for real-time updates

5. **Tables Management** (Replace mock tables)
   - `src/pages/merchant/MerchantTablesPage.jsx`
   - Use `tableService`

6. **Customer Menu Page** (Load real menu)
   - `src/pages/ProductDetailPage.jsx`
   - Use `productService.getProductsByMerchant(slug)`

7. **Cart/Checkout** (Create real orders)
   - `src/pages/CartPage.jsx`
   - Use `orderService.createOrder()`
   - Use `paymentService.createPaymentIntent()`

8. **Super Admin Dashboard** (Real merchant management)
   - `src/pages/superadmin/SuperAdminDashboardPage.jsx`
   - Use `merchantService.getPendingMerchants()`
   - Use `merchantService.approveMerchant()`

---

## 🔄 Error Handling Pattern

All API services return consistent response format:

```jsx
const result = await someService.someMethod();

if (result.success) {
  // Success
  console.log(result.data);
} else {
  // Error
  console.error(result.message);
  console.error(result.status); // HTTP status code
}
```

---

## 🎯 Testing the Integration

### **1. Start Backend:**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5000
```

### **2. Start Frontend:**
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

### **3. Test Flow:**

1. **Register merchant:**
   - Go to `/merchant/register`
   - Fill form → API call to `POST /api/auth/register` + `POST /api/merchants`

2. **Admin approves merchant:**
   - Login as admin → `POST /api/auth/login`
   - Approve merchant → `PATCH /api/merchants/:id/approve`

3. **Merchant creates menu:**
   - Login as merchant
   - Add products → `POST /api/products`
   - Create tables → `POST /api/tables`

4. **Customer orders:**
   - Scan QR → Load menu → `GET /api/products?merchant_id=X`
   - Add to cart → Create order → `POST /api/orders`
   - Pay with Stripe → `POST /api/payments/payment-intent`

5. **Real-time updates:**
   - Merchant receives order notification via WebSocket
   - Customer sees status updates in real-time

---

## 📦 Dependencies Installed

```json
{
  "axios": "^1.13.2",
  "socket.io-client": "^4.8.3"
}
```

---

## ⚠️ Important Notes

1. **JWT Auto-Refresh:** The `apiClient` automatically refreshes expired access tokens using refresh tokens

2. **CORS:** Backend CORS is configured to allow `http://localhost:5173`

3. **WebSocket Auth:** WebSocket connections automatically use JWT from localStorage

4. **Error Handling:** All API errors are caught and returned with user-friendly messages

5. **Type Safety:** Consider adding TypeScript for better type safety (optional)

---

## 🚀 Production Deployment

When deploying to production:

1. Update `.env`:
   ```bash
   VITE_API_URL=https://api.yourdomain.com/api
   VITE_FRONTEND_URL=https://yourdomain.com
   VITE_ENABLE_WEBSOCKET=true
   VITE_DEBUG=false
   ```

2. Build frontend:
   ```bash
   npm run build
   ```

3. Deploy `dist/` folder to Vercel/Netlify/CloudFlare

4. Ensure backend CORS allows production domain

---

## ✅ Integration Checklist

- [x] API client with JWT refresh
- [x] Authentication service
- [x] All CRUD services (merchants, products, categories, orders, tables, payments)
- [x] WebSocket client
- [x] AuthContext updated with real APIs
- [x] Environment variables configured
- [ ] Update merchant dashboard pages
- [ ] Update customer-facing pages
- [ ] Update admin pages
- [ ] Add Stripe.js integration for payments
- [ ] Test end-to-end flows

---

**Ready to integrate!** 🎉

Start by updating pages one by one, replacing mock data with real API calls. All services are documented above with examples.
