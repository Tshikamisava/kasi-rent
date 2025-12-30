import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const CTASection = () => {
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLandlordClick = () => {
    // If not logged in, redirect to sign-in with redirect back to landlord dashboard
    if (!user) {
      navigate('/signin?redirect=/dashboard/landlord');
      return;
    }

    // If logged in as landlord, go to landlord dashboard
    if (userType === 'landlord') {
      navigate('/dashboard/landlord');
      return;
    }

    // If logged in but not a landlord, show informative toast and navigate to their dashboard
    toast({
      title: 'Access restricted',
      description: `You are signed in as ${userType}. If you need a landlord account, please sign up or switch roles.`,
      variant: 'destructive'
    });
    navigate(`/dashboard/${userType}`);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary via-secondary to-accent relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Find Your Next Home?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of happy tenants, landlords, and agents who trust KasiRent for their rental needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90">
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/10">
              Learn More
            </Button>
            <Button size="lg" variant="ghost" className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/10" onClick={handleLandlordClick}>
              Landlord Dashboard
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
