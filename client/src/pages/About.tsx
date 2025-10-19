import { Shield, Users, Heart, TrendingUp } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const values = [
  {
    icon: Shield,
    title: "Trust & Safety",
    description: "We verify every property and landlord to ensure your safety and prevent scams in the rental process.",
  },
  {
    icon: Users,
    title: "Community First",
    description: "Built for South African townships, by people who understand the community's unique needs.",
  },
  {
    icon: Heart,
    title: "Transparency",
    description: "Clear pricing, honest reviews, and open communication between all parties.",
  },
  {
    icon: TrendingUp,
    title: "Growth & Opportunity",
    description: "Empowering landlords and agents to grow their businesses while helping tenants find homes.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">About KasiRent</h1>
              <p className="text-xl text-muted-foreground">
                We're on a mission to transform township rental experiences across South Africa through technology, transparency, and trust.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  KasiRent was born from a simple observation: finding rental properties in South African townships was unnecessarily difficult, risky, and often led to scams. We knew there had to be a better way.
                </p>
                <p>
                  Our founders, who grew up in township communities, understood firsthand the challenges tenants face - from unreliable listings to unsafe payment methods. They also saw how landlords struggled to find trustworthy tenants and how local agents lacked proper tools to grow their businesses.
                </p>
                <p>
                  Today, KasiRent connects thousands of tenants, landlords, and agents across South Africa, making the rental process transparent, secure, and accessible for everyone. We're proud to serve our communities and help people find not just houses, but homes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
              <p className="text-xl text-muted-foreground">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">5,000+</div>
                <div className="text-lg text-muted-foreground">Properties Listed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">10,000+</div>
                <div className="text-lg text-muted-foreground">Happy Tenants</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">500+</div>
                <div className="text-lg text-muted-foreground">Trusted Agents</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
