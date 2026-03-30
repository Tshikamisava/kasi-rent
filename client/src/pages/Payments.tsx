import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentForm } from "@/components/PaymentForm";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from '@/lib/api';
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
  Globe,
  User,
  Home,
  Loader2
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

  // Tenant payment form state
  const [tenantPayment, setTenantPayment] = useState({
    tenantName: user?.name || "",
    tenantEmail: user?.email || "",
    tenantPhone: "",
    landlordName: "",
    propertyTitle: "",
    propertyId: "",
    amount: "",
    paymentType: "rent" as "deposit" | "rent" | "application_fee" | "service_fee",
    description: "",
  });
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentResult, setPaymentResult] = useState<"idle" | "success" | "failed">("idle");

  useEffect(() => {
    if (user) {
      setTenantPayment(prev => ({
        ...prev,
        tenantName: user.name || "",
        tenantEmail: user.email || "",
      }));
    }
  }, [user]);

  const handleTenantPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantPayment.tenantEmail || !tenantPayment.tenantName || !tenantPayment.amount) {
      toast({ title: "Missing fields", description: "Please fill in your name, email and amount.", variant: "destructive" });
      return;
    }
    const amountNum = parseFloat(tenantPayment.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid payment amount.", variant: "destructive" });
      return;
    }
    setPaymentSubmitting(true);
    setPaymentResult("idle");
    try {
      const res = await apiFetch('/api/payments/initialize', {
        method: 'POST',
        body: JSON.stringify({
          amount: amountNum,
          email: tenantPayment.tenantEmail,
          name: tenantPayment.tenantName,
          phone: tenantPayment.tenantPhone,
          property_id: tenantPayment.propertyId || undefined,
          payment_type: tenantPayment.paymentType,
          description: tenantPayment.description ||
            `${tenantPayment.paymentType.replace(/_/g, ' ')} payment${tenantPayment.propertyTitle ? ` for ${tenantPayment.propertyTitle}` : ''}`,
          metadata: {
            landlord_name: tenantPayment.landlordName,
            property_title: tenantPayment.propertyTitle,
            user_id: user?._id,
          },
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to initialize payment");
      if (data.success && data.payment?.authorization_url) {
        window.location.href = data.payment.authorization_url;
      } else {
        setPaymentResult("success");
        toast({ title: "Payment initiated", description: "Your payment has been recorded." });
        fetchPayments();
      }
    } catch (err: any) {
      setPaymentResult("failed");
      toast({ title: "Payment failed", description: err.message || "Unable to process payment.", variant: "destructive" });
    } finally {
      setPaymentSubmitting(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      const res = await apiFetch(`/api/payments/user/${user?._id}`);
      const data = await res.json();
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
              <Card className="border-2 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 p-6">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <CreditCard className="h-6 w-6 text-primary" />
                      Tenant Payment Details
                    </CardTitle>
                    <CardDescription className="text-base">
                      Enter your details and the payment information to pay your landlord
                    </CardDescription>
                  </CardHeader>
                </div>
                <CardContent className="p-6">
                  {paymentResult === "success" && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg mb-6">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">Payment Initiated!</p>
                        <p className="text-sm text-green-700 dark:text-green-300">Your payment has been recorded.</p>
                      </div>
                    </div>
                  )}
                  {paymentResult === "failed" && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950 rounded-lg mb-6">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <p className="font-medium text-red-900 dark:text-red-100">Payment failed. Please try again.</p>
                    </div>
                  )}
                  <form onSubmit={handleTenantPaymentSubmit} className="space-y-6">
                    {/* Tenant Details */}
                    <div>
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Your Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tenantName">Full Name *</Label>
                          <Input
                            id="tenantName"
                            placeholder="Your full name"
                            value={tenantPayment.tenantName}
                            onChange={(e) => setTenantPayment(p => ({ ...p, tenantName: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tenantEmail">Email Address *</Label>
                          <Input
                            id="tenantEmail"
                            type="email"
                            placeholder="your@email.com"
                            value={tenantPayment.tenantEmail}
                            onChange={(e) => setTenantPayment(p => ({ ...p, tenantEmail: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tenantPhone">Phone Number</Label>
                          <Input
                            id="tenantPhone"
                            type="tel"
                            placeholder="+27 XX XXX XXXX"
                            value={tenantPayment.tenantPhone}
                            onChange={(e) => setTenantPayment(p => ({ ...p, tenantPhone: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Property / Landlord Details */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Home className="h-5 w-5 text-primary" />
                        Property & Landlord Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="landlordName">Landlord Name</Label>
                          <Input
                            id="landlordName"
                            placeholder="Landlord's full name"
                            value={tenantPayment.landlordName}
                            onChange={(e) => setTenantPayment(p => ({ ...p, landlordName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="propertyTitle">Property Name / Address</Label>
                          <Input
                            id="propertyTitle"
                            placeholder="e.g. Flat 3B, Sandton Complex"
                            value={tenantPayment.propertyTitle}
                            onChange={(e) => setTenantPayment(p => ({ ...p, propertyTitle: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="propertyId">Property ID (optional)</Label>
                          <Input
                            id="propertyId"
                            placeholder="Property ID from listing"
                            value={tenantPayment.propertyId}
                            onChange={(e) => setTenantPayment(p => ({ ...p, propertyId: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Payment Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="paymentType">Payment Type *</Label>
                          <Select
                            value={tenantPayment.paymentType}
                            onValueChange={(val) => setTenantPayment(p => ({ ...p, paymentType: val as any }))}
                          >
                            <SelectTrigger id="paymentType">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rent">Monthly Rent</SelectItem>
                              <SelectItem value="deposit">Security Deposit</SelectItem>
                              <SelectItem value="application_fee">Application Fee</SelectItem>
                              <SelectItem value="service_fee">Service Fee</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount (ZAR) *</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R</span>
                            <Input
                              id="amount"
                              type="number"
                              min="1"
                              step="0.01"
                              placeholder="0.00"
                              className="pl-7"
                              value={tenantPayment.amount}
                              onChange={(e) => setTenantPayment(p => ({ ...p, amount: e.target.value }))}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="description">Description (optional)</Label>
                          <Input
                            id="description"
                            placeholder="e.g. March 2026 rent payment"
                            value={tenantPayment.description}
                            onChange={(e) => setTenantPayment(p => ({ ...p, description: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    {tenantPayment.amount && parseFloat(tenantPayment.amount) > 0 && (
                      <div className="border rounded-lg p-4 bg-muted/30">
                        <h4 className="font-semibold mb-2">Payment Summary</h4>
                        <div className="space-y-1 text-sm">
                          {tenantPayment.propertyTitle && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Property:</span>
                              <span>{tenantPayment.propertyTitle}</span>
                            </div>
                          )}
                          {tenantPayment.landlordName && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Landlord:</span>
                              <span>{tenantPayment.landlordName}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="capitalize">{tenantPayment.paymentType.replace(/_/g, ' ')}</span>
                          </div>
                          <div className="flex justify-between font-bold text-base pt-1 border-t">
                            <span>Total:</span>
                            <span className="text-primary">
                              {new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(parseFloat(tenantPayment.amount))}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={paymentSubmitting}
                    >
                      {paymentSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Pay via Paystack
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Secured by Paystack · SSL encrypted · PCI compliant
                    </p>
                  </form>
                </CardContent>
              </Card>
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
