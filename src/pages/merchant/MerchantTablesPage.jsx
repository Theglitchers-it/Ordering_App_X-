import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Download,
  QrCode as QrCodeIcon,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import { useTables } from '../../hooks/useTables';

const MerchantTablesPage = () => {
  const merchantAuth = JSON.parse(localStorage.getItem('merchantAuth') || '{}');
  const merchantId = merchantAuth.merchantId || 'merchant_1'; // Fallback for demo

  const { tables, stats, loading, addTable, deleteTable } = useTables(merchantId);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(2);
  const [newTableLocation, setNewTableLocation] = useState('Interno');

  const handleAddTable = async () => {
    if (!newTableNumber) return;
    await addTable({
      tableNumber: parseInt(newTableNumber),
      capacity: newTableCapacity,
      location: newTableLocation
    });
    setShowAddModal(false);
    setNewTableNumber('');
    setNewTableCapacity(2);
    setNewTableLocation('Interno');
  };

  const handleDownloadQR = (table) => {
    // Simulate QR code download
    alert(`QR Code per ${table.tableNumber} scaricato! (Funzionalità simulata)`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/merchant/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tavoli & QR Codes</h1>
                <p className="text-gray-600 mt-1">{stats.total} tavoli configurati</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-opacity-90 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Aggiungi Tavolo</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="ml-3 text-gray-600">Caricamento tavoli...</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Totale Tavoli</span>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Disponibili</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.available}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Occupati</span>
              <XCircle className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.occupied}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Tasso Occupazione</span>
              <QrCodeIcon className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.occupancyRate}%</p>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map((table, index) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
            >
              {/* QR Code Preview */}
              <div className="relative bg-gray-50 p-6 flex items-center justify-center">
                <img
                  src={table.qrCode}
                  alt={`QR Tavolo ${table.tableNumber}`}
                  className="w-full h-auto max-w-[200px]"
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    table.status === 'available'
                      ? 'bg-green-100 text-green-700'
                      : table.status === 'occupied'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {table.status === 'available' ? 'Libero' :
                     table.status === 'occupied' ? 'Occupato' : 'Riservato'}
                  </span>
                </div>
              </div>

              {/* Table Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Tavolo #{table.tableNumber}
                  </h3>
                  <span className="text-sm text-gray-600">
                    {table.capacity} posti
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  📍 {table.location}
                </p>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownloadQR(table)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors duration-200"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Scarica</span>
                  </button>
                  <button
                    onClick={() => setSelectedTable(table)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors duration-200"
                  >
                    <QrCodeIcon className="w-4 h-4" />
                    <span className="text-sm">Preview</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <QrCodeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Come Funzionano i QR Codes
              </h3>
              <p className="text-gray-700 mb-4">
                Stampa i QR codes e posizionali sui tavoli del tuo ristorante. I clienti scanneranno
                il codice con il loro smartphone e vedranno automaticamente il tuo menu digitale.
                L'ordine sarà associato automaticamente al numero del tavolo!
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Ogni QR code contiene il link unico al tuo menu + numero tavolo</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>I clienti possono ordinare direttamente dal loro telefono</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Gli ordini arrivano in tempo reale nel tuo dashboard</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Aggiungi Nuovo Tavolo</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numero Tavolo</label>
                <input
                  type="number"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  placeholder="Es. 21"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacita (posti)</label>
                <select
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={2}>2 posti</option>
                  <option value={4}>4 posti</option>
                  <option value={6}>6 posti</option>
                  <option value={8}>8 posti</option>
                  <option value={10}>10 posti</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posizione</label>
                <select
                  value={newTableLocation}
                  onChange={(e) => setNewTableLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="Interno">Interno</option>
                  <option value="Esterno">Esterno</option>
                  <option value="Terrazza">Terrazza</option>
                  <option value="Giardino">Giardino</option>
                  <option value="Sala privata">Sala privata</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleAddTable}
                disabled={!newTableNumber}
                className="flex-1 px-4 py-3 bg-primary hover:bg-opacity-90 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
              >
                Aggiungi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MerchantTablesPage;
