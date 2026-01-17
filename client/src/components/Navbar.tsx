import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, Calendar, Heart, User, LogOut, Settings, Search, Shield } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
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
            <Link to="/search" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
              <Search className="w-4 h-4" />
              Search
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
            {user && user.role === 'tenant' && (
              <Link to="/verification" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Verification
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link to="/admin" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
            {user && (
              <Link to="/bookings" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Bookings
              </Link>
            )}
            {user && (
              <Link to="/favorites" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                <Heart className="w-4 h-4" />
                Favorites
              </Link>
            )}
            {!user ? (
              <>
                <Link to="/signin">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link to="/get-started">
                  <Button>Get Started</Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  to="/profile"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity p-2 rounded-lg hover:bg-accent"
                >
                  {user.profile_photo ? (
                    <img 
                      src={user.profile_photo} 
                      alt={user.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary shadow-md ring-2 ring-primary/20"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md ring-2 ring-primary/20 ${user.profile_photo ? 'hidden' : ''}`}
                  >
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-semibold text-foreground">
                      {user.name || 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user.role === 'landlord' ? 'Property Owner' : 'Tenant'}
                    </span>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
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
              <Link to="/properties" className="text-foreground hover:text-primary transition-colors py-2">
                Properties
              </Link>
              <Link to="/search" className="text-foreground hover:text-primary transition-colors py-2 flex items-center gap-1">
                <Search className="w-4 h-4" />
                Advanced Search
              </Link>
              <Link to="/about" className="text-foreground hover:text-primary transition-colors py-2">
                About
              </Link>
              {user && user.role === 'tenant' && (
                <Link to="/verification" className="text-foreground hover:text-primary transition-colors py-2 flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Verification
                </Link>
              )}
              {user && user.role === 'admin' && (
                <Link to="/admin" className="text-foreground hover:text-primary transition-colors py-2 flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
              {user && (
                <Link to="/bookings" className="text-foreground hover:text-primary transition-colors py-2 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Bookings
                </Link>
              )}
              {user && (
                <Link to="/favorites" className="text-foreground hover:text-primary transition-colors py-2 flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  Favorites
                </Link>
              )}
              {!user ? (
                <>
                  <Link to="/signin">
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/get-started">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/profile" className="text-foreground hover:text-primary transition-colors py-2 flex items-center gap-1">
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                  <Link to={user.role === 'landlord' ? '/dashboard/landlord' : '/dashboard/tenant'} className="text-foreground hover:text-primary transition-colors py-2 flex items-center gap-1">
                    <Settings className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 hover:text-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
