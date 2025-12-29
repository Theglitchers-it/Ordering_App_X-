# 🧙‍♂️ Guida Onboarding Wizard - Merchant Setup Guidato

## 🎯 Panoramica

L'**Onboarding Wizard** è un sistema guidato in 4 step che accompagna i nuovi merchant nella configurazione iniziale del loro account dopo la registrazione.

---

## 🚀 Flow Completo

### 1. Registrazione Merchant
**URL:** `/merchant/register`

**Campi Richiesti:**
- Nome Ristorante (es. "Pizzeria Rossi")
- Tipo Locale (Pizzeria, Bar, Ristorante, Trattoria, Altro)
- Email
- Password (min 6 caratteri)

**Azioni Automatiche:**
- ✅ Generazione slug automatica: "Pizzeria Rossi" → "pizzeria-rossi"
- ✅ Verifica disponibilità slug
- ✅ Creazione merchant con status "pending_approval"
- ✅ Salvataggio auth in localStorage
- ✅ **Redirect automatico a `/merchant/onboarding`**

---

### 2. Wizard Onboarding (4 Step)
**URL:** `/merchant/onboarding`

---

## 📋 Step del Wizard

### Step 1: Personalizzazione Brand 🎨

**Obiettivo:** Configurare l'identità visiva del locale

