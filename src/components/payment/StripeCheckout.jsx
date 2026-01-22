import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import * as paymentService from '../../api/paymentService';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Stripe Checkout Form Component
 */
function CheckoutForm({ orderId, amount, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation/${orderId}`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        if (onError) onError(error);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful
        if (onSuccess) onSuccess(paymentIntent);
      }
    } catch (err) {
      setErrorMessage('Si è verificato un errore durante il pagamento');
      if (onError) onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Informazioni di Pagamento</h3>

        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">Importo da pagare:</div>
          <div className="text-2xl font-bold text-gray-900">
            €{(amount / 100).toFixed(2)}
          </div>
        </div>

        <PaymentElement />

        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className={`w-full py-4 rounded-lg font-semibold text-white transition-colors ${
          !stripe || isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Elaborazione...
          </span>
        ) : (
          `Paga €${(amount / 100).toFixed(2)}`
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        🔒 Pagamento sicuro con Stripe. I tuoi dati sono protetti.
      </p>
    </form>
  );
}

/**
 * Stripe Checkout Wrapper Component
 *
 * Usage:
 * <StripeCheckout
 *   orderId={123}
 *   onSuccess={(paymentIntent) => console.log('Success!', paymentIntent)}
 *   onError={(error) => console.error('Error!', error)}
 * />
 */
export default function StripeCheckout({ orderId, onSuccess, onError, onLoading }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setError('Order ID is required');
      setLoading(false);
      return;
    }

    // Create payment intent
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        if (onLoading) onLoading(true);

        const result = await paymentService.createPaymentIntent(orderId);

        if (!result.success) {
          throw new Error(result.message || 'Failed to create payment intent');
        }

        setClientSecret(result.clientSecret);
        setPaymentIntentId(result.paymentIntentId);
        setAmount(result.amount || 0);
        setError(null);
      } catch (err) {
        console.error('[StripeCheckout] Error creating payment intent:', err);
        setError(err.message || 'Errore durante la creazione del pagamento');
        if (onError) onError(err);
      } finally {
        setLoading(false);
        if (onLoading) onLoading(false);
      }
    };

    createPaymentIntent();
  }, [orderId]);

  // Stripe Elements options
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#16a34a', // green-600
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-600">Caricamento pagamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-700 mb-2">Errore</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">Impossibile caricare il pagamento</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        orderId={orderId}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
