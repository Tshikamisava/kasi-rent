import { Shield, CreditCard, MessageSquare, CheckCircle, Search, Wallet } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useNavigate } from "react-router-dom";

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
    link: "/savings",
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
      </div>
    </section>
  );
};

const FeatureCard = ({ feature, index }: { feature: any; index: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  const navigate = useNavigate();
  
  const handleClick = () => {
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
    </div>
  );
};
