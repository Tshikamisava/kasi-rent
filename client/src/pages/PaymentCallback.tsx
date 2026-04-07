import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  CreditCard,
  ReceiptText,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

const planLabels: Record<string, string> = {
  starter: "Starter Boost",
  pro: "Growth Pro",
  premium: "Premium Max",
  service_fee: "Subscription",
};

export default function PaymentCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(8);

  const status = params.get("status");
  const amount = params.get("amount");
  const currency = params.get("currency") || "ZAR";
  const type = params.get("type") || "";
  const subscriptionId = params.get("subscriptionId");
  const isSuccess = status === "success";
  const isSubscription = !!subscriptionId || type === "service_fee";

  // Auto-redirect to subscriptions page on success
  useEffect(() => {
    if (!isSuccess) return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          navigate(isSubscription ? "/subscriptions" : "/payments");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSuccess, isSubscription, navigate]);

  const formattedAmount = amount
    ? `${currency} ${parseFloat(amount).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`
    : null;

  const planLabel = planLabels[type] || planLabels[params.get("plan") || ""] || "Subscription";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-md shadow-lg border">
          <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center gap-6 text-center">

            {/* Icon */}
            {isSuccess ? (
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle2 className="h-14 w-14 text-green-600" />
              </div>
            ) : (
              <div className="rounded-full bg-red-100 p-4">
                <XCircle className="h-14 w-14 text-red-500" />
              </div>
            )}

            {/* Heading */}
            <div>
              <h1 className="text-2xl font-bold mb-1">
                {isSuccess ? "Payment Successful!" : "Payment Failed"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {isSuccess
                  ? isSubscription
                    ? `Your ${planLabel} plan is now active.`
                    : "Your payment has been processed successfully."
                  : "Something went wrong with your payment. No funds have been taken."}
              </p>
            </div>

            {/* Amount badge */}
            {isSuccess && formattedAmount && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-green-800 text-sm font-medium">
                <ReceiptText className="h-4 w-4" />
                {formattedAmount} paid
              </div>
            )}

            {/* How payment works callout */}
            {isSuccess && (
              <div className="w-full bg-muted/40 rounded-xl p-4 text-left text-sm text-muted-foreground space-y-2">
                <div className="flex items-start gap-2">
                  <CreditCard className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  <span>
                    Your card or bank details were securely handled by{" "}
                    <strong>Paystack</strong>. KasiRent never stores your payment
                    information.
                  </span>
                </div>
                {isSubscription && (
                  <div className="flex items-start gap-2">
                    <RefreshCw className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                    <span>
                      Your subscription renews automatically every 30 days. You can
                      cancel anytime from{" "}
                      <Link
                        to="/subscriptions"
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        My Subscriptions
                      </Link>
                      .
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Auto-redirect notice */}
            {isSuccess && (
              <p className="text-xs text-muted-foreground">
                Redirecting to {isSubscription ? "My Subscriptions" : "Payments"} in{" "}
                <span className="font-semibold text-foreground">{countdown}s</span>…
              </p>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2 w-full">
              {isSuccess ? (
                <>
                  <Button asChild className="w-full">
                    <Link to={isSubscription ? "/subscriptions" : "/payments"}>
                      {isSubscription ? "View My Subscriptions" : "View Payments"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/">Back to Home</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="w-full"
                    onClick={() => navigate("/#subscription-plans")}
                  >
                    Try Again
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/">Back to Home</Link>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    If you believe this is an error, please contact{" "}
                    <Link
                      to="/help"
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      support
                    </Link>
                    .
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
