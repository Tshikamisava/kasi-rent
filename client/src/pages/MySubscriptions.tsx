import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { CalendarDays, CreditCard, Loader2, RefreshCw, ReceiptText } from "lucide-react";

interface Subscription {
  id: string | number;
  plan: string;
  amount: number;
  currency: string;
  status: "pending" | "active" | "cancelled" | "expired" | "past_due";
  provider?: string;
  provider_reference?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

const statusBadgeVariant = (status: Subscription["status"]) => {
  switch (status) {
    case "active":
      return "default" as const;
    case "pending":
      return "secondary" as const;
    case "past_due":
      return "destructive" as const;
    case "cancelled":
    case "expired":
      return "outline" as const;
    default:
      return "outline" as const;
  }
};

const formatPlanName = (plan: string) =>
  plan
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function MySubscriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const isAdmin = user?.role === 'admin';

  const groupedStats = useMemo(() => {
    return {
      total: subscriptions.length,
      active: subscriptions.filter((s) => s.status === "active").length,
      pending: subscriptions.filter((s) => s.status === "pending").length,
      pastDue: subscriptions.filter((s) => s.status === "past_due").length,
    };
  }, [subscriptions]);

  const fetchSubscriptions = async (isRefresh = false) => {
    if (!user?.id && !user?._id) {
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) setRefreshing(true);
      const userId = user.id || user._id;
      const response = await apiFetch(`/api/subscriptions/user/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Failed to load subscriptions");
      }

      setSubscriptions(data?.subscriptions || []);
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
      toast({
        variant: "destructive",
        title: "Unable to load subscriptions",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancel = async (subscriptionId: string | number) => {
    try {
      const response = await apiFetch(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Failed to cancel subscription');
      }

      toast({ title: 'Subscription cancelled', description: 'Your subscription has been cancelled.' });
      await fetchSubscriptions(true);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Cancel failed',
        description: error instanceof Error ? error.message : 'Unable to cancel subscription.',
      });
    }
  };

  const handleReactivate = async (subscriptionId: string | number) => {
    try {
      const response = await apiFetch(`/api/subscriptions/${subscriptionId}/reactivate`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Failed to reactivate subscription');
      }

      toast({ title: 'Subscription reactivated', description: 'Your subscription is active again.' });
      await fetchSubscriptions(true);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Reactivate failed',
        description: error instanceof Error ? error.message : 'Unable to reactivate subscription.',
      });
    }
  };

  const handleCleanupMock = async () => {
    try {
      setCleaning(true);
      const response = await apiFetch('/api/subscriptions/admin/cleanup-mock?all=true', {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Failed to clean mock subscriptions');
      }

      toast({
        title: 'Cleanup complete',
        description: data?.message || `Deleted ${data?.deleted || 0} record(s).`,
      });

      await fetchSubscriptions(true);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Cleanup failed',
        description: error instanceof Error ? error.message : 'Unable to clean mock subscriptions.',
      });
    } finally {
      setCleaning(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?._id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      <div className="container mx-auto px-6 pt-24 pb-12">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ReceiptText className="h-7 w-7 text-primary" />
              My Subscriptions
            </h1>
            <p className="text-muted-foreground mt-1">
              View your plan history and current subscription status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => fetchSubscriptions(true)} disabled={refreshing}>
              {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
            {isAdmin && (
              <Button variant="outline" onClick={handleCleanupMock} disabled={cleaning || refreshing}>
                {cleaning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Clean mock pending
              </Button>
            )}
            <Link to="/#subscription-plans">
              <Button>
                <CreditCard className="mr-2 h-4 w-4" />
                View Plans
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{groupedStats.total}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Active</p><p className="text-2xl font-bold text-emerald-600">{groupedStats.active}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-bold text-amber-600">{groupedStats.pending}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Past Due</p><p className="text-2xl font-bold text-rose-600">{groupedStats.pastDue}</p></CardContent></Card>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading subscriptions...
            </CardContent>
          </Card>
        ) : subscriptions.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground mb-4">You don’t have any subscriptions yet.</p>
              <Link to="/#subscription-plans">
                <Button>Choose a plan</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <Card key={subscription.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <CardTitle className="text-xl">{formatPlanName(subscription.plan)}</CardTitle>
                    <Badge variant={statusBadgeVariant(subscription.status)}>{subscription.status.replace("_", " ")}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-semibold">R{Number(subscription.amount).toLocaleString()} / month</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Provider</p>
                      <p className="font-semibold">{subscription.provider || "paystack"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reference</p>
                      <p className="font-semibold break-all">{subscription.provider_reference || "—"}</p>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Created: {new Date(subscription.created_at).toLocaleString()}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(subscription.status === 'active' || subscription.status === 'pending') && (
                      <Button
                        variant="outline"
                        className="border-rose-200 text-rose-600 hover:bg-rose-50"
                        onClick={() => handleCancel(subscription.id)}
                      >
                        Cancel subscription
                      </Button>
                    )}

                    {(subscription.status === 'cancelled' || subscription.status === 'expired' || subscription.status === 'past_due') && (
                      <Button onClick={() => handleReactivate(subscription.id)}>
                        Renew / Reactivate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
