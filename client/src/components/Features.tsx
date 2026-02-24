import { Shield, CreditCard, MessageSquare, CheckCircle, Search, Wallet } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const features = [
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

export const Features = () => {
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
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Subscription info (locked) */}
        <div className="mt-10 bg-muted/10 p-6 rounded-lg border border-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold">KasiRent Subscriptions</h3>
              <p className="text-sm text-muted-foreground max-w-2xl">Subscribe to premium features to boost your listing visibility, get priority support, and access exclusive landlord tools. Subscriptions are coming soon — we're finalising secure payment and billing.</p>
            </div>
            <div className="text-right">
              <div className="inline-block px-4 py-2 bg-gray-100 rounded-md border border-dashed text-muted-foreground">
                Coming soon
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ feature, index }: { feature: any; index: number }) => {
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
      } ${feature.link ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <feature.icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
        {feature.title}
        {feature.link && (
          <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            →
          </span>
        )}
      </h3>
      <p className="text-muted-foreground">{feature.description}</p>

      {/* Save Money interactive content */}
      {feature.title === 'Save Money' && (
        <SaveMoneyCard expanded={expanded} setExpanded={setExpanded} />
      )}
    </div>
  );
};

const SaveMoneyCard = ({ expanded, setExpanded }: { expanded: boolean; setExpanded: (v: boolean) => void }) => {
  const [monthly, setMonthly] = useState<number | ''>(1200);
  const [months, setMonths] = useState<number | ''>(12);
  const [agentPercent, setAgentPercent] = useState<number | ''>(10);

  const total = (Number(monthly) || 0) * (Number(months) || 0);
  const agentFee = total * ((Number(agentPercent) || 0) / 100);
  const saved = agentFee;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Quick Savings Calculator</div>
        <button onClick={() => setExpanded(!expanded)} className="text-sm text-primary">
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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="text-sm text-muted-foreground">Total planned spend</div>
              <div className="text-lg font-bold">R{total.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Potential savings (no agent)</div>
              <div className="text-lg font-bold text-emerald-600">R{saved.toLocaleString()}</div>
            </div>
            <div className="sm:w-40">
              <div className="w-full text-center py-2 rounded-md bg-gray-100 text-muted-foreground border border-dashed">
                {!loading ? (
                  <button
                    onClick={async () => {
                      setError(null);
                      setLoading(true);
                      try {
                        const session = await (await import('@/lib/auth')).getCurrentSession();
                        const token = session?.session?.access_token || localStorage.getItem('token');
                        if (!token) {
                          window.location.href = '/login';
                          return;
                        }

                        // Create subscription record
                        const subResp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/subscriptions`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({ plan: 'basic', amount: total, metadata: { note: 'KasiRent subscription' } })
                        });
                        const subJson = await subResp.json();
                        if (!subResp.ok) throw new Error(subJson.error || 'Failed to create subscription');

                        const subscriptionId = subJson.subscription.id;

                        // Initialize payment and attach subscription id in metadata
                        const initResp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/payments/initialize`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({
                            amount: total,
                            email: session?.user?.user_metadata?.email || session?.user?.email || undefined,
                            payment_type: 'subscription',
                            metadata: { subscription_id: subscriptionId }
                          })
                        });
                        const initJson = await initResp.json();
                        if (!initResp.ok) throw new Error(initJson.error || 'Payment initialization failed');

                        if (initJson.payment?.authorization_url) {
                          window.location.href = initJson.payment.authorization_url;
                        } else {
                          setError('Payment gateway did not return an authorization URL');
                        }
                      } catch (err: any) {
                        console.error('Subscription flow error:', err);
                        setError(err?.message || String(err));
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="px-3 py-2 bg-primary text-white rounded-md"
                  >
                    Subscribe
                  </button>
                ) : (
                  <div className="text-sm">Processing...</div>
                )}
                <div className="text-xs mt-1 text-rose-600">{error}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
