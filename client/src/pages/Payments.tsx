import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentForm } from "@/components/PaymentForm";
import { PaymentButton } from "@/components/PaymentButton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Shield, 
  Lock, 
  CheckCircle2, 
  Clock, 
  XCircle,
  ArrowLeft,
  History,
  Info,
  Sparkles,
  Zap,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Payment Method Logos as SVG Components
const VisaLogo = () => (
  <svg viewBox="0 0 100 40" className="h-8 w-auto">
    <rect width="100" height="40" fill="#1434CB" rx="4"/>
    <text x="50" y="28" fontSize="20" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold">VISA</text>
  </svg>
);

const MastercardLogo = () => (
  <svg viewBox="0 0 100 60" className="h-10 w-auto">
    <circle cx="30" cy="30" r="20" fill="#EB001B"/>
    <circle cx="50" cy="30" r="20" fill="#F79E1B"/>
    <circle cx="40" cy="30" r="20" fill="#FF5F00" opacity="0.8"/>
  </svg>
);

const AmexLogo = () => (
  <svg viewBox="0 0 100 40" className="h-8 w-auto">
    <rect width="100" height="40" fill="#006FCF" rx="4"/>
    <text x="50" y="28" fontSize="14" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold">AMEX</text>
  </svg>
);

const PaystackLogo = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
      <span className="text-white font-bold text-xs">P</span>
    </div>
    <span className="font-semibold text-sm">Paystack</span>
  </div>
);

