# Sistema Admin Completo - Documentazione

## 📋 Panoramica

Questo documento descrive il sistema admin completo implementato con RBAC (Role-Based Access Control), dashboard avanzata, e tutte le funzionalità richieste per la gestione di un marketplace food delivery.

## 🏗️ Architettura del Sistema

### 1. Sistema RBAC (Role-Based Access Control)

**File**: `src/context/RBACContext.jsx`

#### Ruoli Disponibili

| Ruolo | Descrizione | Permessi |
|-------|-------------|----------|
| `SUPER_ADMIN` | Amministratore supremo | Tutti i permessi |
| `ADMIN` | Amministratore operativo | Ordini, prodotti, utenti, coupon, report |
| `MERCHANT_ADMIN` | Gestore ristorante | Prodotti e ordini del proprio ristorante |
| `SUPPORT_AGENT` | Agente supporto | Ordini (view), utenti (view), tickets |
| `FINANCE` | Team finanza | Payout, refund, transazioni, report finanziari |
| `LOGISTICS` | Team logistica | Assegnazione driver, routing, ETA |

#### Permessi Implementati

```javascript
PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',

  // Orders
  VIEW_ORDERS, CREATE_ORDERS, UPDATE_ORDERS, DELETE_ORDERS,
  REFUND_ORDERS, ASSIGN_DRIVER,

  // Products
  VIEW_PRODUCTS, CREATE_PRODUCTS, UPDATE_PRODUCTS, DELETE_PRODUCTS,
  BULK_IMPORT_PRODUCTS,

  // Merchants/Restaurants
  VIEW_MERCHANTS, CREATE_MERCHANTS, UPDATE_MERCHANTS, DELETE_MERCHANTS,

  // Users
  VIEW_USERS, CREATE_USERS, UPDATE_USERS, DELETE_USERS,
  BAN_USERS, IMPERSONATE_USERS,

  // Coupons & Loyalty
  VIEW_COUPONS, CREATE_COUPONS, UPDATE_COUPONS, DELETE_COUPONS,

  // Finance
  VIEW_FINANCE, MANAGE_PAYOUTS, MANAGE_REFUNDS, VIEW_TRANSACTIONS,

  // Reports
  VIEW_REPORTS, EXPORT_REPORTS,

  // Settings
  VIEW_SETTINGS, UPDATE_SETTINGS, MANAGE_INTEGRATIONS,

  // Audit & Security
  VIEW_AUDIT_LOGS, MANAGE_ROLES, MANAGE_2FA,

  // Support
  VIEW_TICKETS, CREATE_TICKETS, UPDATE_TICKETS, ESCALATE_TICKETS
}
```

#### Uso del Context RBAC

```javascript
import { useRBAC, PERMISSIONS } from '../../context/RBACContext'

function MyComponent() {
  const { currentUser, hasPermission, hasRole, logout } = useRBAC()

  // Verifica permesso
  if (hasPermission(PERMISSIONS.CREATE_PRODUCTS)) {
    // Mostra pulsante crea prodotto
  }

  // Verifica ruolo
  if (hasRole(ROLES.SUPER_ADMIN)) {
    // Funzionalità riservate
  }

  return (
    <div>
      <p>Benvenuto {currentUser.name}</p>
      <p>Ruolo: {currentUser.role}</p>
    </div>
  )
}
```

#### HOC per Proteggere Componenti

```javascript
import { withPermission, PERMISSIONS } from '../../context/RBACContext'

function ProductsPage() {
  return <div>Gestione Prodotti</div>
}

export default withPermission(ProductsPage, PERMISSIONS.VIEW_PRODUCTS)
```

---

## 🎨 Componenti UI

### AdminLayoutNew

**File**: `src/components/admin/AdminLayoutNew.jsx`

Layout principale dell'admin con:
- **Top Bar**: Logo, search, notifiche, user menu
- **Sidebar**: Menu di navigazione filtrato per permessi
- **Responsive**: Mobile-first con drawer sidebar
- **User Menu**: Profilo, impostazioni, logout
- **Role Badge**: Visualizza il ruolo dell'utente corrente

#### Menu Items Configurazione

I menu items vengono filtrati automaticamente in base ai permessi dell'utente:

