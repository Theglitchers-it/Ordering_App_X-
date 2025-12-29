// Complete food ordering data model

export const categories = [
  { id: 'all', label: 'Tutte', icon: '🍽️' },
  { id: 'pizza', label: 'Pizza', icon: '🍕' },
  { id: 'pasta', label: 'Pasta', icon: '🍝' },
  { id: 'burgers', label: 'Burgers', icon: '🍔' },
  { id: 'desserts', label: 'Dolci', icon: '🍰' },
  { id: 'drinks', label: 'Bevande', icon: '🥤' },
  { id: 'salads', label: 'Insalate', icon: '🥗' }
]

export const foodItems = [
  {
    id: 1,
    merchantId: 'merchant_1', // Pizzeria Rossi
    title: 'Margherita Pizza',
    author: 'Chef Giuseppe',
    rating: 4.8,
    deliveryTime: 25,
    price: 12.99,
    currency: '€',
    category: 'pizza',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
    images: [
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'
    ],
    description: 'Pizza classica con pomodoro San Marzano, mozzarella di bufala, basilico fresco e olio extra vergine d\'oliva. Cotta nel forno a legna a 450°C per ottenere una base croccante e un bordo soffice.',
    ingredients: ['Pomodoro San Marzano', 'Mozzarella di Bufala', 'Basilico fresco', 'Olio EVO', 'Sale marino'],
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
      { id: 'a1-basil', label: 'Basilico extra', price: 1.00 },
      { id: 'a1-oil', label: 'Olio al tartufo', price: 3.50 },
      { id: 'a1-chili', label: 'Peperoncino', price: 0.50 }
    ],
    available: true,
    prepTime: 15,
    chef: 'Chef Giuseppe Rossi',
    restaurant: 'Pizzeria Napoletana'
  },
  {
    id: 2,
    merchantId: 'merchant_3', // Trattoria Mario
    title: 'Carbonara Classica',
    author: 'Chef Marco',
    rating: 4.9,
    deliveryTime: 20,
    price: 14.99,
    currency: '€',
    category: 'pasta',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800',
    images: [
      'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800',
      'https://images.unsplash.com/photo-1588013273468-315fd88ea34c?w=800'
    ],
    description: 'La vera carbonara romana: spaghetti, guanciale croccante, uova, pecorino romano e pepe nero. Senza panna, come vuole la tradizione.',
    ingredients: ['Spaghetti', 'Guanciale', 'Uova fresche', 'Pecorino Romano', 'Pepe nero'],
    allergens: ['Glutine', 'Uova', 'Latticini'],
    nutritionalInfo: {
      calories: 425,
      protein: 18,
      carbs: 52,
      fat: 16,
      fiber: 3
    },
    variants: [
      { id: 'v2-normal', label: 'Porzione normale', price: 14.99 },
      { id: 'v2-large', label: 'Porzione abbondante', price: 18.99 }
    ],
    addOns: [
      { id: 'a2-guanciale', label: 'Guanciale extra', price: 3.00 },
      { id: 'a2-pecorino', label: 'Pecorino extra', price: 2.00 },
      { id: 'a2-pepper', label: 'Pepe nero macinato fresco', price: 0.50 }
    ],
    available: true,
    prepTime: 12,
    chef: 'Chef Marco Bianchi',
    restaurant: 'Trattoria Romana'
  },
  {
    id: 3,
    merchantId: 'merchant_2', // Bar Centrale
    title: 'Cheeseburger Deluxe',
    author: 'Chef John',
    rating: 4.7,
    deliveryTime: 30,
    price: 13.50,
    currency: '€',
    category: 'burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    images: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800'
    ],
    description: 'Burger premium con carne Black Angus 200g, cheddar stagionato, bacon croccante, pomodoro, lattuga, cipolla caramellata e salsa BBQ speciale. Servito con patatine.',
    ingredients: ['Carne Black Angus', 'Cheddar stagionato', 'Bacon', 'Pomodoro', 'Lattuga', 'Cipolla', 'Salsa BBQ'],
    allergens: ['Glutine', 'Latticini', 'Senape'],
    nutritionalInfo: {
      calories: 650,
      protein: 35,
      carbs: 45,
      fat: 35,
      fiber: 4
    },
    variants: [
      { id: 'v3-single', label: 'Single (200g)', price: 13.50 },
      { id: 'v3-double', label: 'Double (400g)', price: 18.99 },
      { id: 'v3-triple', label: 'Triple (600g)', price: 23.99 }
    ],
    addOns: [
      { id: 'a3-bacon', label: 'Bacon extra', price: 2.50 },
      { id: 'a3-cheese', label: 'Cheddar extra', price: 1.50 },
      { id: 'a3-egg', label: 'Uovo fritto', price: 1.50 },
      { id: 'a3-onion', label: 'Anelli di cipolla', price: 2.00 },
      { id: 'a3-fries', label: 'Patatine extra large', price: 3.50 }
    ],
    available: true,
    prepTime: 18,
    chef: 'Chef John Smith',
    restaurant: 'American Diner'
  },
  {
    id: 4,
    merchantId: 'merchant_3', // Trattoria Mario
    title: 'Tiramisù Classico',
    author: 'Pasticceria Dolce Vita',
    rating: 5.0,
    deliveryTime: 15,
    price: 6.50,
    currency: '€',
    category: 'desserts',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800',
    images: [
      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800',
      'https://images.unsplash.com/photo-1586040140378-b5d707269a46?w=800'
    ],
    description: 'Il dolce italiano più amato: savoiardi imbevuti nel caffè, crema al mascarpone, cacao amaro. Preparato secondo la ricetta tradizionale.',
    ingredients: ['Mascarpone', 'Savoiardi', 'Caffè espresso', 'Uova', 'Zucchero', 'Cacao amaro'],
    allergens: ['Glutine', 'Uova', 'Latticini'],
    nutritionalInfo: {
      calories: 450,
      protein: 8,
      carbs: 42,
      fat: 28,
      fiber: 1
    },
    variants: [
      { id: 'v4-single', label: 'Porzione singola', price: 6.50 },
      { id: 'v4-double', label: 'Porzione doppia', price: 11.50 },
      { id: 'v4-family', label: 'Formato famiglia (8 porzioni)', price: 45.00 }
    ],
    addOns: [
      { id: 'a4-cream', label: 'Panna montata', price: 1.50 },
      { id: 'a4-amaretto', label: 'Amaretto di Saronno', price: 2.00 },
      { id: 'a4-choc', label: 'Scaglie di cioccolato', price: 1.00 }
    ],
    available: true,
    prepTime: 5,
    chef: 'Maestro Pasticcere',
    restaurant: 'Pasticceria Dolce Vita'
  },
  {
    id: 5,
    merchantId: 'merchant_2', // Bar Centrale
    title: 'Caesar Salad',
    author: 'Chef Laura',
    rating: 4.6,
    deliveryTime: 15,
    price: 9.99,
    currency: '€',
    category: 'salads',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800',
    images: [
      'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'
    ],
    description: 'Lattuga romana croccante, crostini di pane, scaglie di parmigiano, pollo grigliato e salsa Caesar fatta in casa.',
    ingredients: ['Lattuga romana', 'Pollo grigliato', 'Parmigiano', 'Crostini', 'Salsa Caesar', 'Limone'],
    allergens: ['Glutine', 'Latticini', 'Uova', 'Pesce (acciughe)'],
    nutritionalInfo: {
      calories: 320,
      protein: 28,
      carbs: 18,
      fat: 16,
      fiber: 4
    },
    variants: [
      { id: 'v5-small', label: 'Piccola', price: 7.99 },
      { id: 'v5-medium', label: 'Media', price: 9.99 },
      { id: 'v5-large', label: 'Grande', price: 12.99 }
    ],
    addOns: [
      { id: 'a5-chicken', label: 'Pollo extra', price: 3.50 },
      { id: 'a5-bacon', label: 'Bacon croccante', price: 2.50 },
      { id: 'a5-avocado', label: 'Avocado', price: 2.00 },
      { id: 'a5-parmesan', label: 'Parmigiano extra', price: 1.50 }
    ],
    available: true,
    prepTime: 10,
    chef: 'Chef Laura Verdi',
    restaurant: 'Green Kitchen'
  },
  {
    id: 6,
    merchantId: 'merchant_2', // Bar Centrale
    title: 'Coca-Cola',
    author: 'Bevande',
    rating: 4.8,
    deliveryTime: 10,
    price: 2.50,
    currency: '€',
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800',
    images: [
      'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800'
    ],
    description: 'Coca-Cola Original in bottiglia di vetro da 33cl, servita fredda.',
    ingredients: ['Acqua', 'Zucchero', 'Anidride carbonica', 'Colorante E150d', 'Acidificante E338', 'Aromi naturali', 'Caffeina'],
    allergens: [],
    nutritionalInfo: {
      calories: 139,
      protein: 0,
      carbs: 35,
      fat: 0,
      fiber: 0
    },
    variants: [
      { id: 'v6-small', label: '33cl', price: 2.50 },
      { id: 'v6-medium', label: '50cl', price: 3.50 },
      { id: 'v6-large', label: '1.5L', price: 5.00 }
    ],
    addOns: [
      { id: 'a6-ice', label: 'Ghiaccio extra', price: 0.50 },
      { id: 'a6-lemon', label: 'Fetta di limone', price: 0.30 }
    ],
    available: true,
    prepTime: 2,
    chef: null,
    restaurant: 'Bar Centrale'
  },
  {
    id: 7,
    merchantId: 'merchant_1', // Pizzeria Rossi
    title: 'Pizza Diavola',
    author: 'Chef Giuseppe',
    rating: 4.7,
    deliveryTime: 25,
    price: 14.99,
    currency: '€',
    category: 'pizza',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800',
    images: [
      'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'
    ],
    description: 'Pizza piccante con salame piccante calabrese, mozzarella, pomodoro e olio al peperoncino.',
    ingredients: ['Pomodoro', 'Mozzarella', 'Salame piccante', 'Peperoncino', 'Olio EVO'],
    allergens: ['Glutine', 'Latticini'],
    nutritionalInfo: {
      calories: 310,
      protein: 14,
      carbs: 35,
      fat: 14,
      fiber: 2
    },
    variants: [
      { id: 'v7-small', label: 'Piccola (25cm)', price: 11.99 },
      { id: 'v7-medium', label: 'Media (30cm)', price: 14.99 },
      { id: 'v7-large', label: 'Grande (35cm)', price: 17.99 }
    ],
    addOns: [
      { id: 'a7-salame', label: 'Salame extra', price: 2.50 },
      { id: 'a7-chili', label: 'Peperoncino extra', price: 0.50 },
      { id: 'a7-cheese', label: 'Mozzarella extra', price: 2.00 }
    ],
    available: true,
    prepTime: 15,
    chef: 'Chef Giuseppe Rossi',
    restaurant: 'Pizzeria Napoletana'
  },
  {
    id: 8,
    merchantId: 'merchant_3', // Trattoria Mario
    title: 'Penne all\'Arrabbiata',
    author: 'Chef Marco',
    rating: 4.5,
    deliveryTime: 20,
    price: 11.99,
    currency: '€',
    category: 'pasta',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
    images: [
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800'
    ],
    description: 'Penne in salsa di pomodoro piccante con aglio, peperoncino e prezzemolo fresco.',
    ingredients: ['Penne', 'Pomodoro', 'Aglio', 'Peperoncino', 'Prezzemolo', 'Olio EVO'],
    allergens: ['Glutine'],
    nutritionalInfo: {
      calories: 380,
      protein: 12,
      carbs: 68,
      fat: 8,
      fiber: 5
    },
    variants: [
      { id: 'v8-normal', label: 'Porzione normale', price: 11.99 },
      { id: 'v8-large', label: 'Porzione abbondante', price: 15.99 }
    ],
    addOns: [
      { id: 'a8-chili', label: 'Peperoncino extra', price: 0.50 },
      { id: 'a8-parmesan', label: 'Parmigiano grattugiato', price: 1.50 },
      { id: 'a8-basil', label: 'Basilico fresco', price: 1.00 }
    ],
    available: true,
    prepTime: 12,
    chef: 'Chef Marco Bianchi',
    restaurant: 'Trattoria Romana'
  }
]

