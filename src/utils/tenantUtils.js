// Utility functions for multi-tenant operations

import { getMerchantBySlug, merchants } from '../data/merchants';

/**
 * Detect merchant from current URL
 * Supports multiple patterns:
 * - subdomain.domain.com
 * - domain.com/merchant-slug
 * - domain.com?merchant=merchant-slug
 */
export const detectMerchantFromUrl = () => {
  // 1. Try URL parameter (for development)
  const urlParams = new URLSearchParams(window.location.search);
  const merchantParam = urlParams.get('merchant');

  if (merchantParam) {
    return getMerchantBySlug(merchantParam);
  }

  // 2. Try path (e.g., /pizzeria-rossi/...)
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const potentialSlug = pathParts[0];

  // Check if it's a known merchant slug
  const merchant = getMerchantBySlug(potentialSlug);
  if (merchant) {
    return merchant;
  }

  // 3. Try subdomain (for production with real subdomains)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    // If subdomain exists (e.g., pizzeria-rossi.domain.com)
    if (parts.length > 2) {
      const subdomain = parts[0];
      const merchantBySubdomain = getMerchantBySlug(subdomain);
      if (merchantBySubdomain) {
        return merchantBySubdomain;
      }
    }
  }

  return null;
};

/**
 * Get table number from URL
 */
export const getTableFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tableParam = urlParams.get('table');
  return tableParam ? parseInt(tableParam, 10) : null;
};

/**
 * Generate URL for merchant (handles both subdomain and path-based routing)
 */
export const getMerchantUrl = (merchantSlug, path = '') => {
  // For development: use path-based routing
  const basePath = `/${merchantSlug}`;
  return path ? `${basePath}${path}` : basePath;

  // For production with subdomains:
  // const subdomain = merchantSlug;
  // const domain = window.location.hostname.split('.').slice(-2).join('.');
  // return `https://${subdomain}.${domain}${path}`;
};

/**
 * Generate QR code URL for table
 */
export const generateTableQRCodeUrl = (merchantSlug, tableNumber) => {
  const baseUrl = window.location.origin;
  const merchantUrl = `${baseUrl}/${merchantSlug}?table=${tableNumber}`;

  // Using QR Server API (free service)
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(merchantUrl)}`;
};

/**
 * Check if current path is a merchant page
 */
export const isMerchantPage = () => {
  const merchant = detectMerchantFromUrl();
  return merchant !== null;
};

/**
 * Check if current path is SaaS landing page
 */
export const isSaaSLandingPage = () => {
  const path = window.location.pathname;
  return path === '/' || path === '';
};

/**
 * Check if current path is super admin
 */
export const isSuperAdminPage = () => {
  const path = window.location.pathname;
  return path.startsWith('/superadmin');
};

/**
 * Check if current path is merchant admin
 */
export const isMerchantAdminPage = () => {
  const path = window.location.pathname;
  const merchant = detectMerchantFromUrl();
  return merchant && path.includes('/admin');
};

/**
 * Validate merchant slug format
 */
export const isValidMerchantSlug = (slug) => {
  // Slug should be lowercase, alphanumeric with hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Generate slug from merchant name
 */
export const generateSlugFromName = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Check if slug is already taken
 */
export const isSlugAvailable = (slug) => {
  return !getMerchantBySlug(slug);
};

/**
 * Get all active merchant slugs
 */
export const getAllMerchantSlugs = () => {
  return merchants
    .filter(m => m.status === 'active')
    .map(m => m.slug);
};

/**
 * Parse merchant from different URL formats
 */
export const parseMerchantFromUrl = (url) => {
  try {
    const urlObj = new URL(url);

    // Try subdomain
    const hostname = urlObj.hostname;
    const parts = hostname.split('.');
    if (parts.length > 2) {
      const subdomain = parts[0];
      const merchant = getMerchantBySlug(subdomain);
      if (merchant) return merchant;
    }

    // Try path
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const potentialSlug = pathParts[0];
      const merchant = getMerchantBySlug(potentialSlug);
      if (merchant) return merchant;
    }

    // Try query param
    const merchantParam = urlObj.searchParams.get('merchant');
    if (merchantParam) {
      return getMerchantBySlug(merchantParam);
    }

    return null;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
};

export default {
  detectMerchantFromUrl,
  getTableFromUrl,
  getMerchantUrl,
  generateTableQRCodeUrl,
  isMerchantPage,
  isSaaSLandingPage,
  isSuperAdminPage,
  isMerchantAdminPage,
  isValidMerchantSlug,
  generateSlugFromName,
  isSlugAvailable,
  getAllMerchantSlugs,
  parseMerchantFromUrl
};