```javascript
const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', permission: PERMISSIONS.VIEW_DASHBOARD },
  { name: 'Ordini', icon: ShoppingBag, path: '/admin/orders', permission: PERMISSIONS.VIEW_ORDERS },
  { name: 'Prodotti', icon: Package, path: '/admin/products', permission: PERMISSIONS.VIEW_PRODUCTS },
  { name: 'Ristoranti', icon: Store, path: '/admin/merchants', permission: PERMISSIONS.VIEW_MERCHANTS },
  { name: 'Utenti', icon: Users, path: '/admin/users', permission: PERMISSIONS.VIEW_USERS },
  { name: 'Coupon & Loyalty', icon: Ticket, path: '/admin/coupons', permission: PERMISSIONS.VIEW_COUPONS },
  { name: 'Finanza', icon: DollarSign, path: '/admin/finance', permission: PERMISSIONS.VIEW_FINANCE },
  { name: 'Report', icon: BarChart3, path: '/admin/reports', permission: PERMISSIONS.VIEW_REPORTS },
  { name: 'Impostazioni', icon: Settings, path: '/admin/settings', permission: PERMISSIONS.VIEW_SETTINGS }
]
```

---

## 📊 Pagine Admin Implementate

### 1. Dashboard (MVP)

**File**: `src/pages/admin/AdminDashboardNew.jsx`

#### Features

- **KPI Cards Principali**:
  - Ordini Totali (con trend %)
  - Fatturato (con trend %)
  - Valore Medio Ordine (con trend %)
  - Clienti Unici (con trend %)

- **Widget Stato Ordini**:
  - In Attesa (pending)
  - In Preparazione (preparing)
  - Pronti (ready)
  - Consegnati (delivered)

- **Ordini Recenti**: Ultimi 5 ordini con dettagli
- **Top 5 Prodotti**: Classifica per fatturato
- **Alert System**: Notifiche per ordini stuck
- **Time Range Selector**: Oggi / Ultimi 7 giorni / Ultimi 30 giorni

#### KPI Calculation Logic

```javascript
const totalOrders = currentOrders.length
const totalRevenue = currentOrders.reduce((sum, order) => sum + order.total, 0)
const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
const uniqueCustomers = new Set(currentOrders.map(o => o.customerName)).size
```

---

### 2. Gestione Ristoranti/Merchants

**File**: `src/pages/admin/AdminMerchantsPage.jsx`

#### Features

- **CRUD Completo**: Crea, visualizza, modifica, elimina ristoranti
- **Card View**: Design a card con informazioni chiave
- **Filtri**: Ricerca per nome/email/città, filtro per stato
- **Stati Gestiti**:
  - `active`: Ristorante attivo
  - `pending`: In attesa di approvazione
  - `suspended`: Sospeso
  - `inactive`: Inattivo

#### Dati Merchant

```javascript
{
  id: 1,
  name: 'Pizzeria Da Mario',
  description: 'Autentica pizza napoletana',
  email: 'mario@pizzeria.it',
  phone: '+39 333 1234567',
  address: 'Via Roma 123, Milano',
  city: 'Milano',
  commissionRate: 15, // Percentuale commissione
  status: 'active',
  rating: 4.8,
  totalOrders: 1250,
  revenue: 45230.50,
  category: 'Pizzeria',
  openingHours: '12:00 - 23:00',
  minOrder: 10, // Ordine minimo in €
  deliveryTime: '30-45 min',
  createdAt: '2024-01-15T...'
}
```

#### Azioni Disponibili

- **Visualizza**: Dettagli completi merchant
- **Modifica**: Aggiorna informazioni (se permesso UPDATE_MERCHANTS)
- **Elimina**: Rimuovi merchant (se permesso DELETE_MERCHANTS)
- **Approva**: Attiva merchant in stato pending (quick action)
- **Sospendi**: Sospendi merchant attivo

#### Modal CRUD

Il modal supporta 3 modalità:
- `view`: Solo visualizzazione
- `create`: Creazione nuovo merchant
- `edit`: Modifica merchant esistente

---

### 3. Finanza & Pagamenti

**File**: `src/pages/admin/AdminFinancePage.jsx`

#### Features

- **KPI Finanziari**:
  - Fatturato Lordo
  - Commissioni Totali
  - Rimborsi
  - Payout Pendenti

