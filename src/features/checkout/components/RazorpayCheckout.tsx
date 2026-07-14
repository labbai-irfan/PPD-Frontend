import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner'; // using sonner based on package.json

interface RazorpayCheckoutProps {
  amount: number;
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({ amount }) => {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    const res = await loadRazorpayScript();

    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      // 1. Create order on the backend
      const result = await axios.post('http://localhost:3000/api/v1/payment/create-order', {
        amount,
        currency: 'INR',
      });

      if (!result.data || !result.data.id) {
        toast.error('Server error. Are you sure the backend is running?');
        setLoading(false);
        return;
      }

      const { amount: orderAmount, id: order_id, currency } = result.data;

      // 2. Initialize Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        amount: orderAmount,
        currency: currency,
        name: 'PPD Ecommerce',
        description: 'Test Transaction',
        order_id: order_id,
        handler: async function (response: any) {
          try {
            // 3. Verify payment on the backend
            const verifyResult = await axios.post('http://localhost:3000/api/v1/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyResult.data.status === 'success') {
              toast.success('Payment Successful!');
            } else {
              toast.error('Payment Verification Failed!');
            }
          } catch (err) {
            toast.error('Error verifying payment');
          }
        },
        prefill: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#3399cc',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err) {
      toast.error('Error initiating payment');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
    >
      {loading ? 'Processing...' : `Pay ₹${amount} with Razorpay`}
    </button>
  );
};

export default RazorpayCheckout;
