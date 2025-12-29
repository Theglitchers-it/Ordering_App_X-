# 🔐 RBAC System - Documentazione Completa

Sistema di **Role-Based Access Control** (RBAC) implementato con permessi granulari per ogni risorsa e azione.

## 📋 Indice

1. [Ruoli Disponibili](#ruoli-disponibili)
2. [Matrice Permessi](#matrice-permessi)
3. [API REST Protette](#api-rest-protette)
4. [Componenti UI/UX](#componenti-uiux)
5. [Esempi di Utilizzo](#esempi-di-utilizzo)
6. [Credenziali di Test](#credenziali-di-test)

---

## 🎭 Ruoli Disponibili

### 1. Super Admin (`super_admin`)
**Accesso completo** a tutte le risorse e funzionalità

- Gestione ordini (CRUD completo)
- Gestione prodotti (CRUD + import/export)
- Gestione utenti (CRUD)
- Gestione coupon e loyalty
- Accesso a tutti i report
- Gestione payouts e transazioni
- Gestione refund
- Accesso audit logs
- Configurazione sistema

### 2. Admin/Ops (`admin_ops`)
**Gestione operativa** - esclusi dati finanziari sensibili

- Ordini (read, update, export)
- Utenti (read, update, export)
- Coupon (create, read, update)
- Report (read, export)
- Tickets (read, update)
- Audit logs (read only)

❌ **NON può accedere** a: payouts, transazioni sensibili, delete

### 3. Merchant Admin (`merchant_admin`)
**Gestione del proprio ristorante**

- Prodotti del proprio ristorante (CRUD completo + import)
- Ordini del proprio ristorante (read, update)
- Report del proprio ristorante (read)

🔒 **Limitato** solo ai dati del proprio merchant

### 4. Support Agent (`support_agent`)
**Assistenza clienti**

- Tickets (CRUD)
- Ordini (read, update limitato - no delete)
- Utenti (read only)
- Refund (create, read - no approve)

✅ **Focus** su supporto e gestione reclami

### 5. Finance (`finance`)
**Gestione finanziaria**

- Payouts (CRUD + approve)
- Transazioni (read, export)
- Refund (create, read, approve, export)
- Report finanziari (read, export)
- Audit logs (read)

💰 **Accesso esclusivo** a dati finanziari

### 6. Logistics / Dispatcher (`logistics`)
**Gestione consegne**

- Driver (read, update - assegnazione)
- Routing (read, update - ottimizzazione percorsi)
- Ordini (read, update - solo per assegnazione driver e ETA)
- Report logistici (read)

🚗 **Focus** su consegne e logistica

---

## 📊 Matrice Permessi

| Risorsa | Super Admin | Admin/Ops | Merchant | Support | Finance | Logistics |
|---------|-------------|-----------|----------|---------|---------|-----------|
| **Orders** | CRUD + Export | RU + Export | RU (own) | RU (limited) | - | RU (delivery) |
| **Products** | CRUD + I/E | - | CRUD + I (own) | - | - | - |
| **Users** | CRUD + Export | RU + Export | - | R | - | - |
| **Coupons** | CRUD | CRU | - | - | - | - |
| **Reports** | R + Export | R + Export | R (own) | - | R + Export | R |
| **Payouts** | CRUD + Approve | - | - | - | CRUD + Approve | - |
| **Transactions** | R + Export | - | - | - | R + Export | - |
| **Refunds** | CR + Approve | - | - | CR | CRA + Export | - |
| **Drivers** | CRUD | - | - | - | - | RU |
| **Routing** | RU | - | - | - | - | RU |
| **Audit Logs** | R + Export | R | - | - | R | - |

**Legenda**: C=Create, R=Read, U=Update, D=Delete, I=Import, E=Export, A=Approve

---

## 🌐 API REST Protette

Tutte le API sono protette con:
- ✅ Autenticazione (JWT in produzione)
- ✅ Controllo ruolo e permessi
- ✅ Rate limiting (100 req/min per default)
- ✅ Audit logging automatico

### Esempi di Endpoint

#### Orders

```javascript
// GET /admin/orders?status=preparing&page=1&limit=20
const orders = await getOrders({
  status: 'preparing',
  page: 1,
  limit: 20
}, userRole, userId)

// GET /admin/orders/:id
const order = await getOrderById(orderId, userRole, userId)

// POST /admin/orders/:id/status
const result = await updateOrderStatus(
  orderId,
  'out_for_delivery',
  userRole,
  userId
)

// POST /admin/orders/bulk-update
const bulkResult = await bulkUpdateOrders(
  [101, 102, 103],
  { status: 'preparing' },
  userRole,
  userId
)

// POST /admin/orders/export
const csvData = await exportOrders(
  { status: 'delivered', from: '2024-01-01' },
  'csv',
  userRole,
  userId
)
```

#### Products

```javascript
// PATCH /admin/products/:id
const updated = await updateProduct(
  productId,
  { price: 12.99, availability: true },
  userRole,
  userId
)

// POST /admin/products/import (CSV)
const importResult = await importProducts(
  csvDataArray,
  userRole,
  userId
)
// Returns: { imported: 150, errors: 3, details: [...] }
```

#### Coupons

```javascript
// POST /admin/coupons
const coupon = await createCoupon({
  code: 'SUMMER2024',
  description: 'Sconto estivo 20%',
  discountType: 'percentage',
  discountValue: 20,
  minPurchase: 25,
  tierRequired: 'Silver'
}, userRole, userId)
```

#### Reports

```javascript
// GET /admin/reports/sales?from=2024-01-01&to=2024-12-31
const report = await getSalesReport(
  { from: '2024-01-01', to: '2024-12-31' },
  userRole,
  userId
)

/* Returns:
{
  summary: {
    totalRevenue: 125450.50,
    totalOrders: 1523,
    averageOrderValue: 82.34
  },
  daily: [
    { date: '2024-01-01', revenue: 2350, orders: 45 },
    ...
  ]
}
*/
```

#### Users

```javascript
// POST /admin/users/:id/adjust-points
const result = await adjustUserPoints(
  userId,
  50, // amount
  'Bonus fedeltà',
  userRole,
  currentUserId
)
```

#### Global Search

```javascript
// GET /admin/search?q=mario
const results = await globalSearch('mario', userRole, userId)

/* Returns:
{
  orders: [...],
  users: [...],
  products: [...]
}
*/
```

---

## 🎨 Componenti UI/UX

### 1. ProtectedRoute

Protegge le route in base a ruolo e permessi:

```jsx
import ProtectedRoute from './components/ProtectedRoute'

// Richiede solo autenticazione admin
<ProtectedRoute requireAdmin={true}>
  <AdminDashboard />
</ProtectedRoute>

// Richiede ruolo specifico
<ProtectedRoute requiredRole={ROLES.FINANCE}>
  <PayoutsPage />
</ProtectedRoute>

// Richiede permesso specifico
<ProtectedRoute requiredPermission={{ resource: 'orders', action: 'delete' }}>
  <OrdersManagement />
</ProtectedRoute>
```

### 2. BulkActions

Gestione azioni su selezioni multiple con conferma:

```jsx
import BulkActions from './components/admin/BulkActions'

<BulkActions
  selectedItems={selectedOrders}
  onAction={handleBulkAction}
  onClearSelection={() => setSelectedOrders([])}
  actions={[
    {
      id: 'mark_delivered',
      label: 'Segna Consegnati',
      icon: CheckCircle,
      color: 'green',
      requiresConfirm: true,
      confirmMessage: 'Confermi di voler segnare come consegnati?'
    },
    {
      id: 'export',
      label: 'Esporta CSV',
      icon: Download,
      color: 'blue',
      requiresConfirm: false
    }
  ]}
/>
```

**Features**:
- ✅ Selezione multipla con checkbox
- ✅ Azioni personalizzabili
- ✅ Conferma per azioni distruttive
- ✅ Feedback success/error con toast
- ✅ Audit logging automatico

### 3. GlobalSearch

Ricerca globale con fuzzy matching e navigazione da tastiera:

```jsx
import GlobalSearch from './components/admin/GlobalSearch'

const [searchOpen, setSearchOpen] = useState(false)

// Apri con Cmd+K / Ctrl+K
useEffect(() => {
  const handler = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setSearchOpen(true)
    }
  }
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, [])

<GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
```

**Features**:
- ✅ Ricerca real-time con debounce (300ms)
- ✅ Fuzzy search (cerca in ordini, utenti, prodotti per ID, nome, email, phone)
- ✅ Navigazione da tastiera (↑↓ + Enter)
- ✅ Highlighting dei match
- ✅ Shortcut Cmd+K / Ctrl+K

### 4. SavedViews (Filtri Salvati)

Salva e riutilizza combinazioni di filtri:

```jsx
const savedViews = [
  {
    id: 'today_orders',
    name: 'Ordini Odierni',
    filters: { date: 'today', status: 'all' }
  },
  {
    id: 'to_deliver',
    name: 'Da Consegnare',
    filters: { status: 'ready', date: 'all' }
  },
  {
    id: 'high_value',
    name: 'Alto Valore (€50+)',
    filters: { minAmount: 50 }
  }
]
```

### 5. Inline Edit

Modifica rapida con audit tracking:

```jsx
<InlineEdit
  value={product.price}
  onSave={async (newValue) => {
    await updateProduct(product.id, { price: newValue })
    // Audit log automatico
  }}
  type="number"
  min={0}
  step={0.01}
/>
```

### 6. Impersonate User (Debug UX)

Permette a admin/support di impersonare utenti per debug:

```jsx
import { useAuth } from './context/AuthContext'

const { impersonateUser } = useAuth()

const handleImpersonate = async (userId) => {
  const result = await impersonateUser(userId)
  // Audit log: admin@app.com impersonated user_123
  // UI mostra banner "Impersonating: Mario Rossi"
}
```

**⚠️ Attenzione**: Tutte le azioni in modalità impersonate vengono tracciate nell'audit log.

---

## 💡 Esempi di Utilizzo

### Esempio 1: Protezione Route Admin

```jsx
// App.jsx
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

<AuthProvider>
  <Routes>
    <Route path="/admin/dashboard" element={
      <ProtectedRoute requireAdmin={true}>
        <AdminDashboard />
      </ProtectedRoute>
    } />

    <Route path="/admin/payouts" element={
      <ProtectedRoute requiredRole={ROLES.FINANCE}>
        <PayoutsPage />
      </ProtectedRoute>
    } />
  </Routes>
</AuthProvider>
```

### Esempio 2: Controllo Permessi nel Componente

```jsx
import { useAuth } from './context/AuthContext'
import { RESOURCES, ACTIONS } from './utils/rbac'

function OrdersPage() {
  const { checkPermission } = useAuth()

  const canDelete = checkPermission(RESOURCES.ORDERS, ACTIONS.DELETE)
  const canExport = checkPermission(RESOURCES.ORDERS, ACTIONS.EXPORT)

  return (
    <div>
      {canDelete && (
        <button onClick={handleDelete}>Elimina</button>
      )}

      {canExport && (
        <button onClick={handleExport}>Esporta CSV</button>
      )}
    </div>
  )
}
```

### Esempio 3: Bulk Actions con API

```jsx
const handleBulkAction = async (actionId, selectedItems) => {
  switch (actionId) {
    case 'mark_delivered':
      await bulkUpdateOrders(
        selectedItems.map(o => o.orderNumber),
        { status: 'delivered' },
        currentRole,
        userId
      )
      break

    case 'export':
      const csv = await exportOrders(
        { ids: selectedItems.map(o => o.orderNumber) },
        'csv',
        currentRole,
        userId
      )
      downloadCSV(csv.data, csv.filename)
      break
  }
}
```

---

## 🔑 Credenziali di Test

### Super Admin
```
Email: admin@app.com
Password: admin123
```

### Admin/Ops
```
Email: ops@app.com
Password: ops123
```

### Merchant Admin
```
Email: merchant@app.com
Password: merchant123
```

### Support Agent
```
Email: support@app.com
Password: support123
```

### Finance
```
Email: finance@app.com
Password: finance123
```

### Logistics
```
Email: logistics@app.com
Password: logistics123
```

---

## 🛡️ Sicurezza

### Rate Limiting
- 100 richieste/minuto per endpoint (configurabile)
- Client-side per demo, **deve essere implementato lato server** in produzione

### Audit Logging
Ogni azione viene tracciata con:
- User ID
- Ruolo
- Azione eseguita
- Risorsa modificata
- Dettagli aggiuntivi
- Timestamp
- IP e User Agent

Accessibile solo a ruoli con permesso `audit_logs:read`

### Best Practices Implementate
- ✅ Principio del minimo privilegio
- ✅ Separazione dei ruoli
- ✅ Conferma per azioni distruttive
- ✅ Audit trail completo
- ✅ Rate limiting
- ✅ Validazione input
- ✅ Messaggi di errore non informativi (no leak di info sensibili)

---

## 🚀 Prossimi Step (Produzione)

1. **Backend API**: Implementare endpoint REST reali con Node.js/Express o framework preferito
2. **JWT Authentication**: Sostituire localStorage con JWT tokens
3. **Database**: PostgreSQL/MongoDB per persistenza
4. **Server-side Rate Limiting**: Redis + express-rate-limit
5. **Monitoring**: Sentry per error tracking, DataDog per performance
6. **2FA**: Autenticazione a due fattori per admin
7. **IP Whitelisting**: Per ruoli critici (finance, super admin)
8. **Session Management**: Auto-logout dopo inattività
9. **Audit Dashboard**: UI dedicata per analisi audit logs
10. **Compliance**: GDPR, data retention policies

---

## 📖 Risorse Aggiuntive

- [OWASP Access Control Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html)
- [RBAC vs ABAC](https://www.authgear.com/post/rbac-vs-abac)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Autore**: Claude Agent SDK
**Versione**: 1.0.0
**Data**: 2024-12-26
