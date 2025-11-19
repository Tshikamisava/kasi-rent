import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { VisualShowcase } from "@/components/VisualShowcase";
import { FeaturedProperties } from "@/components/FeaturedProperties";
import { HowItWorks } from "@/components/HowItWorks";
import { OurPartners } from "@/components/OurPartners";
import { OurTeam } from "@/components/OurTeam";
import { ConnectWithUs } from "@/components/ConnectWithUs";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <Features />
        <VisualShowcase />
        <FeaturedProperties />
        <HowItWorks />
        <OurPartners />
        <OurTeam />
        <ConnectWithUs />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