- **Profitto Netto**: Card evidenziata con calcolo
  ```javascript
  netProfit = totalRevenue - totalRefunds - totalPayouts
  ```

- **Tabella Transazioni**:
  - Vendite (sale)
  - Rimborsi (refund)
  - Payout (payout)

#### Tipi di Transazione

```javascript
{
  id: 1,
  type: 'sale', // o 'refund', 'payout'
  amount: 45.50,
  status: 'completed', // o 'pending', 'failed'
  orderNumber: 1001,
  customer: 'Mario Rossi',
  merchant: 'Pizzeria Da Mario',
  commission: 6.83, // 15% di 45.50
  netAmount: 38.67, // amount - commission
  paymentMethod: 'card', // o 'paypal', 'bank_transfer'
  date: '2024-03-20T14:30:00'
}
```

#### Gestione Payout

- **Visualizza** payout pendenti
- **Processa** payout (solo con permesso MANAGE_PAYOUTS)
- **Export** transazioni in CSV (solo con permesso EXPORT_REPORTS)

---

## 🔐 Sistema di Sicurezza

### Protezione Routes

Tutte le pagine admin verificano l'autenticazione:

```javascript
useEffect(() => {
  const auth = localStorage.getItem('adminAuth')
  if (!auth) navigate('/login')

  if (!hasPermission(PERMISSIONS.VIEW_FINANCE)) {
    navigate('/admin/dashboard')
  }
}, [navigate, hasPermission])
```

### Default User (Testing)

Per testing, viene creato automaticamente un Super Admin:

```javascript
{
  id: 1,
  name: 'Admin',
  email: 'admin@example.com',
  role: 'super_admin',
  merchantId: null,
  avatar: null,
  createdAt: new Date().toISOString()
}
```

### Cambio Ruolo (Demo)

Per testare diversi ruoli:

```javascript
const { changeUserRole, ROLES } = useRBAC()

// Cambia in Merchant Admin
changeUserRole(ROLES.MERCHANT_ADMIN)

// Cambia in Finance
changeUserRole(ROLES.FINANCE)
```

---

## 📁 Struttura File

```
src/
├── components/
│   └── admin/
│       ├── AdminLayout.jsx (vecchio)
│       └── AdminLayoutNew.jsx (nuovo con RBAC)
│
├── context/
│   ├── CartContext.jsx
│   ├── OrdersContext.jsx
│   ├── UserContext.jsx
│   └── RBACContext.jsx (NUOVO)
│
├── pages/
│   └── admin/
│       ├── AdminDashboard.jsx (vecchio)
│       ├── AdminDashboardNew.jsx (nuovo MVP)
│       ├── AdminOrdersPage.jsx
│       ├── AdminProductsPage.jsx
│       ├── AdminUsersPage.jsx
│       ├── AdminCouponsPage.jsx
│       ├── AdminReportsPage.jsx
│       ├── AdminSettingsPage.jsx
│       ├── AdminMerchantsPage.jsx (NUOVO)
│       └── AdminFinancePage.jsx (NUOVO)
│
└── App.jsx (aggiornato con RBACProvider e nuove routes)
```

---

## 🚀 Implementazione Roadmap

### ✅ MVP Completato

1. **Sistema RBAC** con 6 ruoli e 30+ permessi
2. **AdminLayoutNew** con sidebar responsive e menu filtrato
3. **Dashboard MVP** con KPI, widgets, ordini recenti, top prodotti
4. **Gestione Merchants** con CRUD completo
5. **Finanza & Pagamenti** con transazioni e payout

### 🔄 In Completamento

6. **Gestione Ordini Avanzata** (upgrade esistente)
7. **Gestione Prodotti** con varianti e add-ons
8. **Gestione Utenti** con ban/unban e impersonate
9. **Coupon & Loyalty** avanzato
10. **Reports & Analytics** con export CSV

### 📝 Advanced (Future)

11. Integrazione POS / KDS
12. Driver routing & tracking
13. Analytics avanzati + grafici (Chart.js)
14. Automazioni (email/SMS/webhooks)
15. Audit logs & rollback
16. A/B test management
17. Support ticketing system
18. Content Management (CMS)
19. 2FA & IP allowlist

---

