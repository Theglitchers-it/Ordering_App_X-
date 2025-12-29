# 🚀 Guida Rapida - Sistema Admin

## Accesso al Sistema

1. **Avvia il server**: `npm run dev`
2. **Apri il browser**: http://localhost:5173
3. **Vai all'admin**: http://localhost:5173/admin/dashboard

## 🔐 Login e Autenticazione

### Utente Default (Super Admin)

Il sistema crea automaticamente un Super Admin al primo accesso:

```javascript
Email: admin@example.com
Password: (usa la pagina login esistente)
Ruolo: Super Admin (tutti i permessi)
```

### Testare Diversi Ruoli

Per testare diversi ruoli, apri la console del browser (F12) e esegui:

```javascript
// Merchant Admin (solo gestione prodotti/ordini del proprio ristorante)
localStorage.setItem('adminUser', JSON.stringify({
  id: 2,
  name: 'Mario Rossi',
  email: 'mario@pizzeria.it',
  role: 'merchant_admin',
  merchantId: 1
}))
location.reload()

// Support Agent (solo visualizzazione ordini/utenti)
localStorage.setItem('adminUser', JSON.stringify({
  id: 3,
  name: 'Support',
  email: 'support@example.com',
  role: 'support_agent',
  merchantId: null
}))
location.reload()

// Finance (gestione transazioni/payout)
localStorage.setItem('adminUser', JSON.stringify({
  id: 4,
  name: 'Finance',
  email: 'finance@example.com',
  role: 'finance',
  merchantId: null
}))
location.reload()

// Torna a Super Admin
localStorage.setItem('adminUser', JSON.stringify({
  id: 1,
  name: 'Admin',
  email: 'admin@example.com',
  role: 'super_admin',
  merchantId: null
}))
location.reload()
```

## 📊 Funzionalità Implementate

### ✅ Sistema RBAC

- **6 Ruoli**: Super Admin, Admin, Merchant Admin, Support, Finance, Logistics
- **30+ Permessi**: Granulari per ogni risorsa
- **Menu Dinamico**: Si adatta ai permessi dell'utente
- **HOC Protection**: Componenti protetti automaticamente

**Prova**: Cambia ruolo e osserva come cambia il menu laterale!

### ✅ Dashboard MVP

**URL**: `/admin/dashboard`

Features:
- KPI Cards: Ordini, Fatturato, AOV, Clienti
- Widget Stati Ordini: Pending, Preparing, Ready, Delivered
- Ordini Recenti: Ultimi 5 con dettagli
- Top 5 Prodotti: Classifica per revenue
- Alert System: Notifiche per ordini stuck
- Time Range: Oggi / 7 giorni / 30 giorni

**Prova**: Clicca sui diversi time range e osserva il cambiamento dei dati!

### ✅ Gestione Ristoranti

**URL**: `/admin/merchants`

Features:
- CRUD Completo: Crea, Modifica, Visualizza, Elimina
- Card View: Design moderno a card
- Filtri: Ricerca e filtro per stato
- Approvazione: Quick action per approvare merchant pending
- Commissioni: Gestione commissioni per merchant
- Stats: Ordini e fatturato per merchant

**Prova**:
1. Clicca "Nuovo Ristorante" per creare un merchant
2. Compila i dati e salva
3. Usa i pulsanti di azione (visualizza, modifica, elimina)

### ✅ Finanza & Pagamenti

**URL**: `/admin/finance`

Features:
- KPI Finanziari: Fatturato, Commissioni, Rimborsi, Payout
- Profitto Netto: Calcolo automatico
- Transazioni: Tabella completa con dettagli
- Payout Management: Processa payout pendenti
- Export CSV: Esporta transazioni (coming soon)

**Prova**:
1. Visualizza il profitto netto in evidenza
2. Scorri la tabella transazioni
3. Processa un payout pendente (se hai permesso MANAGE_PAYOUTS)

## 🎨 UI/UX Features

### Top Bar

- **Logo** e nome applicazione
- **Search Bar**: Ricerca globale (desktop)
- **Notifiche**: Badge con counter
- **User Menu**: Profilo, impostazioni, logout

### Sidebar

- **Icone**: Visual per ogni sezione
- **Active State**: Evidenzia pagina corrente
- **Responsive**: Drawer su mobile
- **Permission-Based**: Mostra solo voci accessibili

### Cards & Modals

- **Animazioni**: Framer Motion per transizioni smooth
- **Colors**: Gradient per evidenziare dati importanti
- **Icons**: Lucide Icons per visual consistency
- **States**: Loading, empty, error states

## 🔧 Personalizzazione

### Cambiare Tema Colori

Il sistema usa principalmente **arancione** come colore principale.

Per cambiare in blu, cerca e sostituisci in tutti i file:

```
from-orange-500 to-orange-600 → from-blue-500 to-blue-600
text-orange-600 → text-blue-600
bg-orange-500 → bg-blue-500
focus:ring-orange-500 → focus:ring-blue-500
```

