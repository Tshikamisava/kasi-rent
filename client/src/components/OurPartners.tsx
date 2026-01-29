import { Card, CardContent } from "@/components/ui/card";
import { Building2, Briefcase, Home, Warehouse, Mail, ExternalLink } from "lucide-react";

const partners = [
  {
    icon: Building2,
    name: "Property Developers",
    description: "Leading property development companies in South African townships",
    url: "https://example-developers.example.com",
    contactEmail: "info@developers.example.com",
  },
  {
    icon: Briefcase,
    name: "Financial Services",
    description: "Trusted financial institutions providing rental insurance and support",
    url: "https://example-finance.example.com",
    contactEmail: "support@finance.example.com",
  },
  {
    icon: Home,
    name: "Home Services",
    description: "Quality home maintenance and improvement service providers",
    url: "https://example-homeservices.example.com",
    contactEmail: "hello@homeservices.example.com",
  },
  {
    icon: Warehouse,
    name: "Moving Companies",
    description: "Reliable moving and logistics partners for seamless relocations",
    url: "https://example-moving.example.com",
    contactEmail: "contact@moving.example.com",
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
            <a key={index} href={partner.url} target="_blank" rel="noreferrer" className="group">
              <Card className="border-border hover:border-primary/50 transition-all group-hover:shadow-lg hover:scale-[1.01]">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <partner.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{partner.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{partner.description}</p>
                  <div className="flex items-center justify-center gap-3">
                    {partner.contactEmail && (
                      <a href={`mailto:${partner.contactEmail}`} className="text-sm text-primary/90 flex items-center gap-2 hover:underline">
                        <Mail className="w-4 h-4" /> <span>Contact</span>
                      </a>
                    )}
                    {partner.url && (
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" /> <span className="hidden sm:inline">Visit</span>
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};