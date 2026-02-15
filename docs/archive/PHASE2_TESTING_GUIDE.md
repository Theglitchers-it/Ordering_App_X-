# 🧪 PHASE 2 - API TESTING GUIDE

Guida completa per testare tutti gli endpoint implementati nella Fase 2.

---

## 🚀 SETUP PRELIMINARE

### 1. Avvia il backend:
```bash
cd backend
npm run dev
```

### 2. Verifica health:
```bash
curl http://localhost:5000/health
```

---

## 1️⃣ AUTHENTICATION (Già funzionante)

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "merchant@test.com",
    "password": "password123",
    "first_name": "Mario",
    "last_name": "Rossi",
    "phone": "+39 123 456 7890"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "merchant@test.com",
    "password": "password123"
  }'
```

**Salva il `accessToken` dalla risposta!** Userai `TOKEN=your_access_token_here` nei prossimi comandi.

---

## 2️⃣ MERCHANTS

### Create Merchant
```bash
curl -X POST http://localhost:5000/api/merchants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "business_name": "Pizzeria Napoli",
    "description": "Autentica pizza napoletana",
    "email": "info@pizzerianapoli.it",
    "phone": "+39 081 123456",
    "address_line1": "Via Roma 123",
    "city": "Napoli",
    "postal_code": "80100",
    "country": "IT",
    "subscription_plan": "professional"
  }'
```

**Salva il `merchant.id` dalla risposta!**

### Get All Merchants (Public)
```bash
curl http://localhost:5000/api/merchants
```

### Get Merchant by Slug
```bash
curl http://localhost:5000/api/merchants/pizzeria-napoli-xxxxx
```

### Get My Merchant (Owner)
```bash
curl http://localhost:5000/api/merchants/me/dashboard \
  -H "Authorization: Bearer TOKEN"
```

### Update Merchant
```bash
curl -X PATCH http://localhost:5000/api/merchants/MERCHANT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "description": "La migliore pizza di Napoli!",
    "website": "https://pizzerianapoli.it"
  }'
```

### Get Merchant Stats
```bash
curl http://localhost:5000/api/merchants/MERCHANT_ID/stats \
  -H "Authorization: Bearer TOKEN"
```

---

## 3️⃣ CATEGORIES

### Create Category
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "merchant_id": MERCHANT_ID,
    "name": "Pizza",
    "description": "Le nostre pizze artigianali",
    "emoji": "🍕",
    "sort_order": 0
  }'
```

**Salva il `category.id`!**

### Get All Categories
```bash
curl "http://localhost:5000/api/categories?merchant_id=MERCHANT_ID"
```

### Update Category
```bash
curl -X PATCH http://localhost:5000/api/categories/CATEGORY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "description": "Pizze cotte nel forno a legna",
    "sort_order": 1
  }'
```

---

## 4️⃣ PRODUCTS

### Create Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "merchant_id": MERCHANT_ID,
    "category_id": CATEGORY_ID,
    "name": "Pizza Margherita",
    "description": "Pomodoro, mozzarella, basilico",
    "price": 8.50,
    "preparation_time": 15,
    "is_featured": true
  }'
```

**Salva il `product.id`!**

### Get All Products
```bash
# Tutti i prodotti
curl http://localhost:5000/api/products

# Per merchant
curl "http://localhost:5000/api/products?merchant_id=MERCHANT_ID"

# Per categoria
curl "http://localhost:5000/api/products?category_id=CATEGORY_ID"

# Search
curl "http://localhost:5000/api/products?search=margherita"

# Filtro prezzo
curl "http://localhost:5000/api/products?min_price=5&max_price=15"
```

### Get Product by ID
```bash
curl http://localhost:5000/api/products/PRODUCT_ID
```

### Update Product
```bash
curl -X PATCH http://localhost:5000/api/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "price": 9.00,
    "description": "Pomodoro San Marzano, mozzarella di bufala, basilico fresco"
  }'
