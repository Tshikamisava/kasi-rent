import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { CreditCard, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  propertyId?: string;
  propertyTitle?: string;
  paymentType?: "deposit" | "rent" | "application_fee" | "service_fee";
  onSuccess?: (paymentId: string) => void;
}

export const PaymentForm = ({
  open,
  onOpenChange,
  amount,
  propertyId,
  propertyTitle,
  paymentType = "rent",
  onSuccess,
}: PaymentFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [formData, setFormData] = useState({
    email: user?.email || "",
    name: user?.name || "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        name: user.name || "",
        phone: "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPaymentStatus("processing");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = user?.token || localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/api/payments/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          amount: amount,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          property_id: propertyId,
          payment_type: paymentType,
          description: `Payment for ${propertyTitle || paymentType}`,
          metadata: {
            property_title: propertyTitle,
            user_id: user?._id,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to initialize payment");
      }

      if (data.success && data.payment) {
        // If Paystack is configured, redirect to payment page
        if (data.payment.authorization_url) {
          // Open Paystack payment page in new window or redirect
          window.location.href = data.payment.authorization_url;
          
          // Poll for payment status
          pollPaymentStatus(data.payment.reference);
        } else {
          // Payment gateway not configured - show message
          toast({
            title: "Payment Gateway Not Configured",
            description: "Please configure PAYSTACK_SECRET_KEY in server environment variables.",
            variant: "destructive",
          });
          setPaymentStatus("failed");
        }
      }
    } catch (error: any) {
      console.error("Payment Error:", error);
      setPaymentStatus("failed");
      toast({
        title: "Payment Failed",
        description: error.message || "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (reference: string) => {
    const maxAttempts = 30; // 30 attempts = 30 seconds
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/payments/verify?reference=${reference}`);
        const data = await response.json();

        if (data.success && data.payment?.status === "completed") {
          setPaymentStatus("success");
          toast({
            title: "Payment Successful!",
            description: "Your payment has been processed successfully.",
          });
          
          if (onSuccess) {
            onSuccess(data.payment.id);
          }
          
          // Close dialog after 2 seconds
          setTimeout(() => {
            onOpenChange(false);
            setPaymentStatus("idle");
          }, 2000);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 1000); // Check every second
        } else {
          setPaymentStatus("failed");
          toast({
            title: "Payment Timeout",
            description: "Payment verification timed out. Please check your payment status.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Status check error:", error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 1000);
        }
      }
    };

    checkStatus();
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment
          </DialogTitle>
          <DialogDescription>
            Secure payment processing via Paystack
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {propertyTitle && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Property:</span>
                  <span className="font-medium">{propertyTitle}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Type:</span>
                <span className="font-medium capitalize">{paymentType.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total Amount:</span>
                <span className="text-primary">{formatAmount(amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          {paymentStatus === "processing" && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Processing Payment...
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Please complete the payment on the next page.
                </p>
              </div>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  Payment Successful!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your payment has been processed successfully.
                </p>
              </div>
            </div>
          )}

          {paymentStatus === "failed" && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-100">
                  Payment Failed
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Please try again or contact support.
                </p>
              </div>
            </div>
          )}

          {/* Payment Form */}
          {paymentStatus === "idle" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+27 12 345 6789"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay {formatAmount(amount)}
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Your payment is secured by Paystack. We never store your card details.
              </p>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

