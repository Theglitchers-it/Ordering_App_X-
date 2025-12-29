import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Building } from 'lucide-react';

const LocationInfo = ({ location, onChange }) => {
  const [formData, setFormData] = useState(location);

  useEffect(() => {
    onChange(formData);
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const days = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Informazioni del Locale
        </h2>
        <p className="text-gray-600">
          Aiuta i tuoi clienti a trovarti facilmente
        </p>
      </div>

      <div className="space-y-6">
        {/* Address */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Indirizzo *
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Via Roma 123"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Città
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Milano"
            />
          </div>
        </div>

        {/* ZIP & Phone */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              CAP
            </label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="20100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Telefono *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="+39 02 1234567"
                required
              />
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">
              Orari di Apertura (Opzionale)
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Puoi compilare gli orari in seguito dalle impostazioni
          </p>

          <div className="space-y-3">
            {days.slice(0, 3).map((day) => (
              <div key={day} className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 w-24">
                  {day}
                </span>
                <input
                  type="time"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="09:00"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="time"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="22:00"
                />
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-4 italic">
            💡 Configura tutti i giorni della settimana in seguito
          </p>
        </div>

        {/* Map Preview Placeholder */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 text-center border-2 border-blue-200">
          <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-blue-900 mb-2">
            Anteprima Mappa
          </h4>
          <p className="text-sm text-blue-700">
            {formData.address || 'Inserisci un indirizzo per vedere la mappa'}
          </p>
          <p className="text-xs text-blue-600 mt-2">
            {formData.city && formData.zipCode
              ? `${formData.city}, ${formData.zipCode}`
              : ''}
          </p>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <p className="text-sm text-blue-800">
            📍 <strong>Suggerimento:</strong> Un indirizzo completo e corretto aiuta i clienti
            a trovarti facilmente e migliora la tua visibilità su Google Maps.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LocationInfo;