## 💡 Best Practices

### Verifica Permessi nelle Azioni

```javascript
const handleDelete = (id) => {
  if (!hasPermission(PERMISSIONS.DELETE_MERCHANTS)) {
    alert('Non hai il permesso di eliminare ristoranti')
    return
  }

  // Procedi con l'eliminazione
  deleteMerchant(id)
}
```

### Filtrare UI in Base ai Permessi

```javascript
{hasPermission(PERMISSIONS.CREATE_MERCHANTS) && (
  <button onClick={handleCreate}>
    <Plus className="w-5 h-5" />
    <span>Nuovo Ristorante</span>
  </button>
)}
```

### Gestione Errori

```javascript
try {
  const result = await apiCall()
  setData(result)
} catch (error) {
  console.error('Error:', error)
  alert('Errore durante l\'operazione')
}
```

---

## 🎯 KPI & Metriche Implementate

### Dashboard

- Ordini Totali
- Fatturato
- Valore Medio Ordine (AOV)
- Clienti Unici
- Conversion Rate (da implementare)
- Ordini per Stato

### Finanza

- Fatturato Lordo
- Commissioni Totali
- Rimborsi
- Payout Processati
- Payout Pendenti
- Profitto Netto

### Merchants

- Ordini per Merchant
- Fatturato per Merchant
- Rating
- Commissione %

---

## 🔧 Personalizzazione

### Aggiungere Nuovi Permessi

1. Aggiungi il permesso in `RBACContext.jsx`:

```javascript
export const PERMISSIONS = {
  // ... existing permissions
  MY_NEW_PERMISSION: 'my_new_permission'
}
```

2. Assegna il permesso ai ruoli:

```javascript
const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [..., PERMISSIONS.MY_NEW_PERMISSION],
  [ROLES.ADMIN]: [..., PERMISSIONS.MY_NEW_PERMISSION]
}
```

3. Usa il permesso nei componenti:

```javascript
{hasPermission(PERMISSIONS.MY_NEW_PERMISSION) && (
  <button>Azione Protetta</button>
)}
```

### Aggiungere Nuovi Ruoli

1. Definisci il ruolo:

```javascript
export const ROLES = {
  // ... existing roles
  NEW_ROLE: 'new_role'
}
```

2. Configura i permessi:

```javascript
const ROLE_PERMISSIONS = {
  [ROLES.NEW_ROLE]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ORDERS
  ]
}
```

3. Aggiungi l'icona e il colore:

```javascript
const getRoleInfo = (role) => {
  const roleConfig = {
    [ROLES.NEW_ROLE]: {
      label: 'Nuovo Ruolo',
      icon: Star,
      color: 'text-pink-600 bg-pink-100'
    }
  }
}
```

---

## 📚 Risorse Aggiuntive

- **Framer Motion**: Animazioni e transizioni
- **Lucide Icons**: Libreria icone
- **Tailwind CSS**: Styling utility-first
- **React Router**: Navigation
- **LocalStorage**: Persistenza dati (sostituire con API reale)

---

## ⚡ Performance Tips

1. **Lazy Loading**: Importa le pagine con `React.lazy()`
2. **Memoization**: Usa `useMemo` per calcoli pesanti
3. **Virtualization**: Per liste lunghe (react-window)
4. **Code Splitting**: Separa bundle per route
5. **Caching**: Implementa caching per API calls

---

## 🐛 Debug & Testing

### Console Errors

Se vedi errori di permessi:
1. Verifica che RBACProvider avvolga le routes
2. Controlla che il permesso sia definito in PERMISSIONS
3. Verifica che il ruolo abbia il permesso in ROLE_PERMISSIONS

### Test Ruoli Diversi

```javascript
// In console del browser
localStorage.setItem('adminUser', JSON.stringify({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'merchant_admin', // Cambia qui
  merchantId: 1
}))

// Ricarica la pagina
location.reload()
```

---

## 📞 Supporto

Per domande o problemi:
1. Controlla questa documentazione
2. Verifica i console.log negli errori
3. Controlla localStorage per dati corrotti
4. Resetta localStorage: `localStorage.clear()`

---

**Versione**: 1.0.0
**Data**: 26 Dicembre 2024
**Autore**: Sistema Admin Food Delivery
