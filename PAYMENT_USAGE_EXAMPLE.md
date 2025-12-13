# Payment Gateway Usage Examples

## Quick Start

### 1. Basic Payment Button

```tsx
import { PaymentButton } from "@/components/PaymentButton";

function PropertyCard({ property }) {
  return (
    <PaymentButton
      amount={property.price}
      propertyId={property.id}
      propertyTitle={property.title}
      paymentType="deposit"
      onSuccess={(paymentId) => {
        console.log("Payment successful:", paymentId);
        // Redirect or show success message
      }}
    />
  );
}
```

### 2. Custom Payment Form

```tsx
import { PaymentForm } from "@/components/PaymentForm";
import { useState } from "react";
import { Button } from "@/components/ui/button";

function CheckoutPage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Complete Payment
      </Button>

      <PaymentForm
        open={open}
        onOpenChange={setOpen}
        amount={5000}
        propertyId="property-uuid"
        propertyTitle="Beautiful Apartment"
        paymentType="rent"
        onSuccess={(paymentId) => {
          // Handle success
          router.push(`/payment-success/${paymentId}`);
        }}
      />
    </>
  );
}
```

### 3. Payment in Property Listing

```tsx
import { PaymentButton } from "@/components/PaymentButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function PropertyDetails({ property }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{property.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Price: R{property.price}/month</p>
        <p>Deposit: R{property.price * 2}</p>
        
        <div className="mt-4 space-y-2">
          <PaymentButton
            amount={property.price}
            propertyId={property.id}
            propertyTitle={property.title}
            paymentType="rent"
            variant="default"
            className="w-full"
          />
          
          <PaymentButton
            amount={property.price * 2}
            propertyId={property.id}
            propertyTitle={property.title}
            paymentType="deposit"
            variant="outline"
            className="w-full"
          >
            Pay Deposit
          </PaymentButton>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4. Payment History

```tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function PaymentHistory() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const token = user?.token || localStorage.getItem("token");

        const response = await fetch(
          `${apiUrl}/api/payments/user/${user?._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (data.success) {
          setPayments(data.payments);
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchPayments();
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Payment History</h2>
      {payments.map((payment) => (
        <Card key={payment.id}>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>R{payment.amount}</span>
              <span
                className={`text-sm ${
                  payment.status === "completed"
                    ? "text-green-600"
                    : payment.status === "failed"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {payment.status}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {payment.payment_type.replace("_", " ")} • {payment.description}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(payment.created_at).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### 5. Payment Status Check

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function PaymentStatusChecker() {
  const [reference, setReference] = useState("");
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(
        `${apiUrl}/api/payments/verify?reference=${reference}`
      );
      const data = await response.json();
      setPayment(data.payment);
    } catch (error) {
      console.error("Error checking status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Enter payment reference"
        value={reference}
        onChange={(e) => setReference(e.target.value)}
      />
      <Button onClick={checkStatus} disabled={loading || !reference}>
        Check Status
      </Button>

      {payment && (
        <div>
          <p>Status: {payment.status}</p>
          <p>Amount: R{payment.amount}</p>
        </div>
      )}
    </div>
  );
}
```

## Payment Types

### Deposit Payment
```tsx
<PaymentButton
  amount={property.price * 2}
  paymentType="deposit"
  propertyId={property.id}
  propertyTitle={property.title}
/>
```

### Rent Payment
```tsx
<PaymentButton
  amount={property.price}
  paymentType="rent"
  propertyId={property.id}
  propertyTitle={property.title}
/>
```

### Application Fee
```tsx
<PaymentButton
  amount={500}
  paymentType="application_fee"
  propertyId={property.id}
  propertyTitle={property.title}
/>
```

### Service Fee
```tsx
<PaymentButton
  amount={200}
  paymentType="service_fee"
  propertyId={property.id}
  propertyTitle={property.title}
/>
```

## Styling Examples

### Full Width Button
```tsx
<PaymentButton
  amount={5000}
  className="w-full"
  variant="default"
/>
```

### Outline Button
```tsx
<PaymentButton
  amount={5000}
  variant="outline"
/>
```

### Small Button
```tsx
<PaymentButton
  amount={5000}
  size="sm"
/>
```

### Custom Content
```tsx
<PaymentButton
  amount={5000}
>
  <span>Pay R5,000</span>
</PaymentButton>
```

## Integration with Property Pages

### In Property Details Page
```tsx
// pages/PropertyDetails.tsx
import { PaymentButton } from "@/components/PaymentButton";
import { useParams } from "react-router-dom";

export function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);

  // Fetch property...

  return (
    <div>
      <h1>{property.title}</h1>
      <p>R{property.price}/month</p>
      
      <PaymentButton
        amount={property.price}
        propertyId={property.id}
        propertyTitle={property.title}
        paymentType="rent"
        onSuccess={(paymentId) => {
          // Show success message or redirect
          toast.success("Payment successful!");
        }}
      />
    </div>
  );
}
```

## Error Handling

```tsx
<PaymentForm
  open={open}
  onOpenChange={setOpen}
  amount={amount}
  onSuccess={(paymentId) => {
    // Success handler
  }}
  // The component handles errors internally and shows toast notifications
/>
```

## Best Practices

1. **Always validate amounts** before showing payment form
2. **Show payment summary** before processing
3. **Handle success/failure** appropriately
4. **Store payment references** for tracking
5. **Provide payment history** to users
6. **Send confirmation emails** after successful payment
7. **Update property status** after deposit payment
8. **Log all payment attempts** for audit

---

For more details, see `PAYMENT_GATEWAY_SETUP.md`

