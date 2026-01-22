# 🔌 Pages Integration Guide

Complete guide to integrate frontend pages with real backend APIs using custom hooks.

---

## 📦 Custom API Hooks Created

All custom hooks are in `src/hooks/api/`:

✅ **useMerchant** - Merchant operations
✅ **useProducts** - Product catalog management
✅ **useOrders** - Order management with real-time WebSocket
✅ **useTables** - Table and QR code management

---

## 🎯 How to Integrate Pages

### **Pattern to Follow:**

1. Import the appropriate hook
2. Replace mock data with hook data
3. Replace mock functions with hook functions
4. Handle loading and error states

### **Example Integration:**

**Before (Mock):**
```jsx
import { useState } from 'react';

function MyPage() {
  const [data, setData] = useState([]);

  // Mock data
  useEffect(() => {
    setData(mockData);
  }, []);

  return <div>{data.map(...)}</div>;
}
```

**After (Real API):**
```jsx
import { useProducts } from '../hooks/api';

function MyPage() {
  const { products, loading, error, createProduct } = useProducts({ merchant_id: 1 });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{products.map(...)}</div>;
}
```

---

## 📄 Pages to Update

### **1. Merchant Dashboard**
**File:** `src/pages/merchant/MerchantDashboardPage.jsx`

```jsx
import { useMerchant, useMerchantStats } from '../../hooks/api';

function MerchantDashboardPage() {
  const { merchant, loading: merchantLoading } = useMerchant();
  const { stats, loading: statsLoading } = useMerchantStats(merchant?.id);

  if (merchantLoading || statsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h1>{merchant.business_name}</h1>
      <div>
        <p>Total Orders: {stats?.total_orders || 0}</p>
        <p>Revenue: €{stats?.total_revenue || 0}</p>
        <p>Average Order: €{stats?.average_order_value || 0}</p>
      </div>
    </div>
  );
}
```

---

### **2. Menu Builder**
**File:** `src/pages/merchant/MerchantMenuBuilderPage.jsx`

```jsx
import { useProducts } from '../../hooks/api';
import { useMerchant } from '../../hooks/api';

function MerchantMenuBuilderPage() {
  const { merchant } = useMerchant();
  const {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleAvailability,
  } = useProducts({ merchant_id: merchant?.id });

  const handleAddProduct = async (productData) => {
    const result = await createProduct({
      ...productData,
      merchant_id: merchant.id,
    });

    if (result.success) {
      alert('Product created!');
    } else {
      alert('Error: ' + result.message);
    }
  };

  const handleToggleAvailability = async (productId) => {
    await toggleAvailability(productId);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <button onClick={() => setShowAddModal(true)}>Add Product</button>

      {products.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>€{product.price}</p>
          <button onClick={() => handleToggleAvailability(product.id)}>
            {product.is_available ? 'Disable' : 'Enable'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

### **3. Orders Page (with Real-Time)**
**File:** `src/pages/merchant/MerchantOrdersPage.jsx`

```jsx
import { useOrders } from '../../hooks/api';
import { useMerchant } from '../../hooks/api';