```

### Toggle Availability
```bash
curl -X PATCH http://localhost:5000/api/products/PRODUCT_ID/toggle-availability \
  -H "Authorization: Bearer TOKEN"
```

### Bulk Import Products
```bash
curl -X POST http://localhost:5000/api/products/bulk-import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "merchant_id": MERCHANT_ID,
    "products": [
      {
        "name": "Pizza Diavola",
        "description": "Pomodoro, mozzarella, salame piccante",
        "price": 10.00,
        "category_id": CATEGORY_ID
      },
      {
        "name": "Pizza Quattro Formaggi",
        "description": "Mozzarella, gorgonzola, parmigiano, fontina",
        "price": 11.00,
        "category_id": CATEGORY_ID
      }
    ]
  }'
```

---

## 5️⃣ TABLES & QR CODES

### Create Table
```bash
curl -X POST http://localhost:5000/api/tables \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "merchant_id": MERCHANT_ID,
    "table_number": "T1",
    "table_name": "Tavolo Romantico",
    "capacity": 2,
    "floor": "Piano Terra",
    "section": "Sala Interna"
  }'
```

**Il QR code viene generato automaticamente!** Salva il `table.id`.

### Get All Tables
```bash
curl "http://localhost:5000/api/tables?merchant_id=MERCHANT_ID"
```

### Get Table by ID
```bash
curl http://localhost:5000/api/tables/TABLE_ID
```

### Update Table
```bash
curl -X PATCH http://localhost:5000/api/tables/TABLE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "capacity": 4,
    "table_name": "Tavolo Famiglia"
  }'
```

### Regenerate QR Code
```bash
curl -X POST http://localhost:5000/api/tables/TABLE_ID/regenerate-qr \
  -H "Authorization: Bearer TOKEN"
```

### Download QR Code (Image)
```bash
curl http://localhost:5000/api/tables/TABLE_ID/qr-download \
  -H "Authorization: Bearer TOKEN" \
  --output table-T1-qr.png
```

### Update Table Status
```bash
curl -X PATCH http://localhost:5000/api/tables/TABLE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "status": "occupied"
  }'
```

Valori possibili: `available`, `occupied`, `reserved`, `cleaning`

---

## 6️⃣ ORDERS

### Create Order (Public - no auth required)
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": MERCHANT_ID,
    "table_number": "T1",
    "customer_name": "Giovanni Bianchi",
    "customer_email": "giovanni@example.com",
    "customer_phone": "+39 333 1234567",
    "order_type": "dine_in",
    "payment_method": "stripe",
    "items": [
      {
        "product_id": PRODUCT_ID,
        "quantity": 2,
        "special_instructions": "Senza cipolla per favore"
      }
    ],
    "customer_notes": "Allergico alle noci"
  }'
```

**Salva `order.id` e `order.order_number`!**

### Get All Orders (User sees only their orders)
```bash
curl http://localhost:5000/api/orders \
  -H "Authorization: Bearer TOKEN"
```

### Get Order by ID
```bash
curl http://localhost:5000/api/orders/ORDER_ID \
  -H "Authorization: Bearer TOKEN"
```

### Update Order Status (Merchant)
```bash
curl -X PATCH http://localhost:5000/api/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "status": "confirmed"
  }'
```

Valori possibili: `pending`, `confirmed`, `preparing`, `ready`, `out_for_delivery`, `delivered`, `completed`, `cancelled`

**Questo invia email automatica al cliente + notifica real-time WebSocket!**

### Cancel Order
```bash
curl -X PATCH http://localhost:5000/api/orders/ORDER_ID/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "reason": "Cliente ha richiesto cancellazione"
  }'
```

---

## 7️⃣ PAYMENTS (Stripe)

### Create Payment Intent
```bash
curl -X POST http://localhost:5000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": ORDER_ID
  }'
```

**Risposta contiene `clientSecret` per Stripe.js!**

