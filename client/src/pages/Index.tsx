import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { VisualShowcase } from "@/components/VisualShowcase";
import { FeaturedProperties } from "@/components/FeaturedProperties";
import { HowItWorks } from "@/components/HowItWorks";
import { OurPartners } from "@/components/OurPartners";
import { OurTeam } from "@/components/OurTeam";
import { ConnectWithUs } from "@/components/ConnectWithUs";
import { LandlordCard } from "@/components/LandlordCard";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { RecommendedProperties } from "@/components/RecommendedProperties";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <Features />
        <VisualShowcase />
        <FeaturedProperties />
        <RecommendedProperties
          title="Trending Now"
          subtitle="Most viewed properties in your area"
          type="trending"
          limit={6}
        />
        <HowItWorks />
        <OurPartners />
        <OurTeam />
        <LandlordCard />
        <ConnectWithUs />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
