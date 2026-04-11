import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { CalendarDays, CreditCard, Loader2, RefreshCw, ReceiptText, CheckCircle, ArrowUpCircle, Clock } from "lucide-react";

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

type FilterStatus = "all" | Subscription["status"];

const PLAN_FEATURES: Record<string, string[]> = {
  starter_monthly: [
    "Boost 1 active listing",
    "Priority placement in marketplace highlights",
    "Basic response insights",
  ],
  growth_monthly: [
    "Boost up to 3 listings",
    "Featured placement in searches",
    "Priority landlord support",
  ],
  premium_monthly: [
    "Boost up to 10 listings",
    "Premium placement and badges",
    "Advanced listing performance analytics",
  ],
  market_monthly: [
    "Marketplace listing visibility",
    "Priority placement",
    "Basic analytics",
  ],
};

const PLAN_UPGRADE: Record<string, string> = {
  starter_monthly: "growth_monthly",
  growth_monthly: "premium_monthly",
};

const statusBadgeVariant = (status: Subscription["status"]) => {
  switch (status) {
    case "active":   return "default" as const;
    case "pending":  return "secondary" as const;
    case "past_due": return "destructive" as const;
    case "cancelled":
    case "expired":  return "outline" as const;
    default:         return "outline" as const;
  }
};

const formatPlanName = (plan: string) =>
  plan
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

/** Safely format a date value — returns fallback string if invalid */
const formatDate = (value: string | null | undefined, options?: Intl.DateTimeFormatOptions): string => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-ZA", options ?? { day: "2-digit", month: "short", year: "numeric" });
};

/** Compute estimated renewal date as created_at + 30 days */
const getRenewalDate = (createdAt: string | null | undefined): string => {
  if (!createdAt) return "—";
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return "—";
  d.setDate(d.getDate() + 30);
  return d.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
};