// Helper functions
export const getFoodById = (id) => {
  return foodItems.find(item => item.id === parseInt(id))
}

export const getFoodsByCategory = (categoryId) => {
  if (categoryId === 'all') return foodItems
  return foodItems.filter(item => item.category === categoryId)
}

export const getRelatedFoods = (currentId, categoryId, limit = 4) => {
  return foodItems
    .filter(item => item.id !== currentId && item.category === categoryId)
    .slice(0, limit)
}

// Multi-tenant helper functions
export const getFoodsByMerchant = (merchantId) => {
  return foodItems.filter(item => item.merchantId === merchantId)
}

export const getFoodsByMerchantAndCategory = (merchantId, categoryId) => {
  const merchantFoods = getFoodsByMerchant(merchantId)
  if (categoryId === 'all') return merchantFoods
  return merchantFoods.filter(item => item.category === categoryId)
}

export const getMerchantCategories = (merchantId) => {
  const merchantFoods = getFoodsByMerchant(merchantId)
  const usedCategories = [...new Set(merchantFoods.map(item => item.category))]
  return [
    { id: 'all', label: 'Tutte', icon: '🍽️' },
    ...categories.filter(cat => usedCategories.includes(cat.id))
  ]
}

export default {
  categories,
  foodItems,
  getFoodById,
  getFoodsByCategory,
  getRelatedFoods,
  getFoodsByMerchant,
  getFoodsByMerchantAndCategory,
  getMerchantCategories
}
