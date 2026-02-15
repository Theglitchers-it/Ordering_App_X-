# 🚀 Guida Deploy - Piattaforma SaaS Multi-Tenant

## 📋 Pre-Deploy Checklist

### ✅ Verifica Ambiente Locale

Prima del deploy, assicurati che tutto funzioni correttamente:

```bash
# 1. Verifica che il server si avvii senza errori
npm run dev

# 2. Testa il build production
npm run build

# 3. Verifica che non ci siano errori TypeScript/ESLint
npm run lint  # (se configurato)
```

### ✅ Testing Funzionalità Core

- [ ] Landing page carica correttamente (`/`)
- [ ] Registrazione merchant funziona (`/merchant/register`)
- [ ] Wizard onboarding completo (4 step)
- [ ] Dashboard merchant accessibile
- [ ] QR code ordering funziona (`/demo?merchant=slug&table=5`)
- [ ] Super admin dashboard funziona (`/superadmin`)

---

## 🌐 Deploy su Vercel (Consigliato)

### Opzione 1: Deploy via GitHub (Consigliato)

**Step 1: Push su GitHub**

```bash
# Inizializza git (se non già fatto)
git init
git add .
git commit -m "Initial commit - SaaS Platform 100% complete"

# Crea repository su GitHub e push
git remote add origin https://github.com/tuousername/ordering-app-saas.git
git branch -M main
git push -u origin main
```

**Step 2: Deploy su Vercel**

1. Vai su [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Importa il repository GitHub
4. Configura:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. Click **"Deploy"**

### Opzione 2: Deploy via Vercel CLI

```bash
# Installa Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy in production
vercel --prod
```

---

## 🔧 Configurazione Environment Variables

### Variables Necessarie (Future)

Quando integrerai un backend, aggiungi queste variabili:

```env
# Vercel Dashboard → Settings → Environment Variables

# API
VITE_API_URL=https://api.tuodominio.com

# Supabase (se usi Supabase)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# Stripe (se usi Stripe)
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx

# Analytics (opzionale)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

**Per ora:** Non servono environment variables, tutto usa localStorage.

---

## 🌍 Configurazione Custom Domain

### Dominio Principale

**Esempio:** `tuosaas.com`

1. **Vercel Dashboard** → Tuo Progetto → **Settings** → **Domains**
2. Aggiungi dominio: `tuosaas.com` e `www.tuosaas.com`
3. Configura DNS presso il tuo provider:

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### Subdomain per Merchants (Futuro)

**Obiettivo:** `pizzeria-rossi.tuosaas.com`

**Opzione A: Wildcard Subdomain (Vercel Pro)**

1. Aggiungi `*.tuosaas.com` in Vercel
2. Configura DNS:
```
Type    Name    Value
CNAME   *       cname.vercel-dns.com
```

3. Implementa routing nel codice:
```javascript
// src/utils/tenantUtils.js
export const detectMerchantFromSubdomain = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  // pizzeria-rossi.tuosaas.com → "pizzeria-rossi"
  if (parts.length >= 3 && hostname.includes('tuosaas.com')) {
    return parts[0]; // slug
  }
  return null;
};
```

**Opzione B: Custom Domains per Merchant (Enterprise)**

Permetti ai merchant di usare il loro dominio: `menu.pizzeriarossi.it`

1. Merchant aggiunge CNAME nel suo DNS:
```
CNAME   menu    cname.vercel-dns.com
```

2. Tu approvi il dominio in Vercel Dashboard

---

## 📊 Configurazione Analytics

### Google Analytics 4

```javascript
// src/main.jsx o index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Vercel Analytics (Built-in)

```bash
npm install @vercel/analytics

# src/main.jsx
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

---

## 🔒 Security Best Practices

### Headers Security (vercel.json)

Crea `vercel.json` nella root:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend.com/api/:path*"
    }
  ]
}
```

### HTTPS

