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

const SignIn = () => {
  const { user, setUser, setUserType } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

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
          userType: userRole
        });
        
        toast.success("Signed in successfully!");
        
        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
          if (userRole && ['tenant', 'landlord'].includes(userRole)) {
            navigate(`/dashboard/${userRole}`);
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
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
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
