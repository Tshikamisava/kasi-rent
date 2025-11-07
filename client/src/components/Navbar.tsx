import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser } = useAuth();

  const handleSignOut = () => {
    setUser(null);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              KasiRent
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/properties" className="text-foreground hover:text-primary transition-colors">
              Properties
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
            {user ? (
              <>
                {user.userType && (
                  <Link to={`/dashboard/${user.userType}`} className="text-foreground hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                )}
                <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
                <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
              </>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link to="/get-started">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link to="/properties" className="text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsOpen(false)}>
                Properties
              </Link>
              <Link to="/about" className="text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsOpen(false)}>
                About
              </Link>
              {user ? (
                <>
                  {user.userType && (
                    <Link to={`/dashboard/${user.userType}`} className="text-foreground hover:text-primary transition-colors py-2" onClick={() => setIsOpen(false)}>
                      Dashboard
                    </Link>
                  )}
                  <span className="text-sm text-muted-foreground py-2">Welcome, {user.name}</span>
                  <Button variant="outline" className="w-full" onClick={handleSignOut}>Sign Out</Button>
                </>
              ) : (
                <>
                  <Link to="/signin" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/get-started" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