function MerchantOrdersPage() {
  const { merchant } = useMerchant();
  const {
    orders,
    loading,
    error,
    updateStatus,
    refresh,
  } = useOrders({ merchant_id: merchant?.id }, true); // Enable real-time

  const handleStatusChange = async (orderId, newStatus) => {
    const result = await updateStatus(orderId, newStatus);

    if (result.success) {
      alert('Status updated!');
      // Orders will update automatically via WebSocket
    } else {
      alert('Error: ' + result.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h1>Orders</h1>
      <button onClick={refresh}>Refresh</button>

      {orders.map((order) => (
        <div key={order.id}>
          <h3>Order #{order.order_number}</h3>
          <p>Status: {order.order_status}</p>
          <p>Total: €{order.total}</p>

          <select
            value={order.order_status}
            onChange={(e) => handleStatusChange(order.id, e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      ))}
    </div>
  );
}
```

---

### **4. Tables Management**
**File:** `src/pages/merchant/MerchantTablesPage.jsx`

```jsx
import { useTables } from '../../hooks/api';
import { useMerchant } from '../../hooks/api';

function MerchantTablesPage() {
  const { merchant } = useMerchant();
  const {
    tables,
    loading,
    error,
    createTable,
    deleteTable,
    downloadQR,
    regenerateQR,
  } = useTables({ merchant_id: merchant?.id });

  const handleCreateTable = async (tableData) => {
    const result = await createTable({
      ...tableData,
      merchant_id: merchant.id,
    });

    if (result.success) {
      alert('Table created with QR code!');
    }
  };

  const handleDownloadQR = async (tableId) => {
    const result = await downloadQR(tableId);

    if (result.success) {
      alert('QR code downloaded!');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h1>Tables</h1>
      <button onClick={() => setShowAddModal(true)}>Add Table</button>

      {tables.map((table) => (
        <div key={table.id}>
          <h3>Table {table.table_number}</h3>
          <p>Seats: {table.seats}</p>
          <p>Status: {table.current_status}</p>

          {table.qr_code_data && (
            <img src={table.qr_code_data} alt="QR Code" width="200" />
          )}

          <button onClick={() => handleDownloadQR(table.id)}>
            Download QR
          </button>
          <button onClick={() => regenerateQR(table.id)}>
            Regenerate QR
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

### **5. Customer Menu Page**
**File:** `src/pages/ProductDetailPage.jsx`

```jsx
import { useProducts } from '../hooks/api';
import { useParams } from 'react-router-dom';

function CustomerMenuPage() {
  const { merchantSlug } = useParams();

  // First, get merchant by slug
  const [merchant, setMerchant] = useState(null);

  useEffect(() => {
    const fetchMerchant = async () => {
      const result = await merchantService.getMerchantBySlug(merchantSlug);
      if (result.success) {
        setMerchant(result.merchant);
      }
    };
    fetchMerchant();
  }, [merchantSlug]);

  // Then load products
  const { products, loading } = useProducts({
    merchant_id: merchant?.id,
    is_available: true,
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1>{merchant?.business_name}</h1>

      <div className="grid">
        {products.map((product) => (
          <div key={product.id}>
            <img src={product.image_url} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>€{product.price}</p>
            <button>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### **6. Cart & Checkout with Stripe**
**File:** `src/pages/CartPage.jsx`

```jsx
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../hooks/api';
import StripeCheckout from '../components/payment/StripeCheckout';

function CartPage() {
  const { cart, clearCart } = useCart();
  const { createOrder } = useOrders({}, false);
  const [orderId, setOrderId] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  const handleCheckout = async () => {
    // Create order
    const result = await createOrder({
      merchant_id: cart[0].merchant_id,
      order_type: 'delivery',
      items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      })),
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      customer_phone: '+39 123 456 7890',
    });

    if (result.success) {
      setOrderId(result.order.id);
      setShowPayment(true);
    } else {
      alert('Error creating order: ' + result.message);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    alert('Payment successful!');
    clearCart();
    navigate(`/order-confirmation/${orderId}`);
  };

  if (showPayment && orderId) {
    return (
      <div>
        <h1>Complete Payment</h1>
        <StripeCheckout
          orderId={orderId}
          onSuccess={handlePaymentSuccess}
          onError={(error) => alert('Payment failed: ' + error.message)}
        />
      </div>
    );
  }

  return (
    <div>
      <h1>Cart</h1>

      {cart.map((item) => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>Quantity: {item.quantity}</p>
          <p>€{item.price * item.quantity}</p>
        </div>
      ))}

      <button onClick={handleCheckout}>Proceed to Payment</button>
    </div>
  );
}
```

---

### **7. Super Admin Dashboard**
**File:** `src/pages/superadmin/SuperAdminDashboardPage.jsx`

```jsx
import { useMerchants } from '../../hooks/api';

function SuperAdminDashboardPage() {
  const {
    merchants,
    loading,
    error,
    approveMerchant,
    blockMerchant,
  } = useMerchants({ status: 'pending_approval' });

  const handleApprove = async (merchantId) => {
    const result = await approveMerchant(merchantId);

    if (result.success) {
      alert('Merchant approved!');
      // Merchant will be updated automatically in state
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h1>Pending Merchants</h1>

      {merchants.map((merchant) => (
        <div key={merchant.id}>
          <h3>{merchant.business_name}</h3>
          <p>Status: {merchant.status}</p>

          <button onClick={() => handleApprove(merchant.id)}>
            Approve
          </button>
          <button onClick={() => blockMerchant(merchant.id)}>
            Block
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## ✅ Integration Checklist

For each page:

- [ ] Import appropriate hooks from `src/hooks/api`
- [ ] Replace mock data with hook data
- [ ] Replace mock functions with hook functions
- [ ] Add loading state handling
- [ ] Add error state handling
- [ ] Test with real backend

---

## 🎨 Reusable Components

Consider creating these components:

### **LoadingSpinner.jsx**
```jsx
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <svg className="animate-spin h-12 w-12 text-green-600" ...>
        ...
      </svg>
      <p className="ml-4 text-gray-600">Loading...</p>
    </div>
  );
}
```

### **ErrorMessage.jsx**
```jsx
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-600">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4">
          Retry
        </button>
      )}
    </div>
  );
}
```

---

## 🧪 Testing Each Page

1. **Start backend:** `cd backend && npm run dev`
2. **Start frontend:** `npm run dev`
3. **Navigate to page:** Check in browser
4. **Check console:** Look for API calls `[API] GET /...`
5. **Test functionality:** Create, update, delete
6. **Check real-time:** (for orders) Open two browsers

---

## 🚀 Quick Start

Update pages in this order for best results:

1. ✅ **Login** (already done via AuthContext)
2. ⚡ **MerchantDashboardPage** (shows stats)
3. ⚡ **MerchantMenuBuilderPage** (CRUD products)
4. ⚡ **MerchantOrdersPage** (orders + WebSocket)
5. ⚡ **MerchantTablesPage** (QR codes)
6. ⚡ **Customer Menu** (display products)
7. ⚡ **CartPage** (checkout + Stripe)
8. ⚡ **SuperAdmin** (approve merchants)

---

**All hooks are ready to use!** 🎉

Simply import and replace mock data with real API calls.
