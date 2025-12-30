import { Button } from "@/components/ui/button";
import { Home, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

// Import images with fallbacks
import communityImage from "@/assets/township-community.jpg";
import happyTenantsImage from "@/assets/happy-tenants.jpg";
import landlordImage from "@/assets/landlord-property.jpg";

const heroSlides = [
  { 
    image: communityImage, 
    fallback: "/township-community.jpg",
    alt: "Vibrant township community" 
  },
  { 
    image: happyTenantsImage, 
    fallback: "/happy-tenants.jpg",
    alt: "Happy family moving in" 
  },
  { 
    image: landlordImage, 
    fallback: "/landlord-property.jpg",
    alt: "Professional landlord" 
  },
];

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { user, userType } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { toast } = useToast();

  const handleLandlordClick = () => {
    if (!user) {
      navigate('/signin?redirect=/dashboard/landlord');
      return;
    }

    // Only admins are allowed to access the Landlord area
    if (userType === 'admin') {
      navigate('/dashboard/landlord');
      return;
    }

    // Show an unauthorized toast and guide user to sign up / get started
    toast({
      title: 'Unauthorized',
      description: 'Only administrators can access the Landlord Dashboard. If you need access, contact support or create a landlord profile.',
      variant: 'destructive'
    });

    navigate('/get-started');
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image Carousel */}
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = slide.fallback;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-secondary/50 to-accent/60" />
        </div>
      ))}
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-10" />
      
      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Welcome to <span className="text-white drop-shadow-lg">KasiRent</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fade-in">
            South Africa's most trusted digital rental platform connecting tenants and landlords directly - no agents needed
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link to="/properties">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90">
                Find a Property
              </Button>
            </Link>
            <Link to="/get-started">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/10">
                List Your Property
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <button
              type="button"
              onClick={() => navigate('/properties')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/properties'); }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all text-left cursor-pointer"
              aria-label="For Tenants - Find verified properties"
            >
              <Home className="w-12 h-12 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">For Tenants</h3>
              <p className="text-white/80">Find verified properties, book securely, and pay safely without agent fees</p>
            </button>

            <button
              type="button"
              onClick={handleLandlordClick}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleLandlordClick(); }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all text-left cursor-pointer"
              aria-label="For Landlords - List properties"
            >
              <Building2 className="w-12 h-12 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">For Landlords</h3>
              <p className="text-white/80">List properties, connect directly with tenants, and receive payments instantly</p>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
