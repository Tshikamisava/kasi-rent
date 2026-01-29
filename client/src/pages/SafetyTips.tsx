import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const SafetyTips = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold mb-4">Safety Tips</h1>
          <p className="text-muted-foreground mb-6">Guidance for safe renting and meeting landlords.</p>
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li>Always meet in a public place for first meetings.</li>
            <li>Verify property ownership and avoid cash-only payments.</li>
            <li>Use the platform messaging before sharing personal info.</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SafetyTips;
