# Payment Gateway Setup Guide - Paystack Integration

## Overview
Kasi-Rent now includes a complete payment gateway integration using **Paystack**, which supports South African Rand (ZAR) and is widely used across Africa.

## Features
- ✅ **Card Payments** - Accept credit/debit card payments
- ✅ **Secure Processing** - PCI-compliant payment processing
- ✅ **Payment Tracking** - Full payment history in database
- ✅ **Multiple Payment Types** - Deposit, rent, application fees, service fees
- ✅ **Payment Verification** - Automatic payment status verification
- ✅ **Webhook Support** - Real-time payment notifications
- ✅ **MySQL Integration** - All payments stored in MySQL database

## Backend Setup

### 1. Install Dependencies
```bash
cd server
npm install axios
```

### 2. Environment Variables
Add to your `server/.env` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_CALLBACK_URL=http://localhost:5000/api/payments/verify

# For production, use:
# PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
# PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key
# PAYSTACK_CALLBACK_URL=https://yourdomain.com/api/payments/verify
```

### 3. Get Paystack API Keys

1. **Sign up** at [paystack.com](https://paystack.com)
2. Go to **Settings** → **API Keys & Webhooks**
3. Copy your **Secret Key** and **Public Key**
4. For testing, use **Test Keys** (start with `sk_test_` and `pk_test_`)
5. For production, use **Live Keys** (start with `sk_live_` and `pk_live_`)

### 4. Database Setup
The Payment model will be automatically created when you start the server. The table structure includes:

- `id` - UUID primary key
- `user_id` - Reference to user
- `property_id` - Reference to property (optional)
- `amount` - Payment amount
- `currency` - Currency code (default: ZAR)
- `payment_type` - Type of payment (deposit, rent, etc.)
- `status` - Payment status (pending, completed, failed, etc.)
- `gateway_reference` - Paystack transaction reference
- `customer_email` - Customer email
- `created_at` / `updated_at` - Timestamps

## Frontend Setup

### 1. Environment Variables
Add to your `client/.env` file:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000
```

### 2. Using the Payment Component

```tsx
import { PaymentForm } from "@/components/PaymentForm";
import { useState } from "react";

function MyComponent() {
  const [paymentOpen, setPaymentOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setPaymentOpen(true)}>
        Pay Now
      </Button>
      
      <PaymentForm
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        amount={5000} // Amount in ZAR
        propertyId="property-uuid"
        propertyTitle="Beautiful Apartment"
        paymentType="deposit"
        onSuccess={(paymentId) => {
          console.log("Payment successful:", paymentId);
          // Handle success (e.g., redirect, show confirmation)
        }}
      />
    </>
  );
}
```

## API Endpoints

### Initialize Payment
```
POST /api/payments/initialize
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000,
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+27123456789",
  "property_id": "uuid-optional",
  "payment_type": "deposit",
  "description": "Payment description"
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "payment-uuid",
    "amount": 5000,
    "status": "pending",
    "authorization_url": "https://paystack.com/pay/...",
    "reference": "paystack-reference"
  }
}
```

### Verify Payment
```
GET /api/payments/verify?reference=paystack-reference
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "payment-uuid",
    "amount": 5000,
    "status": "completed",
    "paid_at": "2024-01-01T12:00:00Z"
  }
}
```

### Get User Payments
```
GET /api/payments/user/:user_id
Authorization: Bearer <token>
```

### Get Payment by ID
```
GET /api/payments/:id
Authorization: Bearer <token>
```

### Webhook (Paystack)
```
POST /api/payments/webhook
Content-Type: application/json
X-Paystack-Signature: <signature>
```

## Payment Types

- `deposit` - Security deposit
- `rent` - Monthly rent payment
- `application_fee` - Application processing fee
- `service_fee` - Platform service fee

## Payment Flow

1. **User initiates payment** → Frontend calls `/api/payments/initialize`
2. **Backend creates payment record** → Status: `pending`
3. **Paystack payment page** → User redirected to Paystack
4. **User completes payment** → Paystack processes card
5. **Webhook notification** → Paystack sends webhook to backend
6. **Payment verified** → Status updated to `completed`
7. **Frontend polls status** → Checks payment status
8. **Success callback** → `onSuccess` called with payment ID

## Testing

### Test Cards (Paystack)
Use these test cards for testing:

- **Successful Payment**: `4084084084084081`
- **Declined Payment**: `5060666666666666666`
- **Insufficient Funds**: `5060666666666666667`

**Test Details:**
- CVV: Any 3 digits
- Expiry: Any future date
- PIN: Any 4 digits

### Test Mode
1. Use test API keys (`sk_test_...`)
2. Payments won't charge real money
3. Test all payment scenarios
4. Verify webhook handling

## Production Checklist

- [ ] Switch to live Paystack keys
- [ ] Update `PAYSTACK_CALLBACK_URL` to production URL
- [ ] Configure webhook URL in Paystack dashboard
- [ ] Test webhook signature verification
- [ ] Set up payment email notifications
- [ ] Configure payment success/failure redirects
- [ ] Set up monitoring and logging
- [ ] Review security settings
- [ ] Test all payment types
- [ ] Set up backup payment methods

## Webhook Configuration

1. Go to Paystack Dashboard → **Settings** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Select events: `charge.success`, `charge.failed`
4. Copy webhook secret (if available)
5. Test webhook delivery

## Security Best Practices

1. **Never expose secret keys** in frontend code
2. **Use HTTPS** in production
3. **Verify webhook signatures** (implement in production)
4. **Validate payment amounts** server-side
5. **Log all payment attempts** for audit
6. **Implement rate limiting** on payment endpoints
7. **Use environment variables** for all secrets
8. **Regular security audits**

## Troubleshooting

### Payment Not Initializing
- Check Paystack API keys are correct
- Verify backend server is running
- Check CORS settings
- Review server logs for errors

### Payment Not Verifying
- Check webhook URL is accessible
- Verify webhook is configured in Paystack
- Check payment reference is correct
- Review database for payment records

### Webhook Not Working
- Verify webhook URL is publicly accessible
- Check webhook signature verification
- Review Paystack webhook logs
- Test webhook with Paystack test tool

## Alternative Payment Gateways

If you want to use a different gateway, you can modify `paymentController.js`:

- **Stripe**: Similar API structure
- **PayPal**: Different integration approach
- **PayFast**: South African alternative
- **Flutterwave**: African-focused gateway

## Support

- **Paystack Documentation**: [https://paystack.com/docs](https://paystack.com/docs)
- **Paystack Support**: support@paystack.com
- **API Reference**: [https://paystack.com/docs/api](https://paystack.com/docs/api)

## Cost Information

- **Paystack Fees**: 
  - Local cards: 1.5% + ₦100 (Nigeria) / R2.50 (South Africa)
  - International cards: 3.9% + ₦100 / R2.50
  - Bank transfers: 1.5% + ₦100 / R2.50
- **No setup fees**
- **No monthly fees**
- **Transparent pricing**

---

**Your payment gateway is ready!** 🎉

Follow the setup steps above to start accepting payments on your Kasi-Rent platform.

