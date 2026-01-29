import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const FindAgents = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold mb-4">Find Agents</h1>
          <p className="text-muted-foreground mb-6">Search for trusted agents in your area. This page is a starter placeholder — we'll add a searchable directory here.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-lg border border-border p-6 bg-card">Agent 1 (sample)</div>
            <div className="rounded-lg border border-border p-6 bg-card">Agent 2 (sample)</div>
            <div className="rounded-lg border border-border p-6 bg-card">Agent 3 (sample)</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FindAgents;
