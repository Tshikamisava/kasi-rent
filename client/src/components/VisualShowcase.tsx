import communityImage from "@/assets/township-community.jpg";
import happyTenantsImage from "@/assets/happy-tenants.jpg";
import landlordImage from "@/assets/landlord-property.jpg";

export const VisualShowcase = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Transforming Township Rentals</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connecting communities through direct, transparent, and affordable rental solutions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Large featured image */}
          <div className="lg:col-span-2 rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={communityImage} 
              alt="Vibrant South African township community with colorful houses" 
              className="w-full h-[400px] lg:h-[500px] object-cover"
            />
          </div>

          {/* Two smaller images side by side */}
          <div className="rounded-3xl overflow-hidden shadow-xl">
            <img 
              src={happyTenantsImage} 
              alt="Happy family moving into their new rental home" 
              className="w-full h-[350px] object-cover"
            />
          </div>
          <div className="rounded-3xl overflow-hidden shadow-xl">
            <img 
              src={landlordImage} 
              alt="Professional landlord managing rental property" 
              className="w-full h-[350px] object-cover"
            />
          </div>
        </div>

        {/* Stats section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2">1000+</div>
            <p className="text-lg text-muted-foreground">Verified Properties</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-secondary mb-2">5000+</div>
            <p className="text-lg text-muted-foreground">Happy Tenants</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-accent mb-2">500+</div>
            <p className="text-lg text-muted-foreground">Trusted Landlords</p>
          </div>
        </div>
      </div>
    </section>
  );
};