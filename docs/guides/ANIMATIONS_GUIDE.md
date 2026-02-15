# 🎬 Animations & Microinteractions Guide

Complete documentation of all animations implemented in the Food Ordering App with exact parameters and technical specifications.

## 📋 Table of Contents
1. [General Settings](#general-settings)
2. [Implemented Animations](#implemented-animations)
3. [Usage Examples](#usage-examples)
4. [Components Reference](#components-reference)

---

## ⚙️ General Settings

### Timing Base
- **Micro animations**: 300–450ms
- **Shared/Hero transitions**: 450–600ms

### Easing Functions
```javascript
// Soft ease-out (preferred for most animations)
cubic-bezier(0.22, 1, 0.36, 1)

// Sharp ease-out (for hero transitions)
cubic-bezier(0.2, 0.8, 0.2, 1)

// Standard ease-out
easeOut
```

---

## 🎨 Implemented Animations

### 1️⃣ Staggered Entrance (Cascade)
**Location**: `src/utils/animations.js`

**Parameters**:
- `staggerChildren`: 0.08
- `duration`: 0.36s
- `initial`: `{opacity: 0, y: 12, scale: 0.98}`
- `animate`: `{opacity: 1, y: 0, scale: 1}`
- `ease`: `[0.22, 1, 0.36, 1]`

**Usage**:
```jsx
import { staggeredEntrance } from '../utils/animations'

<motion.div variants={staggeredEntrance.container} initial="initial" animate="animate">
  {items.map(item => (
    <motion.div key={item.id} variants={staggeredEntrance.child}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

**Used in**:
- HomePage food grid
- FoodCard components

---

### 2️⃣ Card Entrance (Fade + Scale)
**Location**: `src/utils/animations.js`

**Parameters**:
- `initial`: `{ opacity: 0, scale: 0.96 }`
- `animate`: `{ opacity: 1, scale: 1 }`
- `duration`: 0.36s
- `ease`: `cubic-bezier(0.22, 1, 0.36, 1)`

**Usage**:
```jsx
import { cardEntrance } from '../utils/animations'

<motion.div {...cardEntrance}>
  Card content
</motion.div>
```

**Used in**:
- Welcome section on HomePage
- Product cards
- Profile cards

---

### 3️⃣ Search Bar (Slide-down + Fade)
**Location**: `src/components/SearchBar.jsx`

**Parameters**:
- `initial`: `{ y: -18px, opacity: 0 }`
- `animate`: `{ y: 0, opacity: 1 }`
- `duration`: 0.34s
- `ease`: `easeOut`

**Additional**:
- Focus scale animation: `scale: 1.02` on focus

**Used in**:
- SearchBar component

---

### 4️⃣ Category Chip Select
**Location**: `src/components/CategoriesBar.jsx`

**Parameters**:
- Background color fade: `duration: 0.18s`
- Underline slide: `duration: 0.28s, ease: easeOut`
- Uses `layoutId` for smooth transitions

**Features**:
- Shared background animation with `layoutId="category-bg"`
- Underline indicator with `layoutId="category-underline"`
- Hover lift: `y: -4px`

**Used in**:
- CategoriesBar component

---

### 5️⃣ List Swap (Filter Change)
**Location**: `src/utils/animations.js`

**Parameters**:
- **Exit**: `{ opacity: 0, y: +8px }`, duration: 0.24s
- **Enter**: `{ opacity: 1, y: 0 }`, duration: 0.32s
- `staggerChildren`: 0.06s

**Usage**:
```jsx
<AnimatePresence mode="wait">
  <motion.div key={filter} exit={listSwap.exit}>
    {items.map(...)}
  </motion.div>
</AnimatePresence>
```

**Used in**:
- HomePage food grid (category filter)
- ProductDetailPage reviews (filter change)

---

### 6️⃣ Shared Element / Hero Image
**Location**: `src/utils/animations.js`

**Parameters**:
- `duration`: 0.50s
- `ease`: `cubic-bezier(0.2, 0.8, 0.2, 1)`
- Animates: `transform`, `scale`, `borderRadius`

**Implementation**:
Uses Framer Motion's `layoutId` for matched geometry transitions

**Used in**:
- Product card → Product detail page
- Category background transitions

---

### 7️⃣ Add-to-Cart Fly + Cart Badge Bounce
**Location**: `src/utils/animations.js`, `src/components/FlyingCartItem.jsx`

**Fly Animation Parameters**:
- `duration`: 0.45s
- `ease`: `cubic-bezier(0.22, 1, 0.36, 1)`
- Path: Curved bezier path from button to cart icon
- Scale sequence: `[1, 0.8, 0.3]`
- Opacity sequence: `[1, 1, 0]`

**Badge Bounce Parameters**:
- Scale keyframes: `[1, 1.18, 0.98, 1]`
- `duration`: 0.36s (360ms)
- Times: `[0, 0.33, 0.66, 1]`

**Components**:
- `FlyingCartItem.jsx`: Flying cart animation
- `Header.jsx`: Cart badge bounce

**Used in**:
- ProductDetailPage add to cart
- FoodCard add to cart
- Header cart badge

---

### 8️⃣ Favorite Heart (Fill + Pop)
**Location**: `src/components/AnimatedHeart.jsx`

**Parameters**:
- Scale sequence: `[1, 1.2, 1]`
- `duration`: 0.28s (280ms)
- Times: `[0, 0.5, 1]`
- `ease`: `easeOut`
- Fill color transition: `duration: 0.2s`

**Animation Sequence**:
1. Scale up from 1 → 1.2 (140ms)
2. Fill color changes (simultaneous)
3. Pop back to 1 (140ms)

**Used in**:
- ProductDetailPage favorite button
- FoodCard favorite icon

---

### 9️⃣ Bottom Sheet (Slide-up Spring)
**Location**: `src/components/BottomSheet.jsx`

**Spring Parameters**:
- `type`: 'spring'
- `damping`: 14
- `stiffness`: 140

**Alternative (non-spring)**:
- `duration`: 0.38s
- `ease`: `easeOut`

**Initial State**:
- `y`: 32px (24-40px range)
- `opacity`: 0

**Features**:
- Drag to dismiss
- Drag threshold: 100px or velocity > 500
- Drag elastic: 0.2
- Backdrop blur

**Used in**:
- BottomSheet component (reusable)
- Modal dialogs
- Filter panels

---

### 🔟 Hover Lift (Desktop)
**Location**: `src/utils/animations.js`

**Parameters**:
- `translateY`: -6px
- `scale`: 1.01
- `duration`: 0.18s

**Usage**:
```jsx
import { hoverLift } from '../utils/animations'

<motion.div {...hoverLift}>
  Content
</motion.div>
```

**Used in**:
- FoodCard
- Product cards
- Interactive buttons

---

### 1️⃣1️⃣ Skeleton Shimmer
**Location**: `src/components/SkeletonShimmer.jsx`

**Parameters**:
- `duration`: 1.4s
- `ease`: 'linear'
- `repeat`: Infinity
- `repeatType`: 'loop'

**Gradient**:
```css
from-transparent via-white/60 to-transparent
```

**Animation**:
- Translates from `-100%` to `200%` horizontally
- Creates shimmer effect

**Variants Available**:
- `card`: Full card skeleton
- `text`: Text line skeleton
- `title`: Title skeleton
- `circle`: Avatar/icon skeleton
- `button`: Button skeleton

**Components**:
- `SkeletonShimmer`: Base component
- `CardSkeleton`: Preset card layout
- `ListSkeleton`: Multiple card skeletons

---

## 🎯 Usage Examples

### Example 1: Staggered Grid
```jsx
import { staggeredEntrance } from '../utils/animations'

<motion.div
  variants={staggeredEntrance.container}
  initial="initial"
  animate="animate"
  className="grid grid-cols-3 gap-4"
>
  {items.map((item, index) => (
    <motion.div key={item.id} variants={staggeredEntrance.child}>
      <ProductCard product={item} />
    </motion.div>
  ))}
</motion.div>
```

### Example 2: Interactive Card with Multiple Animations
```jsx
import { cardEntrance, hoverLift } from '../utils/animations'

<motion.div
  {...cardEntrance}
  {...hoverLift}
  whileTap={{ scale: 0.95 }}
  className="card"
>
  Card content
</motion.div>
```

### Example 3: Filter Change with List Swap
```jsx
import { listSwap } from '../utils/animations'

<AnimatePresence mode="wait">
  <motion.div
    key={selectedCategory}
    exit={listSwap.exit}
    variants={listSwap.enter}
    initial="initial"
    animate="animate"
  >
    {filteredItems.map(...)}
  </motion.div>
</AnimatePresence>
```

### Example 4: Loading States
```jsx
import { ListSkeleton } from '../components/SkeletonShimmer'

{isLoading ? (
  <ListSkeleton count={6} />
) : (
  <ProductGrid products={products} />
)}
```

---

## 📦 Components Reference

### Animation Utilities
**File**: `src/utils/animations.js`
- All animation configuration objects
- Easing functions
- Helper functions

### Animated Components
1. **SkeletonShimmer** - Loading states
2. **FlyingCartItem** - Cart fly animation
3. **AnimatedHeart** - Favorite heart animation
4. **BottomSheet** - Modal bottom sheet

### Enhanced Components with Animations
1. **FoodCard** - Stagger, hover, card entrance
2. **SearchBar** - Slide-down, focus scale
3. **CategoriesBar** - Chip select, layoutId transitions
4. **Header** - Cart badge bounce
5. **HomePage** - List swap, staggered grid
6. **ProductDetailPage** - Full animation suite

---

## 🎬 Animation Best Practices

### Performance
- Use `will-change-transform` for animated elements
- Prefer `transform` and `opacity` for animations
- Use `layoutId` for shared element transitions
- Avoid animating `width`, `height`, `top`, `left`

### Accessibility
- Respect `prefers-reduced-motion`
- Provide instant feedback for critical actions
- Don't block user interaction during animations

### Mobile Optimization
- Reduce animation duration on mobile (20-30%)
- Use hardware acceleration
- Test on actual devices
- Consider battery impact

---

## 📊 Animation Summary

| Animation | Duration | Easing | Components | Status |
|-----------|----------|--------|------------|--------|
| Staggered Entrance | 360ms | Soft ease-out | FoodCard, Grid | ✅ |
| Card Entrance | 360ms | Soft ease-out | Cards, Sections | ✅ |
| Search Slide | 340ms | Ease-out | SearchBar | ✅ |
| Category Chip | 180-280ms | Ease-out | CategoriesBar | ✅ |
| List Swap | 240-320ms | Default | HomePage | ✅ |
| Hero Transition | 500ms | Sharp ease-out | Product Detail | ✅ |
| Cart Fly | 450ms | Soft ease-out | Add to Cart | ✅ |
| Badge Bounce | 360ms | Keyframes | Cart Badge | ✅ |
| Heart Pop | 280ms | Ease-out | Favorites | ✅ |
| Bottom Sheet | 380ms / Spring | Spring/Ease-out | Modals | ✅ |
| Hover Lift | 180ms | Default | Cards | ✅ |
| Skeleton Shimmer | 1400ms | Linear | Loading | ✅ |

**Total Animations Implemented**: 12 ✅

---

## 🚀 Next Steps

### Potential Enhancements
1. **Parallax scrolling** on hero images
2. **Pull-to-refresh** animation
3. **Swipe gestures** for navigation
4. **Loading progress** animations
5. **Success/Error toast** animations
6. **Page transitions** with route changes

### Advanced Patterns
1. **Orchestrated animations** - Multiple sequential animations
2. **Physics-based interactions** - Spring dynamics
3. **Gesture-based animations** - Pan, drag, rotate
4. **SVG path animations** - For icons and illustrations
5. **3D transforms** - For card flips and reveals

---

## 📖 Resources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Animation Easing Functions](https://easings.net/)
- [Material Design Motion](https://material.io/design/motion)

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Build Status**: ✅ Production Ready
