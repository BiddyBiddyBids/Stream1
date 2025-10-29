import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
// Replace with your actual Stripe publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_PUBLISHABLE_KEY_HERE');

export const redirectToCheckout = async (plan: 'monthly' | 'quarterly' | 'yearly') => {
  try {
    const stripe = await stripePromise;
    
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }

    // Price IDs for your products (replace with your actual Stripe Price IDs)
    const priceIds = {
      monthly: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID || 'price_monthly_placeholder',
      quarterly: import.meta.env.VITE_STRIPE_QUARTERLY_PRICE_ID || 'price_quarterly_placeholder',
      yearly: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID || 'price_yearly_placeholder'
    };

    // In production, call your backend to create a checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        priceId: priceIds[plan],
        plan: plan
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const session = await response.json();
    
    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return { success: true };
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    
    // For demo purposes, show alert
    alert(`Stripe Checkout would open here for ${plan} plan.\n\nTo enable:\n1. Add your Stripe publishable key to .env\n2. Create a backend endpoint at /api/create-checkout-session\n3. Add your Stripe Price IDs to .env`);
    
    return { success: false, error };
  }
};

export default stripePromise;