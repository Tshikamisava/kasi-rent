import { Shield, CreditCard, MessageSquare, CheckCircle, Search, Wallet, Loader2 } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiFetch } from '@/lib/api';
import { formatRand } from '@/lib/currency';

type Feature = {
  icon: typeof Shield;
  title: string;
  description: string;
  link: string | null;
};

type SubscriptionPlan = {
  id: string;
  name: string;
  amount: number;
  badge?: string;
  description: string;
  features: string[];
  cta: string;
};

const features: Feature[] = [
  {
    icon: Shield,
    title: "Verified Properties",
    description: "All listings are verified by our team to ensure authenticity and prevent scams",
    link: "/properties?verified=true",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Safe and encrypted payment processing with instant confirmation",
    link: "/payments",
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description: "Chat directly with landlords through our secure platform - no middleman needed",
    link: "/chat",
  },
  {
    icon: CheckCircle,
    title: "Easy Booking",
    description: "Simple booking process with transparent terms and instant updates",
    link: "/bookings",
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "Find your perfect home with advanced filters and location-based search",
    link: "/properties",
  },
  {
    icon: Wallet,
    title: "Save Money",
    description: "No agent fees or commissions - connect directly and keep more in your pocket",
    link: null,
  },
];

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter_monthly',
    name: 'Starter Boost',
    amount: 49,
    badge: 'Best for new landlords',
    description: 'Give one listing extra visibility and get the essentials for faster tenant responses.',
    features: [
      'Boost 1 active listing',
      'Priority placement in marketplace highlights',
      'Basic response insights',
    ],
    cta: 'Start Starter',
  },
  {
    id: 'growth_monthly',
    name: 'Growth Pro',
    amount: 99,
    badge: 'Most popular',
    description: 'For active landlords who want stronger reach, better support, and more eyes on every listing.',
    features: [
      'Boost up to 3 listings',
      'Featured placement in searches',
      'Priority landlord support',
    ],
    cta: 'Upgrade to Pro',
  },
  {
    id: 'premium_monthly',
    name: 'Premium Max',
    amount: 149,
    badge: 'Full visibility',
    description: 'Ideal for power users managing multiple listings and wanting the strongest visibility across KasiRent.',
    features: [
      'Boost up to 10 listings',
      'Premium placement and badges',
      'Advanced listing performance analytics',
    ],
    cta: 'Go Premium',
  },
];

export const Features = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);

  const scrollToPlans = () => {
    document.getElementById('subscription-plans')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user) {
      toast({
        title: 'Sign in to subscribe',
        description: 'Please sign in first so we can attach your subscription to the right account.',
      });
      navigate('/signin');
      return;
    }

    setCheckoutPlanId(plan.id);

    try {
      const response = await apiFetch('/api/subscriptions/checkout', {
        method: 'POST',
        body: JSON.stringify({
          plan: plan.id,
          amount: plan.amount,
          currency: 'ZAR',
          email: user.email,
          metadata: {
            plan_name: plan.name,
            source: 'home-features',
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const detailedMessage = data?.message || data?.details?.message || data?.details || data?.error;
        throw new Error(detailedMessage || 'Failed to start subscription checkout.');
      }

      const authorizationUrl = data?.payment?.authorization_url || data?.authorization_url;
      if (authorizationUrl) {
        window.location.assign(authorizationUrl);
        return;
      }

      toast({
        title: 'Subscription created',
        description: data?.message || `${plan.name} was created successfully.`,
      });
    } catch (error) {
      console.error('Subscription checkout error:', error);
      toast({
        variant: 'destructive',
        title: 'Subscription checkout failed',
        description: error instanceof Error ? error.message : 'Something went wrong while starting checkout.',
      });
    } finally {
      setCheckoutPlanId(null);
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose KasiRent?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're transforming township rental experiences with transparency, security, and community trust
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} onViewPlans={scrollToPlans} />
          ))}
        </div>

        <div id="subscription-plans" className="mt-10 rounded-3xl border border-border bg-muted/10 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-2xl font-semibold">KasiRent Subscriptions</h3>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Premium landlord plans are now live. Choose a monthly plan to boost visibility, unlock priority support,
                and get more serious tenant eyes on your listings.
              </p>
            </div>
            <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
              Live now
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {subscriptionPlans.map((plan) => {
              const isLoading = checkoutPlanId === plan.id;

              return (
                <div key={plan.id} className="rounded-2xl border border-border bg-background p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-xl font-semibold">{plan.name}</h4>
                      <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    {plan.badge ? (
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {plan.badge}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5">
                    <p className="text-3xl font-bold">{formatRand(plan.amount)}</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>

                  <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="mt-6 w-full" onClick={() => handleSubscribe(plan)} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting checkout...
                      </>
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Secure checkout is handled through KasiRent payments. If checkout fails, confirm the payment gateway is
            configured on the server and try again.
          </p>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({
  feature,
  index,
  onViewPlans,
}: {
  feature: Feature;
  index: number;
  onViewPlans: () => void;
}) => {
  const { ref, isVisible } = useScrollAnimation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    // If this is the Save Money card, toggle the inline calculator
    if (feature.title === 'Save Money') {
      setExpanded((s) => !s);
      return;
    }
    if (feature.link) {
      navigate(feature.link);
    }
  };
  
  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={`p-6 rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg transition-all group ${
        isVisible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
      } ${feature.link || feature.title === 'Save Money' ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <feature.icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
        {feature.title}
        {(feature.link || feature.title === 'Save Money') && (
          <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            →
          </span>
        )}
      </h3>
      <p className="text-muted-foreground">{feature.description}</p>

      {/* Save Money interactive content */}
      {feature.title === 'Save Money' && (
        <SaveMoneyCard expanded={expanded} setExpanded={setExpanded} onViewPlans={onViewPlans} />
      )}
    </div>
  );
};

const SaveMoneyCard = ({
  expanded,
  setExpanded,
  onViewPlans,
}: {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  onViewPlans: () => void;
}) => {
  const [monthly, setMonthly] = useState<number | ''>(1200);
  const [months, setMonths] = useState<number | ''>(12);
  const [agentPercent, setAgentPercent] = useState<number | ''>(10);

  const total = (Number(monthly) || 0) * (Number(months) || 0);
  const agentFee = total * ((Number(agentPercent) || 0) / 100);
  const saved = agentFee;

  return (
    <div className="mt-4 border-t pt-4" onClick={(event) => event.stopPropagation()}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Quick Savings Calculator</div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-primary"
        >
          {expanded ? 'Hide' : 'Open'}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Monthly Rent</label>
              <input type="number" value={monthly as any} onChange={(e) => setMonthly(e.target.value === '' ? '' : Number(e.target.value))} className="w-full mt-1 p-2 border rounded-md" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Months</label>
              <input type="number" value={months as any} onChange={(e) => setMonths(e.target.value === '' ? '' : Number(e.target.value))} className="w-full mt-1 p-2 border rounded-md" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Agent Fee %</label>
              <input type="number" value={agentPercent as any} onChange={(e) => setAgentPercent(e.target.value === '' ? '' : Number(e.target.value))} className="w-full mt-1 p-2 border rounded-md" />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Total planned spend</div>
              <div className="text-lg font-bold">{formatRand(total)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Potential savings (no agent)</div>
              <div className="text-lg font-bold text-emerald-600">{formatRand(saved)}</div>
            </div>
            <div className="sm:w-48">
              <Button type="button" className="w-full" onClick={onViewPlans}>
                View premium plans
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
