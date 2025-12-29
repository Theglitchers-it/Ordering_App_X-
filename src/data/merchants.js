// Mock data per i merchant (ristoranti/bar registrati sulla piattaforma SaaS)

export const merchants = [
  {
    id: 'merchant_1',
    name: 'Pizzeria Rossi',
    slug: 'pizzeria-rossi',
    description: 'Pizzeria napoletana autentica dal 1985. Pizza cotta nel forno a legna con ingredienti freschi.',
    logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop',
    brandColors: {
      primary: '#FF6B35',
      secondary: '#F7931E',
      accent: '#C0392B'
    },
    contact: {
      email: 'info@pizzeriarossi.it',
      phone: '+39 02 1234567',
      address: 'Via Roma 45, 20121 Milano',
      website: 'https://pizzeriarossi.it'
    },
    subscription: {
      plan: 'business', // starter | business | enterprise
      price: 79,
      currency: 'EUR',
      billingCycle: 'monthly',
      startDate: '2024-01-15',
      status: 'active'
    },
    settings: {
      commissionRate: 0.10, // 10% commissione per la piattaforma
      tableCount: 20,
      averageOrderValue: 25.50,
      openingHours: {
        monday: '12:00-15:00, 19:00-23:00',
        tuesday: '12:00-15:00, 19:00-23:00',
        wednesday: '12:00-15:00, 19:00-23:00',
        thursday: '12:00-15:00, 19:00-23:00',
        friday: '12:00-15:00, 19:00-00:00',
        saturday: '12:00-15:00, 19:00-00:00',
        sunday: '12:00-15:00, 19:00-23:00'
      }
    },
    stats: {
      totalOrders: 1250,
      totalRevenue: 31875, // €31,875 revenue totale
      avgRating: 4.8,
      reviewCount: 245,
      registeredDate: '2024-01-15'
    },
    status: 'active', // active | pending_approval | blocked | suspended
    owner: {
      id: 'user_merchant_1',
      name: 'Marco Rossi',
      email: 'marco.rossi@pizzeriarossi.it',
      role: 'MERCHANT_ADMIN'
    }
  },
  {
    id: 'merchant_2',
    name: 'Bar Centrale',
    slug: 'bar-centrale',
    description: 'Bar storico nel cuore della città. Colazioni, aperitivi e caffetteria di qualità.',
    logo: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop',
    brandColors: {
      primary: '#2C3E50',
      secondary: '#E67E22',
      accent: '#16A085'
    },
    contact: {
      email: 'info@barcentrale.it',
      phone: '+39 06 9876543',
      address: 'Piazza Duomo 12, 00100 Roma',
      website: 'https://barcentrale.it'
    },
    subscription: {
      plan: 'starter',
      price: 29,
      currency: 'EUR',
      billingCycle: 'monthly',
      startDate: '2024-02-10',
      status: 'active'
    },
    settings: {
      commissionRate: 0.12, // 12% commissione (piano starter ha rate più alto)
      tableCount: 12,
      averageOrderValue: 8.50,
      openingHours: {
        monday: '07:00-20:00',
        tuesday: '07:00-20:00',
        wednesday: '07:00-20:00',
        thursday: '07:00-20:00',
        friday: '07:00-22:00',
        saturday: '08:00-22:00',
        sunday: 'Chiuso'
      }
    },
    stats: {
      totalOrders: 850,
      totalRevenue: 7225, // €7,225 revenue totale
      avgRating: 4.5,
      reviewCount: 112,
      registeredDate: '2024-02-10'
    },
    status: 'active',
    owner: {
      id: 'user_merchant_2',
      name: 'Laura Bianchi',
      email: 'laura.bianchi@barcentrale.it',
      role: 'MERCHANT_ADMIN'
    }
  },
  {
    id: 'merchant_3',
    name: 'Trattoria Mario',
    slug: 'trattoria-mario',
    description: 'Cucina tradizionale toscana. Pasta fatta in casa e carni alla griglia.',
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop',
    brandColors: {
      primary: '#8B4513',
      secondary: '#D4AF37',
      accent: '#CD853F'
    },
    contact: {
      email: 'info@trattoriamario.it',
      phone: '+39 055 3334455',
      address: 'Via dei Calzaiuoli 88, 50122 Firenze',
      website: 'https://trattoriamario.it'
    },
    subscription: {
      plan: 'business',
      price: 79,
      currency: 'EUR',
      billingCycle: 'monthly',
      startDate: '2024-03-01',
      status: 'active'
    },
    settings: {
      commissionRate: 0.10,
      tableCount: 15,
      averageOrderValue: 32.00,
      openingHours: {
        monday: 'Chiuso',
        tuesday: '12:30-15:00, 19:30-23:00',
        wednesday: '12:30-15:00, 19:30-23:00',
        thursday: '12:30-15:00, 19:30-23:00',
        friday: '12:30-15:00, 19:30-23:30',
        saturday: '12:30-15:00, 19:30-23:30',
        sunday: '12:30-15:00, 19:30-23:00'
      }
    },
    stats: {
      totalOrders: 620,
      totalRevenue: 19840, // €19,840 revenue totale
      avgRating: 4.9,
      reviewCount: 178,
      registeredDate: '2024-03-01'
    },
    status: 'active',
    owner: {
      id: 'user_merchant_3',
      name: 'Mario Verdi',
      email: 'mario.verdi@trattoriamario.it',
      role: 'MERCHANT_ADMIN'
    }
  }
];

// Funzioni utility per lavorare con i merchant

export const getMerchantById = (merchantId) => {
  return merchants.find(m => m.id === merchantId);
};

export const getMerchantBySlug = (slug) => {
  return merchants.find(m => m.slug === slug);
};

export const getActiveMerchants = () => {
  return merchants.filter(m => m.status === 'active');
};

export const getPendingMerchants = () => {
  return merchants.filter(m => m.status === 'pending_approval');
};

export const getTotalPlatformRevenue = () => {
  return merchants.reduce((total, m) => total + m.stats.totalRevenue, 0);
};

export const getTotalPlatformCommissions = () => {
  return merchants.reduce((total, m) => {
    const commission = m.stats.totalRevenue * m.settings.commissionRate;
    return total + commission;
  }, 0);
};

export const getMerchantsBySubscriptionPlan = (plan) => {
  return merchants.filter(m => m.subscription.plan === plan);
};

export const calculateMRR = () => {
  // Monthly Recurring Revenue da subscriptions
  return merchants
    .filter(m => m.status === 'active')
    .reduce((total, m) => total + m.subscription.price, 0);
};

// Stats globali piattaforma
export const platformStats = {
  totalMerchants: merchants.length,
  activeMerchants: getActiveMerchants().length,
  totalRevenue: getTotalPlatformRevenue(),
  totalCommissions: getTotalPlatformCommissions(),
  mrr: calculateMRR(),
  avgRevenuePerMerchant: getTotalPlatformRevenue() / merchants.length
};
