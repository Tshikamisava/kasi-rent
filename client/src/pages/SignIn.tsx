import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { login } from "@/lib/auth";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Mail, Lock, CheckCircle2, Shield, Sparkles, Eye, EyeOff } from "lucide-react";

const SignIn = () => {
  const { user, setUser, setUserType } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('redirect') || null;
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Do not auto-redirect here; role-based redirect happens after successful sign-in
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Sign in form submitted");
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    
    try {
      console.log("Attempting login...");
      const result = await login(email, password);
      console.log("Login result:", result);
      
      if (result.error) {
        console.error("Login error:", result.error);
        toast.error(result.error || "Failed to sign in");
        setLoading(false);
        return;
      } 
      
      if (result.user) {
        const userRole = result.user.user_metadata?.userType;
        console.log("User role:", userRole);
        
        // Set user type first to ensure Zustand store is updated
        setUserType(userRole);
        
        setUser({
          _id: result.user.id,
          name: result.user.user_metadata?.name || result.user.email || "",
          email: result.user.email || "",
          token: result.session?.access_token || "",
          userType: userRole,
          role: userRole,
          profile_photo: result.user.user_metadata?.profile_photo || null
        });
        // Token persistence handled centrally in `use-auth` store
        
        toast.success("Signed in successfully!");
        
        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
          // Navigate to redirect if provided (e.g., ?redirect=/dashboard/landlord)
          if (redirectTo) {
            navigate(redirectTo);
            return;
          }

          // Redirect based on user role
          if (userRole === 'admin') {
            navigate('/admin');
          } else if (userRole === 'tenant') {
            navigate('/dashboard/tenant');
          } else if (userRole === 'landlord') {
            navigate('/dashboard/landlord');
          } else {
            navigate("/");
          }
        }, 100);
      } else {
        console.error("No user in result");
        toast.error("Login failed - please check your credentials");
        setLoading(false);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("An error occurred during sign in");
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
                  backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop')",
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
                        <span className="inline-block animate-bounce mr-1.5">🏠</span>
                        Welcome Back!
                      </p>
                    </div>
                  </div>
                  
                  <h1 className="text-4xl font-bold leading-tight">
                    Sign in to<br />
                    <span className="text-yellow-300 animate-pulse">KasiRent</span>
                  </h1>
                  
                  <p className="text-base text-white/90 max-w-md animate-fade-in-up">
                    Access your account and manage your properties
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
                        <h3 className="text-base font-bold">Quick Access</h3>
                        <p className="text-white/80 text-sm">Manage properties easily</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 hover:scale-105 transition-all" style={{animationDelay: '0.2s'}}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-yellow-300/30 flex items-center justify-center animate-pulse">
                        <Shield className="w-4 h-4 text-yellow-300" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold">Secure Login</h3>
                        <p className="text-white/80 text-sm">Your data is protected</p>
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
                      <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Welcome Back</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Sign in to continue
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1.5 px-4 pb-3">
                    <form onSubmit={handleSubmit} className="space-y-1.5">
                      <div className="space-y-0.5">
                        <Label htmlFor="email" className="text-sm">Email</Label>
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
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-sm">Password</Label>
                          <Link 
                            to="/forgot-password" 
                            className="text-xs text-primary hover:underline font-semibold"
                          >
                            Forgot?
                          </Link>
                        </div>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-9 pr-9 h-8 hover:border-primary/50 transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full h-9 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" disabled={loading}>
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Sign In
                          </span>
                        )}
                      </Button>
                    </form>
                    <Separator className="my-2" />
                    <div className="text-center text-xs text-gray-600">
                      Don't have an account?{" "}
                      <Link to="/get-started" className="text-primary hover:underline font-semibold">
                        Create one now
                      </Link>
                    </div>
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

export default SignIn;
