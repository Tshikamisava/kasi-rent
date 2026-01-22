import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const ListProperty = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold mb-4">List Your Property</h1>
          <p className="text-muted-foreground mb-6">Create a new listing to reach thousands of tenants in your area. We'll add a simple form here — for now this page is a placeholder.</p>
          <div className="rounded-lg border border-border p-6 bg-card">
            <p className="text-sm text-muted-foreground">Coming soon: property listing form and pricing options.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListProperty;