### Aggiungere Nuova Voce Menu

1. Apri `AdminLayoutNew.jsx`
2. Aggiungi voce a `menuItems`:

```javascript
{
  name: 'Nuova Sezione',
  icon: Star, // Importa da lucide-react
  path: '/admin/nuova-sezione',
  permission: PERMISSIONS.VIEW_NUOVA_SEZIONE
}
```

3. Crea il permesso in `RBACContext.jsx`
4. Crea la pagina in `src/pages/admin/`
5. Aggiungi route in `App.jsx`

## 📱 Responsive Design

Il sistema è completamente responsive:

- **Mobile** (< 768px): Drawer sidebar, cards ottimizzate
- **Tablet** (768px - 1024px): Sidebar fissa, grid 2 colonne
- **Desktop** (> 1024px): Layout completo, grid 4 colonne

**Prova**: Ridimensiona il browser e osserva le modifiche!

## 🐛 Troubleshooting

### Problema: Menu laterale non mostra voci

**Soluzione**: Verifica di essere autenticato e di avere i permessi corretti.

```javascript
// Console del browser
const { currentUser, getUserPermissions } = useRBAC()
console.log('User:', currentUser)
console.log('Permissions:', getUserPermissions())
```

### Problema: "Accesso Negato" su una pagina

**Soluzione**: Il tuo ruolo non ha il permesso richiesto.

1. Controlla il permesso richiesto dalla pagina
2. Verifica i permessi del tuo ruolo in `RBACContext.jsx`
3. Cambia ruolo in Super Admin per testing

### Problema: Dati non si salvano

**Soluzione**: Il sistema usa localStorage per demo.

```javascript
// Verifica dati
console.log('Merchants:', localStorage.getItem('merchants'))
console.log('Transactions:', localStorage.getItem('transactions'))

// Reset completo
localStorage.clear()
location.reload()
```

### Problema: Errori in console

**Soluzione**: Verifica import e dipendenze.

```bash
# Reinstalla dipendenze
npm install

# Pulisci cache
npm run dev -- --force
```

## 📊 Demo Data

Il sistema crea automaticamente dati demo per testing:

- **3 Merchants**: Pizzeria, Sushi, Burger
- **Ordini**: Caricati da OrdersContext
- **4 Transactions**: Sale, Refund, Payout
- **Users**: Vari ruoli pre-configurati

## 🎯 Prossimi Passi

### Features da Completare

1. **Gestione Ordini Avanzata**: Bulk actions, assign driver
2. **Gestione Prodotti**: Varianti, add-ons, bulk import
3. **Gestione Utenti**: Ban/unban, impersonate, credit points
4. **Coupon & Loyalty**: Regole avanzate, stackable, tiers
5. **Reports & Analytics**: Grafici Chart.js, export CSV/XLSX

### Advanced Features (Future)

6. **POS Integration**: KDS, printer support
7. **Driver Tracking**: Real-time map, routing
8. **Analytics Avanzati**: Heatmaps, funnels, cohorts
9. **Automazioni**: Email templates, SMS, webhooks
10. **Audit Logs**: Chi ha fatto cosa e quando
11. **CMS**: Banner, FAQs, T&C editor
12. **Support Tickets**: Sistema ticketing integrato
13. **2FA**: Two-factor authentication

## 💡 Tips & Tricks

### Navigazione Veloce

- `Ctrl+K` (future): Quick search globale
- Click su logo: Torna a dashboard
- User menu: Quick logout

### Shortcuts Tastiera (Future)

- `Ctrl+N`: Nuovo item (context-based)
- `Ctrl+S`: Salva (in modals)
- `Esc`: Chiudi modal
- `/`: Focus search bar

### Best Practices

1. **Sempre verificare permessi** prima di azioni critiche
2. **Usa conferme** per delete e azioni irreversibili
3. **Mostra feedback** visivo per tutte le azioni
4. **Loading states** per operazioni async
5. **Error handling** con messaggi chiari

## 📚 Risorse

- **Documentazione Completa**: `ADMIN_SYSTEM_DOCUMENTATION.md`
- **Framer Motion**: https://www.framer.com/motion/
- **Lucide Icons**: https://lucide.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **React Router**: https://reactrouter.com/

## ✅ Checklist Pre-Produzione

Prima di andare in produzione:

- [ ] Sostituisci localStorage con API reale
- [ ] Implementa autenticazione JWT
- [ ] Configura HTTPS
- [ ] Setup CI/CD pipeline
- [ ] Audit sicurezza
- [ ] Test completi E2E
- [ ] Ottimizzazione performance
- [ ] Setup monitoring (Sentry, LogRocket)
- [ ] Backup strategy
- [ ] GDPR compliance

---

**Buon lavoro! 🚀**

Per domande o supporto, consulta `ADMIN_SYSTEM_DOCUMENTATION.md`
