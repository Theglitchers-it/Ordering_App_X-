import React from 'react';
import SaaSHeader from '../components/saas/SaaSHeader';
import SaaSHero from '../components/saas/SaaSHero';
import SaaSFeatures from '../components/saas/SaaSFeatures';
import SaaSPricing from '../components/saas/SaaSPricing';
import SaaSCTA from '../components/saas/SaaSCTA';
import SaaSFooter from '../components/saas/SaaSFooter';

const SaaSLandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <SaaSHeader />
      <main>
        <SaaSHero />
        <SaaSFeatures />
        <SaaSPricing />
        <SaaSCTA />
      </main>
      <SaaSFooter />
    </div>
  );
};

export default SaaSLandingPage;
