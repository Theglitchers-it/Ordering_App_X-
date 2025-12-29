# 🧪 Guida Testing End-to-End

## Server in Esecuzione
**URL:** http://localhost:5174/

---

## 📋 Test Scenarios

### 1️⃣ Test Flow SaaS → Merchant Registration

**Steps:**
1. Vai su http://localhost:5174/
2. Verifica landing page caricata correttamente
3. Click su "Inizia Gratis" o "Prova Gratis"
4. Compila form registrazione:
   - Nome Ristorante: "Test Pizzeria"
   - Tipo: Pizzeria
   - Email: test@pizzeria.it
   - Password: test123
5. Click "Crea Account"
6. **Expected:** Redirect a `/merchant/dashboard`
7. **Expected:** Merchant salvato in localStorage

**Verifica localStorage:**
```javascript
// Console browser
localStorage.getItem('merchantAuth')
localStorage.getItem('merchants')
```

---

### 2️⃣ Test Merchant Dashboard & Navigation

**Steps:**
1. Vai su http://localhost:5174/merchant/dashboard
2. Verifica Quick Stats visualizzate
3. Verifica 6 action cards presenti
4. Click su ogni card e verifica redirect:
   - Orders → `/merchant/orders`
   - Menu → `/merchant/menu`
   - Tables → `/merchant/tables`
   - Analytics → `/merchant/analytics`

**Expected Results:**
- ✅ Dashboard carica senza errori
- ✅ Stats mostrano dati mock
- ✅ Navigation funziona
- ✅ Ogni page carica correttamente

---

### 3️⃣ Test Menu Builder

**Steps:**
1. Vai su http://localhost:5174/merchant/menu
2. Verifica lista piatti caricata
3. Usa search bar: cerca "Pizza"
4. Usa filtro categoria: seleziona "Pizza"
5. Verifica piatti filtrati correttamente

**Expected Results:**
- ✅ Piatti mostrati solo per merchant corrente
- ✅ Search funziona in real-time
- ✅ Filtro categoria funziona
- ✅ Badge count aggiornato

---

### 4️⃣ Test Tables & QR Codes

**Steps:**
1. Vai su http://localhost:5174/merchant/tables
2. Verifica Stats cards:
   - Totale Tavoli
   - Disponibili
   - Occupati
   - Tasso Occupazione
3. Verifica grid tavoli con QR codes
4. Click "Scarica" su un tavolo
5. Click "Preview" su un tavolo

**Expected Results:**
- ✅ Stats corrette per merchant
- ✅ QR codes visibili
- ✅ Download simulato funziona
- ✅ Preview mostra QR code

---

### 5️⃣ Test Customer Order Flow (CRITICO)

**Steps:**

**A. Scan QR Code (Simulato)**
1. Vai su: http://localhost:5174/demo?merchant=merchant_1&table=5
2. **Expected:** Badge "Tavolo #5" visibile in alto a destra
3. **Expected:** Nome "Pizzeria Rossi" visibile
4. **Expected:** Menu filtrato solo per Pizzeria Rossi

**B. Aggiungi al Carrello**
1. Click "Add to Cart" su 2-3 piatti
2. Click icona carrello in alto
3. **Expected:** Redirect a `/cart`
4. **Expected:** Items nel carrello

**C. Checkout**
1. Nel carrello, click "Procedi al Checkout" o simile
2. Compila dati se richiesti
3. Seleziona metodo pagamento: "Carta di Credito"
4. Click "Conferma Ordine"
5. **Expected:** Redirect a `/order-confirmation`

**D. Verifica Order Confirmation**
1. **Expected:** Numero ordine visibile
2. **Expected:** "Ristorante: Pizzeria Rossi" visibile
3. **Expected:** "Tavolo: Tavolo #5" visibile
4. **Expected:** Totale ordine corretto

**E. Verifica Ordine in Orders**
```javascript
// Console browser
JSON.parse(localStorage.getItem('orders'))
```
- **Expected:** Ordine ha `merchantId: "merchant_1"`
- **Expected:** Ordine ha `tableNumber: 5`

---

### 6️⃣ Test Merchant Orders Management

**Steps:**
1. Dopo aver creato ordine nel Test 5
2. Vai su http://localhost:5174/merchant/orders
3. **Expected:** Ordine visibile nella lista
4. **Expected:** Badge "Tavolo #5" visibile nell'ordine
5. **Expected:** Status "Confermato" (blu)
6. Verifica Stats cards aggiornate:
   - Totali: +1
   - In Attesa o Confermato: +1

**Test Azioni Ordine:**
1. Click "Inizia Preparazione" sull'ordine
2. **Expected:** Status → "In Preparazione" (arancione)
3. **Expected:** Pulsante cambia a "Segna come Pronto"
4. Click "Segna come Pronto"
5. **Expected:** Status → "Pronto" (verde)
6. Click "Completa Ordine"
7. **Expected:** Status → "Consegnato" (grigio)

**Test Filtri:**
1. Usa search bar: cerca numero ordine
2. Usa filtro status: seleziona "Consegnato"
3. Usa filtro tavolo: seleziona "Tavolo #5"
4. **Expected:** Filtri funzionano correttamente

---

### 7️⃣ Test Merchant Analytics

**Steps:**
1. Vai su http://localhost:5174/merchant/analytics
2. Verifica KPI Cards:
   - Revenue Totale > 0
   - Ordini Completati
   - Scontrino Medio (AOV)
   - Piatti Venduti
