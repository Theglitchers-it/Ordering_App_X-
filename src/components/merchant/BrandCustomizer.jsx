import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Eye, Upload, Sparkles } from 'lucide-react';

const BrandCustomizer = ({ brandColors, logo, onChange }) => {
  const [colors, setColors] = useState(brandColors);
  const [logoUrl, setLogoUrl] = useState(logo);
  const [showPreview, setShowPreview] = useState(true);

  const presetColorSchemes = [
    {
      name: 'Classico Italiano',
      primary: '#FF6B35',
      secondary: '#F7931E',
      accent: '#C0392B'
    },
    {
      name: 'Elegante Blu',
      primary: '#3498DB',
      secondary: '#2980B9',
      accent: '#1ABC9C'
    },
    {
      name: 'Verde Naturale',
      primary: '#27AE60',
      secondary: '#2ECC71',
      accent: '#16A085'
    },
    {
      name: 'Viola Moderno',
      primary: '#9B59B6',
      secondary: '#8E44AD',
      accent: '#E74C3C'
    },
    {
      name: 'Arancione Energico',
      primary: '#E67E22',
      secondary: '#D35400',
      accent: '#E74C3C'
    }
  ];

  useEffect(() => {
    onChange({
      brandColors: colors,
      logo: logoUrl
    });
  }, [colors, logoUrl]);

  const handleColorChange = (type, value) => {
    setColors(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const applyPreset = (preset) => {
    setColors({
      primary: preset.primary,
      secondary: preset.secondary,
      accent: preset.accent
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <Palette className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Personalizza il Tuo Brand
        </h2>
        <p className="text-gray-600">
          Scegli i colori che rappresentano al meglio il tuo locale
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Color Customization */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Logo (Opzionale)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary transition-colors duration-200">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">
                Carica il logo del tuo locale
              </p>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://esempio.com/logo.png"
              />
              <p className="text-xs text-gray-500 mt-2">
                Oppure incolla l'URL del tuo logo
              </p>
            </div>
          </div>

          {/* Color Pickers */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Colore Primario
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="w-20 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Colore Secondario
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={colors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="w-20 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Colore Accento
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={colors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="w-20 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                />
              </div>
            </div>
          </div>

          {/* Preset Schemes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Schemi Preimpostati
            </label>
            <div className="grid grid-cols-2 gap-3">
              {presetColorSchemes.map((preset, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => applyPreset(preset)}
                  className="p-3 border-2 border-gray-200 rounded-lg hover:border-primary transition-all duration-200"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: preset.secondary }}
                    />
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: preset.accent }}
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-700">{preset.name}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Anteprima Live</span>
            </h3>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-primary hover:underline"
            >
              {showPreview ? 'Nascondi' : 'Mostra'}
            </button>
          </div>

          {showPreview && (
            <motion.div
              key={JSON.stringify(colors)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Header Preview */}
              <div
                className="rounded-xl p-6 text-white"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
                }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="w-12 h-12 rounded-full bg-white p-1"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-lg">Il Tuo Locale</h4>
                    <p className="text-sm text-white text-opacity-90">Menu Digitale</p>
                  </div>
                </div>
              </div>

              {/* Button Preview */}
              <div className="space-y-3">
                <button
                  className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-200"
                  style={{ backgroundColor: colors.primary }}
                >
                  Pulsante Primario
                </button>
                <button
                  className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-200"
                  style={{ backgroundColor: colors.secondary }}
                >
                  Pulsante Secondario
                </button>
                <button
                  className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-200"
                  style={{ backgroundColor: colors.accent }}
                >
                  Pulsante Accento
                </button>
              </div>

              {/* Card Preview */}
              <div className="bg-white rounded-xl p-4 border-2" style={{ borderColor: colors.primary }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="font-semibold text-gray-900">Margherita Pizza</h5>
                    <p className="text-sm text-gray-600">Pomodoro, mozzarella, basilico</p>
                  </div>
                  <span className="text-lg font-bold" style={{ color: colors.primary }}>
                    €12.00
                  </span>
                </div>
                <button
                  className="w-full py-2 rounded-lg font-medium text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  Aggiungi al Carrello
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandCustomizer;
