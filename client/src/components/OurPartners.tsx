import { Card, CardContent } from "@/components/ui/card";
import { Building2, Briefcase, Home, Warehouse } from "lucide-react";

const partners = [
  {
    icon: Building2,
    name: "Property Developers",
    description: "Leading property development companies in South African townships",
  },
  {
    icon: Briefcase,
    name: "Financial Services",
    description: "Trusted financial institutions providing rental insurance and support",
  },
  {
    icon: Home,
    name: "Home Services",
    description: "Quality home maintenance and improvement service providers",
  },
  {
    icon: Warehouse,
    name: "Moving Companies",
    description: "Reliable moving and logistics partners for seamless relocations",
  },
];

export const OurPartners = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Our Partners</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We collaborate with trusted businesses to provide you with comprehensive rental solutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {partners.map((partner, index) => (
            <Card key={index} className="border-border hover:border-primary/50 transition-all group hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <partner.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{partner.name}</h3>
                <p className="text-sm text-muted-foreground">{partner.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};