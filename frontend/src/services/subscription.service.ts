import api from '../lib/api';

export const subscriptionService = {
  createCheckout: (priceId: string, plan: string, billingPeriod: 'monthly' | 'yearly') =>
    api.post('/api/school/subscription/checkout', { priceId, plan, billingPeriod }),
  openPortal: () => api.post('/api/school/subscription/portal'),
};