**Features:**
- **Color Picker Interactive**
  - Colore Primario (default: #FF6B35)
  - Colore Secondario (default: #F7931E)
  - Colore Accento (default: #C0392B)
  - Input manuale HEX code

- **Schemi Preimpostati (5)**
  1. Classico Italiano (Arancione/Rosso)
  2. Elegante Blu
  3. Verde Naturale
  4. Viola Moderno
  5. Arancione Energico

- **Logo Upload**
  - Input URL logo
  - Preview live

- **Live Preview Anteprima**
  - Header preview con gradiente colori
  - 3 pulsanti (Primario, Secondario, Accento)
  - Card preview prodotto
  - Aggiornamento real-time

**Validazione:** Nessuna (step sempre valido)

**Dati Salvati:**
```javascript
{
  brandColors: {
    primary: '#FF6B35',
    secondary: '#F7931E',
    accent: '#C0392B'
  },
  logo: 'https://...'
}
```

---

### Step 2: Informazioni Locale 📍

**Obiettivo:** Configurare indirizzo e contatti

**Features:**
- **Indirizzo Completo**
  - Via (required)
  - Città
  - CAP
  - Phone (required)

- **Orari di Apertura (Opzionale)**
  - Preview primi 3 giorni settimana
  - Time picker per apertura/chiusura
  - Configurazione completa disponibile in Settings

- **Anteprima Mappa**
  - Visualizzazione indirizzo inserito
  - Placeholder mappa geografica

**Validazione:** Indirizzo e Telefono obbligatori

**Dati Salvati:**
```javascript
{
  location: {
    address: 'Via Roma 123',
    city: 'Milano',
    zipCode: '20100',
    phone: '+39 02 1234567',
    openingHours: {}
  }
}
```

---

### Step 3: Piano Subscription 💳

**Obiettivo:** Scegliere il piano più adatto

**Piani Disponibili:**

**1. Starter - €29/mese**
- 1 Location
- Fino a 10 Tavoli
- Menu Digitale Illimitato
- QR Codes Personalizzati
- Gestione Ordini Base
- Analytics Base
- Supporto Email

**2. Business - €79/mese (MOST POPULAR) 🔥**
- 3 Locations
- Fino a 50 Tavoli
- Menu Digitale Illimitato
- QR Codes Personalizzati
- Gestione Ordini Avanzata
- Analytics Avanzate
- Dashboard Personalizzata
- Supporto Prioritario
- Branding Personalizzato
- Integrazione WhatsApp

**3. Enterprise - Custom 👑**
- Locations Illimitate
- Tavoli Illimitati
- Multi-Brand Management
- API Access Completo
- White Label
- Account Manager Dedicato
- Formazione Personalizzata
- SLA 99.9% Uptime
- Backup Giornalieri
- Custom Integrations

**Features UI:**
- Card interattive con hover effect
- Badge "Most Popular" su Business
- Gradient colors per piano
- Feature list completa con check icons
- Trust indicators:
  - ✨ 14 Giorni Gratis
  - 📈 Upgrade Facile
  - ⭐ Cancella Quando Vuoi

**Validazione:** Piano sempre selezionato (default: Business)

**Dati Salvati:**
```javascript
{
  subscription: {
    plan: 'business',
    price: 79
  }
}
```

---

### Step 4: Menu Rapido 🍕

**Obiettivo:** Creare i primi piatti del menu

**Features:**

**1. Quick Add - Piatti Popolari Predefiniti**
- Margherita (€8.50) - Pizza
- Carbonara (€12.00) - Pasta
- Bruschetta (€6.50) - Antipasti
- Tiramisù (€6.00) - Dolci

Click per aggiungere istantaneamente al menu

**2. Form Piatto Personalizzato**
- Nome Piatto (required)
- Descrizione
- Categoria (dropdown: Pizza, Pasta, Antipasti, Secondi, Contorni, Dolci, Bevande)
- Prezzo (€, required)
- URL Immagine (opzionale)

**3. Visualizzazione Piatti Aggiunti**
- Lista animata con Framer Motion
- Card per ogni piatto con:
  - Nome e descrizione
  - Categoria badge
  - Prezzo
  - Bottone remove
- AnimatePresence per smooth add/remove

**Validazione:** Step opzionale, può essere saltato

**Dati Salvati:**
```javascript
{
  quickMenu: [
    {
      id: 1234567890,
      name: 'Margherita',
      description: 'Pomodoro, mozzarella, basilico',
      price: 8.50,
      category: 'Pizza',
      image: ''
    }
  ]
}
```

---

## 🎨 UI/UX Features

### Progress Bar Animata
- 4 step indicator circolari
- Check icon quando completato
- Animazione scale su step corrente
- Barra progresso tra step
- Titolo e descrizione per ogni step

### Navigation
- **Pulsante "Indietro"**
  - Disabled su Step 1
  - Torna allo step precedente

- **Pulsante "Continua"**
  - Validazione per step
  - Disabled se validazione fallisce
  - Step 4: diventa "Completa Setup"

- **Skip Option**
  - "Salta per ora, completa dopo" (Step 1-3)
  - Redirect diretto a `/merchant/dashboard`

### Animations
- Smooth transitions tra step (AnimatePresence)
- Initial/animate/exit animations
- Staggered entrance per elementi
- Hover effects su cards

---

## 💾 Salvataggio Dati

### Al Completamento Wizard

**Azione:** Click "Completa Setup" su Step 4

**Operazioni:**
```javascript
updateMerchant(merchantId, {
  brandColors: onboardingData.brandColors,
  logo: onboardingData.logo,
  contact: {
    address: onboardingData.location.address,
    city: onboardingData.location.city,
    zipCode: onboardingData.location.zipCode,
    phone: onboardingData.location.phone
  },
  settings: {
    openingHours: onboardingData.location.openingHours
  },
  subscription: onboardingData.subscription,
  status: 'active' // Cambia da 'pending_approval' a 'active'
});
```

**Redirect:** `/merchant/dashboard`

---

## 🔧 Technical Implementation

### File Struttura

```
src/
├── pages/
│   └── MerchantOnboardingPage.jsx  (Container wizard)
├── components/
    └── merchant/
        ├── BrandCustomizer.jsx     (Step 1)
        ├── LocationInfo.jsx        (Step 2)
        ├── SubscriptionSelector.jsx(Step 3)
        └── MenuQuickStart.jsx      (Step 4)
```

### State Management

**onboardingData State:**
```javascript
const [onboardingData, setOnboardingData] = useState({
  brandColors: { primary: '#FF6B35', secondary: '#F7931E', accent: '#C0392B' },
  logo: '',
  location: { address: '', city: '', zipCode: '', phone: '', openingHours: {} },
  subscription: { plan: 'business', price: 79 },
  quickMenu: []
});
```

**Update Handler:**
```javascript
const updateOnboardingData = (field, value) => {
  setOnboardingData(prev => ({ ...prev, [field]: value }));
};
```

**Validation Logic:**
```javascript
const canProceed = () => {
  switch (currentStep) {
    case 1: return true;
    case 2: return onboardingData.location.address && onboardingData.location.phone;
    case 3: return onboardingData.subscription.plan;
    case 4: return true;
    default: return true;
  }
};
```

---

## 📱 Responsive Design

### Mobile Optimization
- Stack layout su mobile
- Touch-friendly buttons
- Simplified color picker su mobile
- Grid adjustments per cards

### Breakpoints
- `sm:` (640px) - 2 col grid per quick dishes
- `md:` (768px) - Form layouts side-by-side
- `lg:` (1024px) - Full desktop layout con preview

---

## ✅ Testing Checklist

### Test Flow Completo
- [ ] Registrazione merchant → redirect a onboarding
- [ ] Step 1: Cambia colori → preview aggiornato
- [ ] Step 1: Applica preset → colori cambiano
- [ ] Step 2: Compila indirizzo → validazione ok
- [ ] Step 2: Manca campo required → bottone disabled
- [ ] Step 3: Seleziona piano → card highlighted
- [ ] Step 4: Quick add piatto → appare in lista
- [ ] Step 4: Aggiungi custom → form validation
- [ ] Step 4: Remove piatto → animation smooth
- [ ] Click "Completa Setup" → merchant aggiornato
- [ ] Redirect a dashboard → dati salvati

### Test Skip Flow
- [ ] Step 1: Click "Salta" → redirect dashboard
- [ ] Merchant creato ma senza dati onboarding

### Test Validazione
- [ ] Bottone "Continua" disabled quando validazione fallisce
- [ ] Bottone "Indietro" funziona correttamente
- [ ] Progress bar aggiornata correttamente

---

## 🚀 Benefits per Merchant

1. **Onboarding Guidato**
   - Riduce confusione iniziale
   - Setup in 5 minuti
   - Skip option per flessibilità

2. **Personalizzazione Immediata**
   - Brand identity dal giorno 1
   - Preview live delle modifiche
   - Schemi preimpostati per velocità

3. **Chiarezza Subscription**
   - Confronto piano trasparente
   - Feature list dettagliata
   - Trust indicators (14 giorni gratis)

4. **Quick Start Menu**
   - Piatti popolari predefiniti
   - Aggiunta rapida custom
   - Completabile dopo se necessario

---

## 📊 Metriche Successo

**KPI da Tracciare (Future):**
- Completion rate wizard (target: >80%)
- Average time per step
- Skip rate per step
- Piano più selezionato
- Drop-off rate per step

---

## 🎯 Conclusione

L'Onboarding Wizard trasforma il setup merchant da processo complesso a esperienza guidata e piacevole, aumentando il tasso di attivazione e riducendo il time-to-value per i nuovi utenti.

**Flow Completo:**
`Landing → Register → Wizard (4 step) → Dashboard Completo ✅`

---

*Documento generato il: 27 Dicembre 2025*
