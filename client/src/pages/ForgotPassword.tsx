import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { Mail, ArrowLeft, CheckCircle, CheckCircle2, Shield, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { resetPassword } from "@/lib/auth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    
    try {
      const result = await resetPassword(email);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setEmailSent(true);
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <Navbar />
      </div>
      <main className="h-screen flex items-center">
        <div className="w-full h-full">
          <div className="grid lg:grid-cols-2 h-full">
            {/* Left side - Animated Image */}
            <div className="hidden lg:block relative overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-110"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2096&auto=format&fit=crop')",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-secondary/90 animate-gradient"></div>
              </div>

              {/* Animated Particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-2 h-2 bg-white rounded-full animate-float"></div>
                <div className="absolute top-40 right-20 w-3 h-3 bg-yellow-300 rounded-full animate-float-delayed"></div>
                <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-white/60 rounded-full animate-float"></div>
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-between p-6 text-white z-10">
                <div className="space-y-3">
                  <div className="inline-block animate-slide-down">
                    <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/30 transition-all hover:bg-white/30">
                      <p className="text-sm font-semibold">
                        <span className="inline-block animate-bounce mr-1.5">🔒</span>
                        Reset Password
                      </p>
                    </div>
                  </div>
                  
                  <h1 className="text-4xl font-bold leading-tight">
                    Don't Worry!<br />
                    <span className="text-yellow-300 animate-pulse">We've Got You</span>
                  </h1>
                  
                  <p className="text-base text-white/90 max-w-md animate-fade-in-up">
                    Enter your email and we'll send you reset instructions
                  </p>
                </div>

                {/* Feature Cards */}
                <div className="space-y-2">
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 hover:scale-105 transition-all animate-slide-in-left">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-yellow-300/30 flex items-center justify-center animate-pulse">
                        <CheckCircle2 className="w-4 h-4 text-yellow-300" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold">Quick Recovery</h3>
                        <p className="text-white/80 text-sm">Reset in minutes</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 hover:scale-105 transition-all" style={{animationDelay: '0.2s'}}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-yellow-300/30 flex items-center justify-center animate-pulse">
                        <Shield className="w-4 h-4 text-yellow-300" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold">Secure Process</h3>
                        <p className="text-white/80 text-sm">Your account is safe</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center hover:scale-110 transition-transform">
                    <p className="text-2xl font-bold text-yellow-300">10K+</p>
                    <p className="text-xs text-white/80">Properties</p>
                  </div>
                  <div className="text-center hover:scale-110 transition-transform">
                    <p className="text-2xl font-bold text-yellow-300">50K+</p>
                    <p className="text-xs text-white/80">Users</p>
                  </div>
                  <div className="text-center hover:scale-110 transition-transform">
                    <p className="text-2xl font-bold text-yellow-300">4.9★</p>
                    <p className="text-xs text-white/80">Rating</p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-20 right-10 w-20 h-20 bg-yellow-300/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-40 left-20 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            </div>

            {/* Right side - Compact Form */}
            <div className="flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-primary/5 h-screen">
              <div className="w-full max-w-md">
                <Card className="shadow-2xl border-0 bg-white animate-fade-in-up">
                  <CardHeader className="space-y-0.5 text-center pb-2 relative">
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-2xl animate-pulse"></div>
                    <div className="relative">
                      <div className="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg hover:scale-110 hover:rotate-6 transition-all">
                        <Sparkles className="w-5 h-5 text-white animate-pulse" />
                      </div>
                      <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Forgot Password?</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        We'll help you reset it
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1.5 px-4 pb-3">
                    {!emailSent ? (
                      <form onSubmit={handleSubmit} className="space-y-1.5">
                        <div className="space-y-0.5">
                          <Label htmlFor="email" className="text-sm">Email Address</Label>
                          <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input 
                              id="email" 
                              type="email" 
                              placeholder="you@example.com"
                              className="pl-9 h-8 hover:border-primary/50 transition-all"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full h-9 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" disabled={loading}>
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Send Reset Link
                            </span>
                          )}
                        </Button>
                        <div className="text-center pt-2">
                          <Link 
                            to="/signin" 
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            Back to Sign In
                          </Link>
                        </div>
                      </form>
                    ) : (
                      <div className="text-center space-y-3 py-2">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-9 h-9 text-green-600" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-base font-semibold text-gray-900">Check Your Email</h3>
                          <p className="text-xs text-gray-600">
                            Reset instructions sent to
                          </p>
                          <p className="text-sm font-semibold text-primary">{email}</p>
                        </div>
                        <div className="pt-2">
                          <Link to="/signin">
                            <Button 
                              variant="outline" 
                              className="w-full h-9"
                            >
                              Return to Sign In
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