3. Verifica "Revenue Ultimi 7 Giorni"
   - **Expected:** Grafico con barre
   - **Expected:** Valori per oggi visibili
4. Verifica "Top 10 Piatti Più Venduti"
   - **Expected:** Lista con ranking
   - **Expected:** Quantità e revenue per piatto
5. Verifica "Orari di Punta"
   - **Expected:** Top 5 fasce orarie
6. Verifica "Top 5 Tavoli Più Attivi"
   - **Expected:** Tavolo #5 presente se hai ordinato

**Expected Results:**
- ✅ Tutte le metriche calcolate correttamente
- ✅ Grafici animati
- ✅ Dati aggiornati con ordini recenti

---

### 8️⃣ Test Super Admin Dashboard

**Steps:**
1. Vai su http://localhost:5174/superadmin
2. Verifica KPI Cards:
   - Revenue Totale Piattaforma: €59,250
   - Commissioni Guadagnate: €6,125
   - MRR: €187
   - Net Profit: €6,312
3. Verifica "Top 5 Merchants"
   - **Expected:** 3 merchants elencati
   - **Expected:** Revenue breakdown visibile
4. Verifica grafico revenue
   - **Expected:** Bars chart visibile

**Expected Results:**
- ✅ Stats globali corrette
- ✅ Calcoli commissioni accurati
- ✅ Tutti i merchants visibili

---

### 9️⃣ Test Multi-Tenant Isolation

**A. Test Merchant 1 (Pizzeria Rossi)**
1. Vai su http://localhost:5174/demo?merchant=merchant_1
2. **Expected:** Solo 5 piatti di Pizzeria Rossi visibili
3. Vai su http://localhost:5174/merchant/menu
4. **Expected:** Solo 5 piatti nel menu builder

**B. Test Merchant 2 (Bar Centrale)**
1. Cambia merchantAuth in localStorage:
```javascript
localStorage.setItem('merchantAuth', JSON.stringify({
  merchantId: 'merchant_2',
  email: 'test@bar.it',
  role: 'MERCHANT_ADMIN'
}))
```
2. Ricarica http://localhost:5174/merchant/menu
3. **Expected:** Solo 2 piatti di Bar Centrale visibili
4. Vai su http://localhost:5174/merchant/orders
5. **Expected:** Solo ordini di Bar Centrale visibili

**Expected Results:**
- ✅ Data isolation perfetta
- ✅ Merchant A non vede dati Merchant B
- ✅ Filtri per merchantId funzionano

---

### 🔟 Test Coupons Multi-Tenant

**A. Test Coupon Globale (WELCOME20)**
1. Vai su http://localhost:5174/demo?merchant=merchant_1
2. Aggiungi prodotti al carrello
3. In CartPage, applica coupon: "WELCOME20"
4. **Expected:** Coupon applicato (20% sconto)

**B. Test Coupon Merchant-Specific (PIZZA10)**
1. Con merchant_1 (Pizzeria Rossi):
2. Applica coupon: "PIZZA10"
3. **Expected:** Coupon applicato (€10 sconto)

4. Cambia merchant a merchant_2:
```javascript
localStorage.setItem('merchantAuth', JSON.stringify({
  merchantId: 'merchant_2',
  email: 'test@bar.it',
  role: 'MERCHANT_ADMIN'
}))
```
5. Vai su http://localhost:5174/demo?merchant=merchant_2
6. Aggiungi prodotti, vai al carrello
7. Applica coupon: "PIZZA10"
8. **Expected:** "Codice coupon non valido" (perché è solo per merchant_1)

9. Applica coupon: "FREE5"
10. **Expected:** Coupon applicato (€5 sconto, perché è per merchant_2)

---

## ✅ Checklist Finale

### Funzionalità Core
- [ ] SaaS Landing carica correttamente
- [ ] Merchant registration funziona
- [ ] Merchant dashboard accessibile
- [ ] Menu builder mostra piatti corretti
- [ ] Tables con QR codes generati
- [ ] QR scan rileva tavolo
- [ ] Order flow completo funziona
- [ ] Orders management funziona
- [ ] Analytics calcola metriche
- [ ] Super admin mostra stats globali

### Data Isolation
- [ ] Merchant A vede solo suoi dati
- [ ] Merchant B vede solo suoi dati
- [ ] Orders filtrati per merchantId
- [ ] Favorites filtrati per merchantId
- [ ] Coupons filtrati per merchantId

### UI/UX
- [ ] Animazioni Framer Motion fluide
- [ ] Responsive su mobile
- [ ] Navigation funziona
- [ ] Forms validano input
- [ ] Error messages chiari

---

## 🐛 Bug Report Template

Se trovi bug durante il testing:

```markdown
## Bug: [Titolo breve]

**Steps to Reproduce:**
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

**Expected Result:**
[Cosa dovrebbe succedere]

**Actual Result:**
[Cosa succede invece]

**Console Errors:**
[Copia errori console]

**Screenshot:**
[Se applicabile]

**Priority:** [High/Medium/Low]
```

---

## 🎯 Testing Completato?

Quando hai completato tutti i test:

1. ✅ Tutti gli scenari passati
2. ✅ Zero errori console
3. ✅ Data isolation verificata
4. ✅ Multi-tenant funzionante

**Il sistema è pronto per il deploy! 🚀**

---

*Ultima modifica: 27 Dicembre 2025*
