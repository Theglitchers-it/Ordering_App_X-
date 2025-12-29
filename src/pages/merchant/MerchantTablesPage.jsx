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
  XCircle
} from 'lucide-react';
import { getTablesByMerchant, getTableStats } from '../../data/tables';

const MerchantTablesPage = () => {
  const merchantAuth = JSON.parse(localStorage.getItem('merchantAuth') || '{}');
  const merchantId = merchantAuth.merchantId || 'merchant_1'; // Fallback for demo

  const tables = getTablesByMerchant(merchantId);
  const stats = getTableStats(merchantId);
  const [selectedTable, setSelectedTable] = useState(null);

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
            <button className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-opacity-90 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105">
              <Plus className="w-5 h-5" />
              <span>Aggiungi Tavolo</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    </div>
  );
};

export default MerchantTablesPage;