- ✅ Vercel fornisce HTTPS automatico (Let's Encrypt)
- ✅ Redirect HTTP → HTTPS automatico

---

## 🎯 Routing Multi-Tenant su Vercel

### Configurazione Rewrites

**vercel.json:**

```json
{
  "rewrites": [
    {
      "source": "/:merchantSlug",
      "destination": "/demo?merchant=:merchantSlug"
    },
    {
      "source": "/:merchantSlug/:path*",
      "destination": "/demo/:path*?merchant=:merchantSlug"
    }
  ]
}
```

Questo permette:
- `tuosaas.com/pizzeria-rossi` → `/demo?merchant=pizzeria-rossi`
- `tuosaas.com/pizzeria-rossi/cart` → `/demo/cart?merchant=pizzeria-rossi`

---

## 📱 Performance Optimization

### Lazy Loading Routes

```javascript
// src/App.jsx
import { lazy, Suspense } from 'react';

const MerchantDashboard = lazy(() => import('./pages/merchant/MerchantDashboardPage'));
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/SuperAdminDashboardPage'));

<Suspense fallback={<div>Loading...</div>}>
  <Routes>
    <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
    <Route path="/superadmin" element={<SuperAdminDashboard />} />
  </Routes>
</Suspense>
```

### Image Optimization

```bash
# Ottimizza immagini con imagemin
npm install --save-dev vite-plugin-imagemin

# vite.config.js
import viteImagemin from 'vite-plugin-imagemin';

export default {
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      svgo: { plugins: [{ removeViewBox: false }] }
    })
  ]
};
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Opzionale)

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test  # se hai test

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📊 Monitoring & Logging

### Vercel Dashboard

- **Analytics:** Pageviews, top pages, real user metrics
- **Logs:** Real-time function logs
- **Speed Insights:** Core Web Vitals

### Sentry (Error Tracking)

```bash
npm install @sentry/react @sentry/vite-plugin

# src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xxx@xxx.ingest.sentry.io/xxx",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

---

## 🎬 Post-Deploy Checklist

### Immediate (Giorno 1)

- [ ] Verifica che tutte le routes funzionino
- [ ] Testa registrazione merchant end-to-end
- [ ] Verifica QR code scanning
- [ ] Controlla analytics setup
- [ ] Configura error tracking (Sentry)

### Week 1

- [ ] Monitora performance (Lighthouse, Vercel Insights)
- [ ] Raccogli feedback da beta testers
- [ ] Fix bug critici
- [ ] Ottimizza Core Web Vitals

### Week 2-4

- [ ] Implementa backend (Supabase/Firebase)
- [ ] Integra payment (Stripe)
- [ ] Setup email notifications (SendGrid/Resend)
- [ ] Implementa real-time updates (WebSockets)

---

## 🔗 URLs Finali Esempio

**Production:**
- Landing: `https://tuosaas.com`
- Register: `https://tuosaas.com/merchant/register`
- Onboarding: `https://tuosaas.com/merchant/onboarding`
- Merchant Dashboard: `https://tuosaas.com/merchant/dashboard`
- Super Admin: `https://tuosaas.com/superadmin`

**Customer Menu (Esempi):**
- `https://tuosaas.com/demo?merchant=pizzeria-rossi&table=5`
- Future: `https://pizzeria-rossi.tuosaas.com?table=5`

---

## 📞 Support & Resources

**Vercel Docs:**
- [Deploy Vite](https://vercel.com/docs/frameworks/vite)
- [Custom Domains](https://vercel.com/docs/concepts/projects/domains)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

**Community:**
- [Vercel Discord](https://vercel.com/discord)
- [GitHub Discussions](https://github.com/vercel/vercel/discussions)

---

## 🎯 Conclusione

Il tuo progetto è **production-ready**! Segui questa guida step-by-step per un deploy pulito e professionale.

**Next:** Dopo il deploy, inizia il beta testing con 2-3 merchant reali per validare il prodotto.

**Good luck! 🚀**

---

*Documento generato il: 27 Dicembre 2025*
*Versione: 1.0.0*
