import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentForm } from "./PaymentForm";
import { CreditCard } from "lucide-react";

interface PaymentButtonProps {
  amount: number;
  propertyId?: string;
  propertyTitle?: string;
  paymentType?: "deposit" | "rent" | "application_fee" | "service_fee";
  onSuccess?: (paymentId: string) => void;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export const PaymentButton = ({
  amount,
  propertyId,
  propertyTitle,
  paymentType = "rent",
  onSuccess,
  variant = "default",
  size = "default",
  className,
  children,
}: PaymentButtonProps) => {
  const [paymentOpen, setPaymentOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setPaymentOpen(true)}
        variant={variant}
        size={size}
        className={className}
      >
        {children || (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay Now
          </>
        )}
      </Button>

      <PaymentForm
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        amount={amount}
        propertyId={propertyId}
        propertyTitle={propertyTitle}
        paymentType={paymentType}
        onSuccess={(paymentId) => {
          setPaymentOpen(false);
          if (onSuccess) {
            onSuccess(paymentId);
          }
        }}
      />
    </>
  );
};

