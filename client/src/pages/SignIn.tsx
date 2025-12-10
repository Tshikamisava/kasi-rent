import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { login } from "@/lib/auth";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SignIn = () => {
  const { user, setUser, setUserType } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Check Supabase configuration
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_project_url') {
      console.error("Supabase not configured. Please set up your .env file with valid credentials.");
      toast.error("Authentication service not configured. Please contact support.");
    }

    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Sign in form submitted");
    
    // Validate Supabase configuration
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_project_url') {
      toast.error("Authentication service not configured. Please set up Supabase credentials.");
      console.error("Missing Supabase configuration");
      return;
    }
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    
    try {
      console.log("Attempting login with:", { email });
      
      const result = await login(email, password);
      console.log("Login result:", { 
        hasUser: !!result.user, 
        hasSession: !!result.session, 
        error: result.error 
      });
      
      if (result.error) {
        console.error("Login error:", result.error);
        toast.error(result.error || "Failed to sign in");
        setLoading(false);
        return;
      } 
      
      if (result.user && result.session) {
        const userRole = result.user.user_metadata?.userType || 'tenant';
        console.log("User authenticated. Role:", userRole);
        
        const userData = {
          _id: result.user.id,
          name: result.user.user_metadata?.name || result.user.email || "",
          email: result.user.email || "",
          token: result.session.access_token || "",
          userType: userRole
        };
        
        // Set user type first
        setUserType(userRole);
        setUser(userData);
        
        console.log("User state updated, navigating to dashboard");
        toast.success("Signed in successfully!");
        
        // Navigate based on role
        setTimeout(() => {
          const targetPath = ['tenant', 'landlord'].includes(userRole) 
            ? `/dashboard/${userRole}` 
            : "/";
          console.log("Navigating to:", targetPath);
          navigate(targetPath);
        }, 100);
      } else {
        console.error("No user or session in result");
        toast.error("Login failed - please check your credentials");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Sign in exception:", error);
      toast.error(error.message || "An error occurred during sign in");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Sign In
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                onClick={(e) => {
                  console.log("Button clicked!");
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link 
                  to="/get-started" 
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default SignIn;
