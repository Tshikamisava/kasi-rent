import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const HelpCenter = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold mb-4">Help Center</h1>
          <p className="text-muted-foreground mb-6">Find answers to common questions about using KasiRent.</p>
          <div className="rounded-lg border border-border p-6 bg-card">
            <h3 className="font-semibold mb-2">How do I book a property?</h3>
            <p className="text-sm text-muted-foreground">You can message the landlord or use the booking form on the listing page.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;
