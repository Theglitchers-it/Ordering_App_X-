import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Palette,
  MapPin,
  CreditCard,
  Utensils,
  Sparkles
} from 'lucide-react';
import BrandCustomizer from '../components/merchant/BrandCustomizer';
import SubscriptionSelector from '../components/merchant/SubscriptionSelector';
import LocationInfo from '../components/merchant/LocationInfo';
import MenuQuickStart from '../components/merchant/MenuQuickStart';
import { useMerchant } from '../context/MerchantContext';

const MerchantOnboardingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateMerchant } = useMerchant();

  // Get merchant from state passed by registration
  const merchantAuth = JSON.parse(localStorage.getItem('merchantAuth') || '{}');
  const merchantId = merchantAuth.merchantId;

  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    brandColors: {
      primary: '#FF6B35',
      secondary: '#F7931E',
      accent: '#C0392B'
    },
    logo: '',
    location: {
      address: '',
      city: '',
      zipCode: '',
      phone: '',
      openingHours: {}
    },
    subscription: {
      plan: 'business',
      price: 79
    },
    quickMenu: []
  });

  const steps = [
    {
      number: 1,
      title: 'Personalizza Brand',
      icon: Palette,
      description: 'Colori e logo del tuo locale'
    },
    {
      number: 2,
      title: 'Informazioni Locale',
      icon: MapPin,
      description: 'Indirizzo e contatti'
    },
    {
      number: 3,
      title: 'Piano Subscription',
      icon: CreditCard,
      description: 'Scegli il piano perfetto per te'
    },
    {
      number: 4,
      title: 'Menu Rapido',
      icon: Utensils,
      description: 'Aggiungi i tuoi primi piatti'
    }
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Update merchant with onboarding data
    updateMerchant(merchantId, {
      brandColors: onboardingData.brandColors,
      logo: onboardingData.logo,
      contact: {
        address: onboardingData.location.address,
        city: onboardingData.location.city,
        zipCode: onboardingData.location.zipCode,
        phone: onboardingData.location.phone
      },
      settings: {
        openingHours: onboardingData.location.openingHours
      },
      subscription: onboardingData.subscription,
      status: 'active'
    });

    // Navigate to dashboard
    navigate('/merchant/dashboard');
  };

  const updateOnboardingData = (field, value) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true; // Brand colors always valid
      case 2:
        return onboardingData.location.address && onboardingData.location.phone;
      case 3:
        return onboardingData.subscription.plan;
      case 4:
        return true; // Menu is optional
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-white">
      {/* Header with Progress */}
      <div className="bg-white border-b border-cream-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Steps Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center flex-1">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{
                        scale: currentStep === step.number ? 1.1 : 1,
                        backgroundColor: currentStep >= step.number ? '#FF6B35' : '#E5E7EB'
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        currentStep >= step.number
                          ? 'bg-primary text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </motion.div>
                    <p className={`text-xs mt-2 font-medium hidden sm:block ${
                      currentStep === step.number ? 'text-primary' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-1 mx-2">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{
                          width: currentStep > step.number ? '100%' : '0%',
                          backgroundColor: '#FF6B35'
                        }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-primary rounded"
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Current Step Title */}
          <div className="text-center">
            <motion.h1
              key={currentStep}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gray-900 flex items-center justify-center space-x-3"
            >
              <Sparkles className="w-8 h-8 text-primary" />
              <span>{steps[currentStep - 1].title}</span>
            </motion.h1>
            <p className="text-gray-600 mt-2">{steps[currentStep - 1].description}</p>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-cream-200"
          >
            {currentStep === 1 && (
              <BrandCustomizer
                brandColors={onboardingData.brandColors}
                logo={onboardingData.logo}
                onChange={(data) => {
                  updateOnboardingData('brandColors', data.brandColors);
                  updateOnboardingData('logo', data.logo);
                }}
              />
            )}

            {currentStep === 2 && (
              <LocationInfo
                location={onboardingData.location}
                onChange={(data) => updateOnboardingData('location', data)}
              />
            )}

            {currentStep === 3 && (
              <SubscriptionSelector
                selectedPlan={onboardingData.subscription}
                onChange={(data) => updateOnboardingData('subscription', data)}
              />
            )}

            {currentStep === 4 && (
              <MenuQuickStart
                quickMenu={onboardingData.quickMenu}
                onChange={(data) => updateOnboardingData('quickMenu', data)}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-primary hover:text-primary'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Indietro</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
              canProceed()
                ? 'bg-primary text-white hover:bg-opacity-90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>{currentStep === 4 ? 'Completa Setup' : 'Continua'}</span>
            {currentStep === 4 ? (
              <Check className="w-5 h-5" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Skip Option */}
        {currentStep < 4 && (
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/merchant/dashboard')}
              className="text-sm text-gray-500 hover:text-primary transition-colors duration-200"
            >
              Salta per ora, completa dopo →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantOnboardingPage;
