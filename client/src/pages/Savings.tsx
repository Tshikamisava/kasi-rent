import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingDown, Calculator, CheckCircle } from "lucide-react";

export default function Savings() {
  const [monthlyRent, setMonthlyRent] = useState<number>(5000);
  const [leaseTerm, setLeaseTerm] = useState<number>(12);

  // Standard agent fees in South Africa (typically 1-2 months rent)
  const agentFee = monthlyRent * 1.5;
  const adminFees = 500;
  const totalTraditionalCost = agentFee + adminFees;
  
  // KasiRent minimal fees
  const kasirentServiceFee = 0; // No commission
  const kasirentAdminFee = 0; // Free to use
  const totalKasirentCost = kasirentServiceFee + kasirentAdminFee;
  
  const totalSavings = totalTraditionalCost - totalKasirentCost;
  const savingsPercentage = ((totalSavings / totalTraditionalCost) * 100).toFixed(0);

  const benefits = [
    "No agent commission fees",
    "No hidden administrative costs",
    "Direct landlord communication",
    "Transparent pricing always",
    "Instant property booking",
    "Secure payment processing",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 bg-gradient-to-b from-background to-accent/10">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-6">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Save Money with KasiRent
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Skip the middleman and save thousands on agent fees. Connect directly with landlords 
              and keep more money in your pocket.
            </p>
          </div>

          {/* Calculator Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Calculator className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Calculate Your Savings</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="monthlyRent" className="text-base mb-2 block">
                    Monthly Rent (R)
                  </Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="text-lg"
                    min={0}
                  />
                </div>

                <div>
                  <Label htmlFor="leaseTerm" className="text-base mb-2 block">
                    Lease Term (Months)
                  </Label>
                  <Input
                    id="leaseTerm"
                    type="number"
                    value={leaseTerm}
                    onChange={(e) => setLeaseTerm(Number(e.target.value))}
                    className="text-lg"
                    min={1}
                    max={60}
                  />
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    Total rent over {leaseTerm} months
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    R {(monthlyRent * leaseTerm).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
              <div className="flex items-center gap-3 mb-6">
                <TrendingDown className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold">Your Savings</h2>
              </div>

              <div className="space-y-6">
                {/* Traditional Agent Costs */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Traditional Agent Fees
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Agent Commission (1.5 months)</span>
                      <span className="font-semibold">R {agentFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Admin Fees</span>
                      <span className="font-semibold">R {adminFees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t">
                      <span>Total Traditional Cost</span>
                      <span className="text-red-600">R {totalTraditionalCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* KasiRent Costs */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    KasiRent Fees
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Service Fee</span>
                      <span className="font-semibold">R 0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Admin Fees</span>
                      <span className="font-semibold">R 0</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t">
                      <span>Total KasiRent Cost</span>
                      <span className="text-green-600">R 0</span>
                    </div>
                  </div>
                </div>

                {/* Savings */}
                <div className="pt-6 border-t-2 border-green-600/30">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    You Save With KasiRent
                  </p>
                  <div className="flex items-baseline gap-3">
                    <p className="text-4xl font-bold text-green-600">
                      R {totalSavings.toLocaleString()}
                    </p>
                    <p className="text-xl font-semibold text-green-600">
                      ({savingsPercentage}%)
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    That's money you can use for furniture, deposits, or savings!
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Benefits Grid */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">
              More Ways You Save
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="font-medium">{benefit}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="p-8 md:p-12 bg-gradient-to-br from-primary to-secondary text-white text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Saving?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of renters who are already saving money by connecting 
              directly with landlords through KasiRent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8"
                onClick={() => window.location.href = '/properties'}
              >
                Browse Properties
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-white/10 hover:bg-white/20 text-white border-white/30"
                onClick={() => window.location.href = '/register'}
              >
                Sign Up Free
              </Button>
            </div>
          </Card>

          {/* Testimonial */}
          <div className="mt-12 text-center">
            <blockquote className="max-w-3xl mx-auto">
              <p className="text-xl italic text-muted-foreground mb-4">
                "I saved over R7,500 in agent fees by using KasiRent. The process was 
                smooth, and I got to talk directly with my landlord. Highly recommended!"
              </p>
              <footer className="text-sm font-semibold">
                - Thabo M., Soweto
              </footer>
            </blockquote>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
