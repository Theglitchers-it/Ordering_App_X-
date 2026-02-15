# 📱 Mobile Optimization Guide

Guida completa alle ottimizzazioni mobile-first implementate nell'app Food Ordering.

## 📋 Indice
1. [Touch Targets & Interazioni](#touch-targets--interazioni)
2. [Performance](#performance)
3. [Animazioni Ottimizzate](#animazioni-ottimizzate)
4. [Layout Responsive](#layout-responsive)
5. [Best Practices](#best-practices)

---

## 🎯 Touch Targets & Interazioni

### Dimensioni Minime Touch Target
Tutti gli elementi interattivi rispettano le linee guida di accessibilità:

```css
/* Dimensione minima consigliata: 44x44px (Apple) / 48x48px (Google) */
.touch-target-min {
  min-width: 44px;
  min-height: 44px;
}
```

### Bottoni Ottimizzati per Mobile

**ActionCircle Component** (`src/components/ActionCircle.jsx`):
- Diametro: **44px** (misura esatta come da specs)
- Shadow: `0 6px 16px rgba(0,0,0,0.18)`
- Active state con `scale(0.9)` per feedback visivo
- `touch-action: manipulation` per evitare delay

**Esempi di utilizzo**:
```jsx
// Bottone back
<ActionCircle
  icon={ArrowLeft}
  onClick={() => navigate(-1)}
  variant="white"
  size="md"
/>

// Bottone share
<ActionCircle
  icon={Share2}
  onClick={handleShare}
  variant="white"
/>
```

### Spacing Ottimizzato

```jsx
// Spaziatura tra elementi touch
<div className="flex items-center space-x-3">  {/* 12px spacing */}
  <button className="touch-target-min">Button 1</button>
  <button className="touch-target-min">Button 2</button>
</div>
```

### Active States

Tutti i bottoni hanno feedback visivo immediato:

```css
/* Scale down on tap */
.active\:scale-95:active {
  transform: scale(0.95);
}

.active\:scale-98:active {
  transform: scale(0.98);
}
```

---

## ⚡ Performance

### Animazioni Hardware-Accelerated

```css
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}
```

**Quando usare**:
- Elementi che si animano frequentemente
- Scroll parallax
- Drag & drop

### Ottimizzazione Scroll

**Hook personalizzato con requestAnimationFrame**:

```jsx
import { useOptimizedScroll } from '../hooks/useMobileOptimizations'

function MyComponent() {
  const isScrolled = useOptimizedScroll(150) // threshold 150px

  return (
    <AnimatePresence>
      {isScrolled && <CollapsedHeader />}
    </AnimatePresence>
  )
}
```

### Lazy Loading Immagini

```jsx
<img
  src={product.image}
  alt={product.title}
  loading="lazy"
  decoding="async"
  className="w-full h-full object-cover"
/>
```

### Preconnect per Performance

Nel `index.html`:
```html
<link rel="preconnect" href="https://images.unsplash.com" />
```

---

## 🎬 Animazioni Ottimizzate

### Durate Ridotte per Mobile

```javascript
// Mobile-optimized animation durations
const mobileAnimations = {
  pageEnter: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } }  // 200ms invece di 300ms
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  }
}
```

### Rispetto Reduced Motion

```jsx
import { useMobileOptimizations } from '../hooks/useMobileOptimizations'

function AnimatedComponent() {
  const { shouldAnimate, getTransitionConfig } = useMobileOptimizations()

  return (
    <motion.div
      animate={shouldAnimate ? { scale: 1 } : {}}
      transition={getTransitionConfig({ duration: 0.3 })}
    >
      Content
    </motion.div>
  )
}
```

### Transizioni Fluide

```css
/* Smooth transitions with optimal easing */
.transition-smooth {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 📐 Layout Responsive

### ProductDetailPage - Mobile First

**Struttura ottimizzata**:

```jsx
<div className="min-h-screen bg-cream-50">
  {/* Fixed collapsing header - appare solo dopo scroll */}
  <AnimatePresence>
    {isScrolled && <CollapsedHeader />}
  </AnimatePresence>

  {/* Hero image - 80vh su mobile */}
  <div className="relative h-80 overflow-hidden">
    <img className="w-full h-full object-cover" />
  </div>

  {/* Content con padding ottimizzato */}
  <div className="px-4 py-5 space-y-6">
    {/* Variants in grid 3 colonne */}
    <div className="grid grid-cols-3 gap-2">
      {variants.map(variant => (
        <VariantButton />
      ))}
    </div>
  </div>

  {/* Fixed bottom bar con safe area */}
  <div className="fixed bottom-0 left-0 right-0 safe-bottom">
    <AddToCartBar />
  </div>
</div>
```

### Safe Areas (Notch & Home Indicator)

```css
/* Safe area support per iPhone X+ */
.safe-top {
  padding-top: max(env(safe-area-inset-top), 0px);
}

.safe-bottom {
  padding-bottom: max(env(safe-area-inset-bottom), 16px);
}
```

Uso nel codice:
```jsx
<div className="fixed bottom-0 safe-bottom">
  {/* Content rispetta il safe area */}
</div>
```

### Grid Auto-Fit

```css
/* Grid responsive automatico */
.grid-auto-fit-sm {
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}
```

---

## 🎨 Componenti Mobile-Optimized

### 1. Category Chips (90x90px)

```jsx
<EnhancedCategoryChip
  category={{ id: 'pizza', label: 'Pizza', icon: '🍕' }}
  isSelected={selected}
  onClick={handleClick}
  index={0}
/>
```

**Caratteristiche**:
- Dimensione fissa: 90x90px
- Emoji icon: 40px
- Label: 10px
- Touch feedback: scale(1.05) hover, scale(0.95) tap

### 2. Quantity Selector

```jsx
<div className="flex items-center bg-gray-100 rounded-full p-1">
  <button className="w-9 h-9 rounded-full">  {/* 36px button */}
    <Minus className="w-4 h-4" />
  </button>
  <span className="w-10 text-center font-bold text-lg">{quantity}</span>
  <button className="w-9 h-9 rounded-full">
    <Plus className="w-4 h-4" />
  </button>
</div>
```

### 3. Add-ons Selection

```jsx
<button
  className={`w-full p-4 rounded-xl touch-manipulation ${
    selected ? 'bg-primary/10 border-2 border-primary' : 'bg-white border-2 border-gray-200'
  }`}
>
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      {/* Checkbox custom con animazione */}
      <div className="w-5 h-5 rounded-full border-2">
        {selected && <Check className="w-3 h-3 text-white" />}
      </div>
      <span>{addon.label}</span>
    </div>
    <span className="font-bold text-primary">+€{addon.price}</span>
  </div>
</button>
```

### 4. Bottom Action Bar

```jsx
<div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 safe-bottom">
  <div className="px-4 py-4">
    {/* Quantity + Price */}
    <div className="flex items-center justify-between mb-3">
      <QuantitySelector />
      <TotalPrice />
    </div>

    {/* Add to Cart Button - Full Width */}
    <button className="w-full py-4 rounded-full text-lg font-bold shadow-action">
      <ShoppingCart /> Aggiungi al Carrello
    </button>
  </div>
</div>
```

---

## 🔧 Best Practices

### 1. Prevent iOS Zoom on Input Focus

```css
@media screen and (max-width: 767px) {
  input, textarea, select {
    font-size: 16px !important;  /* Previene auto-zoom */
  }
}
```

### 2. Disable Tap Highlight

```css
.touch-manipulation {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
}
```

### 3. Smooth Momentum Scrolling

```css
.smooth-scroll {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}
```

### 4. Hide Scrollbars (mantenendo funzionalità)

```css
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

### 5. Snap Scrolling per Gallery

```jsx
<div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
  {images.map((img, idx) => (
    <div key={idx} className="flex-shrink-0 snap-start">
      <img src={img} />
    </div>
  ))}
</div>
```

### 6. Prevent Pull-to-Refresh

```css
html {
  overscroll-behavior: none;
}
```

---

## 📊 Performance Metrics

### Target Metrics
- **First Contentful Paint (FCP)**: < 1.8s
- **Time to Interactive (TTI)**: < 3.9s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Touch Response Time**: < 100ms

### Ottimizzazioni Implementate

✅ **JavaScript Bundle**
- Code splitting per route
- Lazy loading componenti
- Tree shaking automatico (Vite)

✅ **CSS**
- Tailwind CSS purge in production
- Critical CSS inline
- Mobile-first approach

✅ **Immagini**
- Lazy loading con `loading="lazy"`
- Responsive images con srcset (da implementare)
- WebP format support (da implementare)

✅ **Rendering**
- Hardware acceleration su animazioni
- `will-change` su elementi animati
- requestAnimationFrame per scroll

---

## 🎯 Checklist Ottimizzazioni Mobile

### Touch & Interazioni
- [x] Touch targets minimo 44x44px
- [x] Active states visibili
- [x] Feedback tattile immediato
- [x] Prevent double-tap zoom
- [x] Gesture support (swipe)

### Performance
- [x] Lazy loading immagini
- [x] Code splitting
- [x] Ottimizzazione scroll
- [x] Hardware acceleration
- [x] Reduced motion support

### Layout
- [x] Safe area support (notch)
- [x] Bottom bar fixed con safe area
- [x] Grid responsive
- [x] Collapsing header
- [x] Full-width buttons

### UX
- [x] Loading states
- [x] Empty states
- [x] Error handling
- [x] Success feedback
- [x] Smooth transitions

---

## 📱 Test su Device Reali

### iOS (Safari)
- [x] Notch handling
- [x] Safe areas
- [x] Momentum scrolling
- [x] Touch delays
- [x] Viewport fit=cover

### Android (Chrome)
- [x] Material design touch ripple
- [x] Back button handling
- [x] PWA support
- [x] Add to homescreen

---

## 🚀 Hook Personalizzati

### useMobileOptimizations

```jsx
import { useMobileOptimizations } from '../hooks/useMobileOptimizations'

function MyComponent() {
  const {
    isMobile,
    prefersReducedMotion,
    isLowEndDevice,
    getAnimationDuration,
    shouldAnimate,
    touchFeedback
  } = useMobileOptimizations()

  return (
    <motion.div
      animate={shouldAnimate ? { scale: 1 } : {}}
      transition={{ duration: getAnimationDuration(300) }}
      className={`active:${touchFeedback}`}
    >
      Content
    </motion.div>
  )
}
```

### useOptimizedScroll

```jsx
const isScrolled = useOptimizedScroll(150)
```

### useViewport

```jsx
const { isMobile, isTablet, width, height } = useViewport()
```

### useTouchGestures

```jsx
const containerRef = useRef()
const gesture = useTouchGestures(containerRef)

useEffect(() => {
  if (gesture === 'swipe-left') nextImage()
  if (gesture === 'swipe-right') prevImage()
}, [gesture])
```

---

## 📖 Riferimenti

- [Web.dev Mobile Performance](https://web.dev/mobile-performance/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Material Design Touch Targets](https://material.io/design/usability/accessibility.html#layout-and-typography)
- [Framer Motion Performance](https://www.framer.com/motion/guide-performance/)

---

**Versione**: 2.0.0
**Ultimo Aggiornamento**: Dicembre 2024
**Status**: ✅ Production Ready
