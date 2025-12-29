// Mock data per i tavoli di ogni merchant

export const tables = [
  // Pizzeria Rossi (20 tavoli)
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `table_m1_${i + 1}`,
    merchantId: 'merchant_1',
    tableNumber: i + 1,
    capacity: i < 10 ? 2 : i < 15 ? 4 : 6, // Mix di capacità
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`http://localhost:5173/pizzeria-rossi?table=${i + 1}`)}`,
    status: 'available', // available | occupied | reserved
    currentOrder: null,
    location: i < 5 ? 'Interno' : i < 15 ? 'Terrazza' : 'Sala privata'
  })),

  // Bar Centrale (12 tavoli)
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `table_m2_${i + 1}`,
    merchantId: 'merchant_2',
    tableNumber: i + 1,
    capacity: i < 8 ? 2 : 4,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`http://localhost:5173/bar-centrale?table=${i + 1}`)}`,
    status: 'available',
    currentOrder: null,
    location: i < 6 ? 'Interno' : 'Esterno'
  })),

  // Trattoria Mario (15 tavoli)
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `table_m3_${i + 1}`,
    merchantId: 'merchant_3',
    tableNumber: i + 1,
    capacity: i < 8 ? 2 : i < 12 ? 4 : 6,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`http://localhost:5173/trattoria-mario?table=${i + 1}`)}`,
    status: 'available',
    currentOrder: null,
    location: i < 10 ? 'Sala principale' : 'Giardino'
  }))
];

// Helper functions
export const getTablesByMerchant = (merchantId) => {
  return tables.filter(t => t.merchantId === merchantId);
};

export const getTableById = (tableId) => {
  return tables.find(t => t.id === tableId);
};

export const getTableByMerchantAndNumber = (merchantId, tableNumber) => {
  return tables.find(t => t.merchantId === merchantId && t.tableNumber === tableNumber);
};

export const getAvailableTablesByMerchant = (merchantId) => {
  return tables.filter(t => t.merchantId === merchantId && t.status === 'available');
};

export const getOccupiedTablesByMerchant = (merchantId) => {
  return tables.filter(t => t.merchantId === merchantId && t.status === 'occupied');
};

export const updateTableStatus = (tableId, newStatus, orderId = null) => {
  const table = getTableById(tableId);
  if (table) {
    table.status = newStatus;
    table.currentOrder = orderId;
  }
  return table;
};

// Stats per merchant
export const getTableStats = (merchantId) => {
  const merchantTables = getTablesByMerchant(merchantId);
  return {
    total: merchantTables.length,
    available: merchantTables.filter(t => t.status === 'available').length,
    occupied: merchantTables.filter(t => t.status === 'occupied').length,
    reserved: merchantTables.filter(t => t.status === 'reserved').length,
    occupancyRate: ((merchantTables.filter(t => t.status === 'occupied').length / merchantTables.length) * 100).toFixed(1)
  };
};

export default {
  tables,
  getTablesByMerchant,
  getTableById,
  getTableByMerchantAndNumber,
  getAvailableTablesByMerchant,
  getOccupiedTablesByMerchant,
  updateTableStatus,
  getTableStats
};