### Get Payment Status
```bash
curl http://localhost:5000/api/payments/ORDER_ID/status \
  -H "Authorization: Bearer TOKEN"
```

### Refund Payment (Admin/Merchant)
```bash
curl -X POST http://localhost:5000/api/payments/ORDER_ID/refund \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "amount": 8.50,
    "reason": "requested_by_customer"
  }'
```

Ometti `amount` per refund completo.

---

## 🎯 FLOW COMPLETO (End-to-End)

### Scenario: Cliente ordina pizza al tavolo

```bash
# 1. Cliente scansiona QR code del tavolo
curl http://localhost:5000/api/tables/TABLE_ID

# 2. Vede il menu del merchant
curl "http://localhost:5000/api/products?merchant_id=MERCHANT_ID"

# 3. Crea ordine
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": MERCHANT_ID,
    "table_id": TABLE_ID,
    "table_number": "T1",
    "customer_name": "Marco Verdi",
    "customer_email": "marco@test.com",
    "customer_phone": "+39 333 9876543",
    "order_type": "dine_in",
    "payment_method": "stripe",
    "items": [
      {"product_id": PRODUCT_ID_1, "quantity": 1},
      {"product_id": PRODUCT_ID_2, "quantity": 2}
    ]
  }'

# 4. Crea payment intent per Stripe
curl -X POST http://localhost:5000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{"order_id": ORDER_ID}'

# 5. (Frontend conferma pagamento con Stripe.js)
# 6. Stripe chiama webhook → ordine diventa "confirmed"

# 7. Merchant aggiorna stato
curl -X PATCH http://localhost:5000/api/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MERCHANT_TOKEN" \
  -d '{"status": "preparing"}'

# Cliente riceve email + notifica real-time! ✉️🔔

# 8. Ordine pronto
curl -X PATCH http://localhost:5000/api/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MERCHANT_TOKEN" \
  -d '{"status": "ready"}'

# 9. Completato
curl -X PATCH http://localhost:5000/api/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MERCHANT_TOKEN" \
  -d '{"status": "completed"}'
```

---

## ✅ CHECKLIST TEST

- [ ] Registrazione e login funzionano
- [ ] Creato merchant con successo
- [ ] Creato almeno 3 categorie
- [ ] Creato almeno 10 prodotti
- [ ] Generato QR code per 5 tavoli
- [ ] Scaricato QR code come immagine PNG
- [ ] Creato ordine pubblico (senza login)
- [ ] Aggiornato stato ordine (confirmed → preparing → ready)
- [ ] Ricevuta email di conferma ordine
- [ ] Creato Payment Intent Stripe
- [ ] Testato refund
- [ ] Verificato permessi RBAC (403 quando non autorizzato)

---

## 🐛 TROUBLESHOOTING

### Errore 401 "No token provided"
```bash
# Assicurati di includere il token:
-H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Errore 403 "Forbidden"
```bash
# L'utente non ha i permessi per questa azione
# Verifica il ruolo (merchant_admin, super_admin, etc.)
```

### Errore 404 "Not found"
```bash
# Verifica gli ID negli URL
# Sostituisci MERCHANT_ID, PRODUCT_ID, etc. con gli ID reali
```

### Email non arriva
```bash
# Verifica .env:
ENABLE_EMAIL=true
RESEND_API_KEY=re_your_api_key
```

### Stripe non funziona
```bash
# Verifica .env:
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

---

## 📊 RISULTATI ATTESI

Dopo tutti i test dovresti avere:
- ✅ 1 Merchant attivo
- ✅ 3+ Categorie
- ✅ 10+ Prodotti
- ✅ 5+ Tavoli con QR codes
- ✅ 3+ Ordini in vari stati
- ✅ Email di conferma inviate
- ✅ Payment intents Stripe creati

---

## 🎉 TEST COMPLETATI!

Tutti gli endpoint sono funzionanti e pronti per l'integrazione frontend!

**Next Step:** Integra il frontend React con questi endpoint reali!
