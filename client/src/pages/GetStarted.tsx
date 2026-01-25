import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, UserPlus, CheckCircle2, Shield, Sparkles, Star, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { register } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const GetStarted = () => {
  const navigate = useNavigate();
  const { setUser, setUserType } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const slidingTexts = [
    { title: "Find Your Dream Home", subtitle: "Discover amazing properties in your area", icon: "🏠" },
    { title: "Trusted by 50,000+ Users", subtitle: "Join our growing community today", icon: "⭐" },
    { title: "Secure & Verified", subtitle: "All properties are authenticated", icon: "🔒" },
    { title: "Easy Booking Process", subtitle: "Book your property in minutes", icon: "⚡" }
  ];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    userType: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });

  // Auto-slide text animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % slidingTexts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!formData.userType) {
      toast.error("Please select your role");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!formData.agreeToTerms) {
      toast.error("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);
    try {
      const result = await register(
        formData.email, 
        formData.password, 
        formData.name, 
        formData.phone,
        formData.userType
      );
      
      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.user) {
        throw new Error("Registration failed - no user returned");
      }

      // Create user object in our format
      const user = {
        _id: result.user.id,
        name: formData.name,
        email: result.user.email || formData.email,
        token: result.session?.access_token || "",
        userType: formData.userType,
      };

      // Set user type first to ensure Zustand store is updated
      setUserType(formData.userType);
      setUser({
        ...user,
        role: (user as any).role || user.userType || formData.userType,
        profile_photo: (user as any).profile_photo || null,
      });
      
      toast.success("Account created successfully!");
      
      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        navigate(`/dashboard/${formData.userType}`);
      }, 100);
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
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
            {/* Left side - Animated Property Image */}
            <div className="hidden lg:block relative overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-110"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')",
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
                        <span className="inline-block animate-bounce mr-1.5">{slidingTexts[currentTextIndex].icon}</span>
                        {slidingTexts[currentTextIndex].title}
                      </p>
                    </div>
                  </div>
                  
                  <h1 className="text-4xl font-bold leading-tight">
                    Welcome to<br />
                    <span className="text-yellow-300 animate-pulse">KasiRent</span>
                  </h1>
                  
                  <p key={currentTextIndex} className="text-base text-white/90 max-w-md animate-fade-in-up">
                    {slidingTexts[currentTextIndex].subtitle}
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
                        <h3 className="text-base font-bold">Verified Properties</h3>
                        <p className="text-white/80 text-sm">All listings authenticated</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 hover:scale-105 transition-all" style={{animationDelay: '0.2s'}}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-yellow-300/30 flex items-center justify-center animate-pulse">
                        <Shield className="w-4 h-4 text-yellow-300" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold">Secure Payments</h3>
                        <p className="text-white/80 text-sm">Protected transactions</p>
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
              <CardHeader className="space-y-0 text-center pb-1 relative">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative">
                  <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg hover:scale-110 hover:rotate-6 transition-all">
                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Get Started</CardTitle>
                  <CardDescription className="text-xs mt-0">
                  Join <span className="font-semibold text-primary">50K+</span> users
                </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 px-3 pb-2">
                <form onSubmit={handleSubmit} className="space-y-1">
                  <div>
                    <Label htmlFor="name" className="text-xs">Full Name</Label>
                    <div className="relative group">
                      <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="name" 
                        type="text" 
                        placeholder="John Doe"
                        className="pl-8 h-7 text-sm hover:border-primary/50 transition-all"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="you@example.com"
                        className="pl-8 h-7 text-sm hover:border-primary/50 transition-all"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs">Phone</Label>
                    <div className="relative group">
                      <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="+27 11 123 4567"
                        className="pl-8 h-7 text-sm hover:border-primary/50 transition-all"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="user-type" className="text-xs">I am a...</Label>
                    <Select value={formData.userType} onValueChange={(value) => handleInputChange('userType', value)}>
                      <SelectTrigger id="user-type" className="h-7 text-sm hover:border-primary/50 transition-all">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tenant">🏠 Tenant</SelectItem>
                        <SelectItem value="landlord">🏢 Landlord</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="password" className="text-xs">Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-8 pr-8 h-7 text-sm hover:border-primary/50 transition-all"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirm-password" className="text-xs">Confirm</Label>
                      <div className="relative group">
                        <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          id="confirm-password" 
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-8 pr-8 h-7 text-sm hover:border-primary/50 transition-all"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 text-xs bg-gray-50 p-1.5 rounded-lg">
                    <input 
                      type="checkbox" 
                      id="terms-checkbox"
                      className="rounded mt-0.5 h-3.5 w-3.5 cursor-pointer hover:scale-110 transition-transform" 
                      checked={formData.agreeToTerms}
                      onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                      required
                    />
                    <label htmlFor="terms-checkbox" className="text-gray-700 cursor-pointer leading-tight">
                      I agree to the{" "}
                      <Link to="/terms-of-service" className="text-primary hover:underline font-semibold">Terms</Link>
                      {" "}and{" "}
                      <Link to="/privacy-policy" className="text-primary hover:underline font-semibold">Privacy</Link>
                    </label>
                  </div>
                  <Button type="submit" className="w-full h-8 text-sm bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <UserPlus className="w-3.5 h-3.5" />
                        Create Account
                      </span>
                    )}
                  </Button>
                </form>
                <Separator className="my-1.5" />
                <div className="text-center text-xs text-gray-600">
                  Already have an account?{" "}
                  <Link to="/signin" className="text-primary hover:underline font-semibold">
                    Sign In
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

export default GetStarted;