export default function Payments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    if (user?._id) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = user?.token || localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/api/payments/user/${user?._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to load payment history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      case "pending":
      case "processing":
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-6 py-12">
        {/* Animated Header */}
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center shadow-lg animate-pulse">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-5 h-5 text-primary animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Secure Payments
              </h1>
              <p className="text-muted-foreground text-lg mt-1">Safe and encrypted payment processing</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="info" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 animate-in fade-in duration-500">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Payment Info
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Payment History
            </TabsTrigger>
            <TabsTrigger value="make-payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Make Payment
            </TabsTrigger>
          </TabsList>

          {/* Payment Information Tab */}
          <TabsContent value="info" className="space-y-8 animate-in fade-in duration-500">
            {/* Payment Methods Showcase */}
            <Card className="overflow-hidden border-2 shadow-xl">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 p-6">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Globe className="h-6 w-6 text-primary" />
                    Accepted Payment Methods
                  </CardTitle>
                  <CardDescription className="text-base">
                    We accept all major payment methods for your convenience
                  </CardDescription>
                </CardHeader>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div 
                    className="flex flex-col items-center justify-center p-6 rounded-xl border-2 hover:border-primary hover:shadow-lg transition-all duration-300 cursor-pointer group animate-in fade-in"
                    style={{ animationDelay: '100ms' }}
                    onMouseEnter={() => setHoveredCard('visa')}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className={cn(
                      "mb-3 transition-transform duration-300",
                      hoveredCard === 'visa' && "scale-110"
                    )}>
                      <VisaLogo />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Visa</span>
                  </div>

                  <div 
                    className="flex flex-col items-center justify-center p-6 rounded-xl border-2 hover:border-primary hover:shadow-lg transition-all duration-300 cursor-pointer group animate-in fade-in"
                    style={{ animationDelay: '200ms' }}
                    onMouseEnter={() => setHoveredCard('mastercard')}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className={cn(
                      "mb-3 transition-transform duration-300",
                      hoveredCard === 'mastercard' && "scale-110"
                    )}>
                      <MastercardLogo />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Mastercard</span>
                  </div>

                  <div 
                    className="flex flex-col items-center justify-center p-6 rounded-xl border-2 hover:border-primary hover:shadow-lg transition-all duration-300 cursor-pointer group animate-in fade-in"
                    style={{ animationDelay: '300ms' }}
                    onMouseEnter={() => setHoveredCard('amex')}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className={cn(
                      "mb-3 transition-transform duration-300",
                      hoveredCard === 'amex' && "scale-110"
                    )}>
                      <AmexLogo />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">American Express</span>
                  </div>

                  <div 
                    className="flex flex-col items-center justify-center p-6 rounded-xl border-2 hover:border-primary hover:shadow-lg transition-all duration-300 cursor-pointer group animate-in fade-in"
                    style={{ animationDelay: '400ms' }}
                    onMouseEnter={() => setHoveredCard('paystack')}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className={cn(
                      "mb-3 transition-transform duration-300",
                      hoveredCard === 'paystack' && "scale-110"
                    )}>
                      <PaystackLogo />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Paystack</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Debit Cards</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Bank Transfers</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Mobile Money</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '100ms' }}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Secure Processing</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    All payments are processed through Paystack, a PCI-compliant payment gateway. Your card details are never stored on our servers.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Encrypted</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    All transactions are encrypted using industry-standard SSL/TLS encryption to protect your financial information.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Instant Confirmation</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Receive instant confirmation of your payment. Payment status is updated in real-time.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Payment Types */}
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Info className="h-6 w-6 text-primary" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Payment Types</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Badge variant="outline" className="p-3 text-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                      Deposit
                    </Badge>
                    <Badge variant="outline" className="p-3 text-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                      Rent
                    </Badge>
                    <Badge variant="outline" className="p-3 text-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                      Application Fee
                    </Badge>
                    <Badge variant="outline" className="p-3 text-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                      Service Fee
                    </Badge>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-lg mb-2">Currency</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 rounded bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">ZAR</span>
                    </div>
                    <p className="text-muted-foreground">All payments are processed in South African Rand (ZAR)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment History Tab */}
          <TabsContent value="history" className="space-y-6 animate-in fade-in duration-500">
            {!user ? (
              <Card className="border-2">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                    <History className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Please sign in to view your payment history.
                  </p>
                  <Link to="/signin">
                    <Button size="lg">Sign In</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : loading ? (
              <Card className="border-2">
                <CardContent className="py-16 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-lg">Loading payment history...</p>
                </CardContent>
              </Card>
            ) : payments.length === 0 ? (
              <Card className="border-2">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <History className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-6 text-lg">
                    You haven't made any payments yet.
                  </p>
                  <Button onClick={() => setPaymentFormOpen(true)} size="lg">
                    Make Your First Payment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {payments.map((payment, index) => (
                  <Card 
                    key={payment.id} 
                    className="border-2 hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-left-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                              <CreditCard className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-bold text-2xl">
                                {formatAmount(parseFloat(payment.amount))}
                              </h3>
                              <Badge className={cn("mt-2", getStatusColor(payment.status))}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(payment.status)}
                                  {payment.status}
                                </span>
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-foreground mb-1">
                            {payment.description || payment.payment_type?.replace("_", " ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.created_at).toLocaleString("en-ZA", {
                              dateStyle: "long",
                              timeStyle: "short",
                            })}
                          </p>
                          {payment.gateway_reference && (
                            <p className="text-xs text-muted-foreground mt-2 font-mono">
                              Reference: {payment.gateway_reference}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Make Payment Tab */}
          <TabsContent value="make-payment" className="space-y-6 animate-in fade-in duration-500">
            {!user ? (
              <Card className="border-2">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                    <CreditCard className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Please sign in to make a payment.
                  </p>
                  <Link to="/signin">
                    <Button size="lg">Sign In</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="border-2 shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 p-6">
                    <CardHeader>
                      <CardTitle className="text-2xl">Make a Payment</CardTitle>
                      <CardDescription className="text-base">
                        Select a payment type and amount to proceed
                      </CardDescription>
                    </CardHeader>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-2 hover:border-primary hover:shadow-xl transition-all duration-300 group cursor-pointer animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '100ms' }}>
                        <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                          <CardTitle className="text-xl flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                            Rent Payment
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <p className="text-sm text-muted-foreground mb-2">Pay your monthly rent</p>
                          <p className="text-2xl font-bold mb-4 text-blue-600">R5,000</p>
                          <PaymentButton
                            amount={5000}
                            paymentType="rent"
                            variant="default"
                            className="w-full group-hover:scale-105 transition-transform"
                          >
                            Pay Rent
                          </PaymentButton>
                        </CardContent>
                      </Card>

                      <Card className="border-2 hover:border-primary hover:shadow-xl transition-all duration-300 group cursor-pointer animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
                        <CardHeader className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                          <CardTitle className="text-xl flex items-center gap-2">
                            <Shield className="h-5 w-5 text-green-600" />
                            Deposit
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <p className="text-sm text-muted-foreground mb-2">Pay security deposit</p>
                          <p className="text-2xl font-bold mb-4 text-green-600">R10,000</p>
                          <PaymentButton
                            amount={10000}
                            paymentType="deposit"
                            variant="default"
                            className="w-full group-hover:scale-105 transition-transform"
                          >
                            Pay Deposit
                          </PaymentButton>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="pt-6 border-t">
                      <p className="text-sm text-muted-foreground mb-4 text-center">
                        Or specify a custom amount:
                      </p>
                      <Button
                        onClick={() => setPaymentFormOpen(true)}
                        variant="outline"
                        size="lg"
                        className="w-full hover:scale-105 transition-transform"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Custom Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Custom Payment Form */}
      <PaymentForm
        open={paymentFormOpen}
        onOpenChange={setPaymentFormOpen}
        amount={0}
        paymentType="rent"
        onSuccess={(paymentId) => {
          toast({
            title: "Payment Successful!",
            description: "Your payment has been processed successfully.",
          });
          fetchPayments();
        }}
      />
    </div>
  );
}
