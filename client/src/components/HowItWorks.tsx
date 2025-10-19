import { Search, Calendar, Key, Star } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search & Discover",
    description: "Browse verified properties in your preferred location with detailed information and photos",
    step: "01",
  },
  {
    icon: Calendar,
    title: "Book Instantly",
    description: "Connect with landlords or agents, schedule viewings, and submit your booking request",
    step: "02",
  },
  {
    icon: Key,
    title: "Secure Payment",
    description: "Pay safely through our platform with instant confirmation and digital receipts",
    step: "03",
  },
  {
    icon: Star,
    title: "Move In & Review",
    description: "Get your keys, move in, and share your experience to help the community",
    step: "04",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Finding and renting your perfect home has never been easier
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="relative">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="absolute -inset-4 bg-gradient-to-br from-primary to-secondary rounded-full opacity-20 blur-xl" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
