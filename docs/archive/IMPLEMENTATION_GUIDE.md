# 🎨 Implementation Guide - Enhanced Food Ordering App

Complete implementation of the advanced design system with Framer Motion animations, enhanced data models, and modern UI components.

## 📋 Table of Contents
1. [Design System](#design-system)
2. [Data Model](#data-model)
3. [Components](#components)
4. [Animations](#animations)
5. [Usage Examples](#usage-examples)

---

## 🎨 Design System

### Color Palette
Based on the screenshot specifications:

```javascript
// Tailwind config extensions
colors: {
  primary: '#FF6B35',
  secondary: '#F7931E',
  cream: {
    50: '#FFFEF9',
    100: '#FFF8E6',  // Hero background
    200: '#FFF1CC',
    300: '#FFE9B3',
  },
  placeholder: '#9A9A9A',
  strongBlack: '#000000',
}
```

### Typography
```javascript
fontSize: {
  'hero': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],  // 40px
  'greeting': ['1.125rem', { lineHeight: '1.5', fontWeight: '400' }], // 18px
}
```

### Border Radius
```javascript
borderRadius: {
  'card': '1rem',      // 16px
  'card-lg': '1.25rem', // 20px
}
```

### Shadows
```javascript
boxShadow: {
  'action': '0 6px 16px rgba(0, 0, 0, 0.18)',
  'card': '0 4px 12px rgba(0, 0, 0, 0.08)',
}
```

---

## 📊 Data Model

### Complete Food Item Structure

```javascript
{
  id: 1,
  title: 'Margherita Pizza',
  author: 'Chef Giuseppe',
  rating: 4.8,
  deliveryTime: 25, // minutes
  price: 12.99,
  currency: '€',
  category: 'pizza',
  image: 'url',
  images: ['url1', 'url2'], // Gallery
  description: 'Long description...',
  ingredients: ['ingredient1', 'ingredient2'],
  allergens: ['Glutine', 'Latticini'],
  nutritionalInfo: {
    calories: 266,
    protein: 11,
    carbs: 33,
    fat: 10,
    fiber: 2
  },
  variants: [
    { id: 'v1-small', label: 'Piccola (25cm)', price: 9.99 },
    { id: 'v1-medium', label: 'Media (30cm)', price: 12.99 },
    { id: 'v1-large', label: 'Grande (35cm)', price: 15.99 }
  ],
  addOns: [
    { id: 'a1-mozz', label: 'Mozzarella extra', price: 2.50 },
    { id: 'a1-basil', label: 'Basilico extra', price: 1.00 }
  ],
  available: true,
  prepTime: 15,
  chef: 'Chef Giuseppe Rossi',
  restaurant: 'Pizzeria Napoletana'
}
```

### Categories with Emoji Icons

```javascript
const categories = [
  { id: 'all', label: 'Tutte', icon: '🍽️' },
  { id: 'pizza', label: 'Pizza', icon: '🍕' },
  { id: 'pasta', label: 'Pasta', icon: '🍝' },
  { id: 'burgers', label: 'Burgers', icon: '🍔' },
  { id: 'desserts', label: 'Dolci', icon: '🍰' },
  { id: 'drinks', label: 'Bevande', icon: '🥤' },
  { id: 'salads', label: 'Insalate', icon: '🥗' }
]
```

---

## 🎯 Components

### 1. EnhancedCategoryChip
**Location**: `src/components/EnhancedCategoryChip.jsx`

Category chip with exact specifications:
- Size: 90x90px (mobile)
- Icon on top (emoji)
- Label below
- Animated background on selection
- Underline indicator

**Usage**:
```jsx
import EnhancedCategoryChip from '../components/EnhancedCategoryChip'

<EnhancedCategoryChip
  category={{ id: 'pizza', label: 'Pizza', icon: '🍕' }}
  isSelected={selectedCategory === 'pizza'}
  onClick={() => setSelectedCategory('pizza')}
  index={0}
/>
```

### 2. ActionCircle
**Location**: `src/components/ActionCircle.jsx`

Circular action button with specifications:
- Diameter: 44px
- Shadow: 0 6px 16px rgba(0,0,0,0.18)
- Hover animations
- Multiple variants (primary, white, light)

**Usage**:
```jsx
import ActionCircle from '../components/ActionCircle'
import { ArrowRight } from 'lucide-react'

<ActionCircle
  icon={ArrowRight}
  onClick={handleAction}
  variant="primary"
  size="md"
/>
```

### 3. Enhanced Data Provider
**Location**: `src/data/foodData.js`

Centralized data with helper functions:
```javascript
import { categories, foodItems, getFoodById, getFoodsByCategory } from '../data/foodData'

// Get single food item
const food = getFoodById(1)

// Get foods by category
const pizzas = getFoodsByCategory('pizza')

// Get related items
const related = getRelatedFoods(currentId, 'pizza', 4)
```

---

## 🎬 Advanced Animations

### 1. Container & Item Pattern
```jsx
import { container, item } from '../utils/animations'

<motion.div variants={container} initial="hidden" animate="show">
  {items.map(item => (
    <motion.div key={item.id} variants={item}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### 2. Flying Cart Animation
```jsx
import { flyToCartAnimation } from '../utils/animations'

const startRect = buttonRef.current.getBoundingClientRect()
const endRect = cartRef.current.getBoundingClientRect()

<motion.div {...flyToCartAnimation(startRect, endRect)}>
  <img src={product.image} />
</motion.div>
```

### 3. Page Transitions
```jsx
import { pageTransition } from '../utils/animations'
import { AnimatePresence } from 'framer-motion'

<AnimatePresence mode="wait">
  <motion.div {...pageTransition} key={location.pathname}>
    <Page />
  </motion.div>
</AnimatePresence>
```

### 4. Modal Slide Up
```jsx
import { slideUpModal, backdrop } from '../utils/animations'

<AnimatePresence>
  {isOpen && (
    <>
      <motion.div {...backdrop} className="fixed inset-0 bg-black/50" />
      <motion.div {...slideUpModal} className="fixed bottom-0 left-0 right-0">
        <ModalContent />
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### 5. Scale Pop (Success)
```jsx
import { scalePop } from '../utils/animations'

<motion.div {...scalePop}>
  <CheckCircle className="w-16 h-16 text-green-500" />
</motion.div>
```

---

## 📱 Usage Examples

### Complete HomePage Implementation

```jsx
import { useState, useMemo } from 'react'
import { categories, foodItems } from '../data/foodData'
import EnhancedCategoryChip from '../components/EnhancedCategoryChip'
import { container, item } from '../utils/animations'

function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredFoods = useMemo(() => {
    if (selectedCategory === 'all') return foodItems
    return foodItems.filter(food => food.category === selectedCategory)
  }, [selectedCategory])

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Hero Section */}
      <div className="space-y-2 p-6">
        <p className="text-greeting text-gray-600">Ciao, Utente</p>
        <h1 className="text-hero text-strongBlack">Hai fame oggi?</h1>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-3 gap-3 p-6">
        {categories.map((cat, idx) => (
          <EnhancedCategoryChip
            key={cat.id}
            category={cat}
            isSelected={selectedCategory === cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            index={idx}
          />
        ))}
      </div>

      {/* Food Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 p-6"
      >
        {filteredFoods.map((food) => (
          <motion.div key={food.id} variants={item}>
            <FoodCard food={food} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
```

### Product Detail with Variants & Add-ons

```jsx
import { useState } from 'react'
import { getFoodById } from '../data/foodData'

function ProductDetailPage({ id }) {
  const food = getFoodById(id)
  const [selectedVariant, setSelectedVariant] = useState(food.variants[0].id)
  const [selectedAddOns, setSelectedAddOns] = useState([])

  const calculateTotal = () => {
    const variantPrice = food.variants.find(v => v.id === selectedVariant)?.price || 0
    const addOnsPrice = selectedAddOns.reduce((sum, addonId) => {
      const addon = food.addOns.find(a => a.id === addonId)
      return sum + (addon?.price || 0)
    }, 0)
    return variantPrice + addOnsPrice
  }

  return (
    <div>
      {/* Variants */}
      <div className="space-y-2">
        <h3 className="font-bold">Scegli la dimensione:</h3>
        {food.variants.map(variant => (
          <button
            key={variant.id}
            onClick={() => setSelectedVariant(variant.id)}
            className={`w-full p-3 rounded-card ${
              selectedVariant === variant.id ? 'bg-primary text-white' : 'bg-white'
            }`}
          >
            {variant.label} - €{variant.price}
          </button>
        ))}
      </div>

      {/* Add-ons */}
      <div className="space-y-2 mt-4">
        <h3 className="font-bold">Aggiungi extra:</h3>
        {food.addOns.map(addon => (
          <label key={addon.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedAddOns.includes(addon.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedAddOns([...selectedAddOns, addon.id])
                } else {
                  setSelectedAddOns(selectedAddOns.filter(id => id !== addon.id))
                }
              }}
            />
            <span>{addon.label} (+€{addon.price})</span>
          </label>
        ))}
      </div>

      {/* Total */}
      <div className="mt-6 p-4 bg-cream-100 rounded-card">
        <div className="flex justify-between items-center">
          <span className="font-bold">Totale:</span>
          <span className="text-2xl font-bold text-primary">
            €{calculateTotal().toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
```

---

## 🎨 Design Specifications Summary

### Mobile Measurements
- **Category chip**: 90x90px
- **Action circle**: 44px diameter
- **Card radius**: 16-20px
- **Hero headline**: ~36-40px
- **Greeting text**: ~18px

### Colors
- **Hero background**: #FFF8E6 (cream-100)
- **Headline**: #000000 (strongBlack)
- **Placeholder**: #9A9A9A
- **Card background**: #FFFFFF
- **Primary gradient**: #FF6B35 → #F7931E

### Shadows
- **Action shadow**: 0 6px 16px rgba(0,0,0,0.18)
- **Card shadow**: 0 4px 12px rgba(0,0,0,0.08)

---

## 🚀 New Features Implemented

### 1. Enhanced Data Model ✅
- Complete food items with variants and add-ons
- Nutritional information
- Multiple images for gallery
- Chef and restaurant info
- Ingredients and allergens

### 2. Design System ✅
- Custom color palette (cream background)
- Typography scale (hero, greeting)
- Shadow system (action, card)
- Border radius system

### 3. Advanced Animations ✅
- Container/item stagger pattern
- Flying cart animation helper
- Page transitions
- Modal slide-up with spring
- Scale pop for success states
- Backdrop fade

### 4. New Components ✅
- **EnhancedCategoryChip**: 90x90px with emoji icons
- **ActionCircle**: 44px circular buttons with shadow
- **Enhanced data provider**: Helper functions for data access

### 5. Updated Components ✅
- **HomePage**: New design system, cream background, enhanced typography
- **FoodCard**: Custom card radius and shadows
- **CategoriesBar**: Support for emoji icons

---

## 📖 Quick Reference

### Import Paths
```javascript
// Data
import { categories, foodItems, getFoodById } from '../data/foodData'

// Components
import EnhancedCategoryChip from '../components/EnhancedCategoryChip'
import ActionCircle from '../components/ActionCircle'

// Animations
import {
  container, item,
  flyToCartAnimation,
  pageTransition,
  slideUpModal,
  backdrop,
  scalePop,
  rotateScale
} from '../utils/animations'
```

### Tailwind Classes
```css
/* Colors */
bg-cream-100      /* Hero background #FFF8E6 */
text-strongBlack  /* Headline #000000 */
text-placeholder  /* Placeholder #9A9A9A */

/* Typography */
text-hero         /* 40px hero headline */
text-greeting     /* 18px greeting text */

/* Borders */
rounded-card      /* 16px radius */
rounded-card-lg   /* 20px radius */

/* Shadows */
shadow-action     /* 0 6px 16px rgba(0,0,0,0.18) */
shadow-card       /* 0 4px 12px rgba(0,0,0,0.08) */
```

---

**Version**: 2.0.0
**Last Updated**: December 2024
**Status**: ✅ Production Ready