/** Days remaining until renewal */
const getDaysRemaining = (createdAt: string | null | undefined): number | null => {
  if (!createdAt) return null;
  const created = new Date(createdAt);
  if (isNaN(created.getTime())) return null;
  const renewal = new Date(created);
  renewal.setDate(renewal.getDate() + 30);
  const diff = Math.ceil((renewal.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
};

export default function MySubscriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [cancelling, setCancelling] = useState<string | number | null>(null);
  const [reactivating, setReactivating] = useState<string | number | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const isAdmin = user?.role === 'admin';

  const groupedStats = useMemo(() => ({
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.status === "active").length,
    pending: subscriptions.filter((s) => s.status === "pending").length,
    pastDue: subscriptions.filter((s) => s.status === "past_due").length,
  }), [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    if (filter === "all") return subscriptions;
    return subscriptions.filter((s) => s.status === filter);
  }, [subscriptions, filter]);

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
      if (!response.ok) throw new Error(data?.error || data?.message || "Failed to load subscriptions");
      setSubscriptions(data?.subscriptions || []);
    } catch (error) {
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
      setCancelling(subscriptionId);
      const response = await apiFetch(`/api/subscriptions/${subscriptionId}/cancel`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || data?.error || 'Failed to cancel subscription');
      toast({ title: 'Subscription cancelled', description: 'Your subscription has been cancelled.' });
      await fetchSubscriptions(true);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Cancel failed', description: error instanceof Error ? error.message : 'Unable to cancel.' });
    } finally {
      setCancelling(null);
    }
  };

  const handleReactivate = async (subscriptionId: string | number) => {
    try {
      setReactivating(subscriptionId);
      const response = await apiFetch(`/api/subscriptions/${subscriptionId}/reactivate`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || data?.error || 'Failed to reactivate subscription');
      toast({ title: 'Subscription reactivated', description: 'Your subscription is active again.' });
      await fetchSubscriptions(true);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Reactivate failed', description: error instanceof Error ? error.message : 'Unable to reactivate.' });
    } finally {
      setReactivating(null);
    }
  };

  const handleCleanupMock = async () => {
    try {
      setCleaning(true);
      const response = await apiFetch('/api/subscriptions/admin/cleanup-mock?all=true', { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || data?.error || 'Failed to clean mock subscriptions');
      toast({ title: 'Cleanup complete', description: data?.message || `Deleted ${data?.deleted || 0} record(s).` });
      await fetchSubscriptions(true);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Cleanup failed', description: error instanceof Error ? error.message : 'Unable to clean.' });
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

        {/* Header */}
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
            <Button onClick={() => navigate('/#subscription-plans')}>
              <CreditCard className="mr-2 h-4 w-4" />
              View Plans
            </Button>
          </div>
        </div>

        {/* Stat cards — clicking filters the list below */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {([
            { label: "Total", value: groupedStats.total, filterVal: "all" as FilterStatus, color: "text-foreground" },
            { label: "Active", value: groupedStats.active, filterVal: "active" as FilterStatus, color: "text-emerald-600" },
            { label: "Pending", value: groupedStats.pending, filterVal: "pending" as FilterStatus, color: "text-amber-600" },
            { label: "Past Due", value: groupedStats.pastDue, filterVal: "past_due" as FilterStatus, color: "text-rose-600" },
          ] as const).map(({ label, value, filterVal, color }) => (
            <Card
              key={label}
              className={`cursor-pointer transition-all hover:shadow-md ${filter === filterVal ? "ring-2 ring-primary" : ""}`}
              onClick={() => setFilter(filter === filterVal && filterVal !== "all" ? "all" : filterVal)}
            >
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                {filter === filterVal && filterVal !== "all" && (
                  <p className="text-xs text-primary mt-1">Filtered ✓</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter pills */}
        {filter !== "all" && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Showing:</span>
            <Badge variant="secondary" className="capitalize">{filter.replace("_", " ")}</Badge>
            <button className="text-xs text-primary underline" onClick={() => setFilter("all")}>Clear filter</button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading subscriptions...
            </CardContent>
          </Card>

        /* Empty state */
        ) : subscriptions.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold mb-1">No subscriptions yet</p>
              <p className="text-muted-foreground mb-6">Subscribe to a plan to boost your property listings and get more tenants.</p>
              <Button onClick={() => navigate('/#subscription-plans')}>
                <CreditCard className="mr-2 h-4 w-4" />
                Choose a plan
              </Button>
            </CardContent>
          </Card>

        /* Filtered empty */
        ) : filteredSubscriptions.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">No <span className="capitalize font-medium">{filter.replace("_", " ")}</span> subscriptions found.</p>
              <button className="text-sm text-primary underline mt-2" onClick={() => setFilter("all")}>Show all</button>
            </CardContent>
          </Card>

        /* Subscription cards */
        ) : (
          <div className="space-y-4">
            {filteredSubscriptions.map((sub) => {
              const daysLeft = sub.status === "active" ? getDaysRemaining(sub.created_at) : null;
              const features = PLAN_FEATURES[sub.plan] ?? [];
              const canUpgrade = sub.status === "active" && !!PLAN_UPGRADE[sub.plan];

              return (
                <Card key={sub.id} className="overflow-hidden">
                  {/* Coloured top stripe based on status */}
                  <div className={`h-1 w-full ${sub.status === "active" ? "bg-emerald-500" : sub.status === "pending" ? "bg-amber-400" : sub.status === "past_due" ? "bg-rose-500" : "bg-gray-300"}`} />

                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle className="text-xl">{formatPlanName(sub.plan)}</CardTitle>
                        {sub.status === "active" && daysLeft !== null && (
                          <p className={`text-xs mt-0.5 flex items-center gap-1 ${daysLeft <= 5 ? "text-rose-500" : "text-muted-foreground"}`}>
                            <Clock className="h-3 w-3" />
                            {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} until renewal` : "Renews today"}
                          </p>
                        )}
                      </div>
                      <Badge variant={statusBadgeVariant(sub.status)} className="self-start md:self-auto capitalize">
                        {sub.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Details row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-semibold">R{Number(sub.amount).toLocaleString("en-ZA")} / month</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Provider</p>
                        <p className="font-semibold capitalize">{sub.provider || "paystack"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reference</p>
                        <p className="font-semibold break-all text-xs">{sub.provider_reference || "—"}</p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Started: <span className="font-medium text-foreground ml-1">{formatDate(sub.created_at)}</span>
                      </span>
                      {(sub.status === "active" || sub.status === "pending") && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Next renewal: <span className="font-medium text-foreground ml-1">{getRenewalDate(sub.created_at)}</span>
                        </span>
                      )}
                      {(sub.status === "cancelled" || sub.status === "expired") && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Ended: <span className="font-medium text-foreground ml-1">{formatDate(sub.updated_at)}</span>
                        </span>
                      )}
                    </div>

                    {/* Plan features */}
                    {features.length > 0 && (
                      <div className="mt-4 p-3 rounded-lg bg-muted/40 space-y-1.5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Plan includes</p>
                        {features.map((f) => (
                          <p key={f} className="text-xs flex items-center gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            {f}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(sub.status === "active" || sub.status === "pending") && (
                        <Button
                          variant="outline"
                          className="border-rose-200 text-rose-600 hover:bg-rose-50"
                          onClick={() => handleCancel(sub.id)}
                          disabled={cancelling === sub.id}
                        >
                          {cancelling === sub.id ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                          Cancel subscription
                        </Button>
                      )}

                      {(sub.status === "cancelled" || sub.status === "expired" || sub.status === "past_due") && (
                        <Button
                          onClick={() => handleReactivate(sub.id)}
                          disabled={reactivating === sub.id}
                        >
                          {reactivating === sub.id ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                          Renew / Reactivate
                        </Button>
                      )}

                      {canUpgrade && (
                        <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/5" onClick={() => navigate('/#subscription-plans')}>
                          <ArrowUpCircle className="mr-2 h-3.5 w-3.5" />
                          Upgrade plan
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
