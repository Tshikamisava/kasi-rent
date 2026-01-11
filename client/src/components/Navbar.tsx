import { Button } from "@/components/ui/button";
import { Menu, X, Calendar, Heart, User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // Get user from auth or localStorage
  const getUserData = () => {
    if (authUser) return authUser;
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  };

  const user = getUserData();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowUserMenu(false);
    navigate("/");
    window.location.reload();
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    navigate("/profile");
  };

  const handleDashboardClick = () => {
    const userRole = user?.role || user?.userType;
    setShowUserMenu(false);
    navigate(userRole === "landlord" ? "/dashboard/landlord" : "/dashboard/tenant");
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
            {user && (
              <>
                <Link to="/favorites" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  Favorites
                </Link>
                <Link to="/bookings" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Bookings
                </Link>
              </>
            )}
            
            {user ? (
              <div className="relative" ref={menuRef}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline">{user.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-semibold">My Account</div>
                      </div>
                      
                      <button
                        onClick={handleProfileClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </button>
                      
                      <button
                        onClick={handleDashboardClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </button>
                      
                      <div className="border-t"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
              <Link to="/properties" className="text-foreground hover:text-primary transition-colors py-2">
                Properties
              </Link>
              <Link to="/about" className="text-foreground hover:text-primary transition-colors py-2">
                About
              </Link>
              {user && (
                <>
                  <Link to="/favorites" className="text-foreground hover:text-primary transition-colors py-2 flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    Favorites
                  </Link>
                  <Link to="/bookings" className="text-foreground hover:text-primary transition-colors py-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Bookings
                  </Link>
                  <Link to="/profile" className="text-foreground hover:text-primary transition-colors py-2 flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 transition-colors py-2 flex items-center gap-1 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              )}
              {!user && (
                <>
                  <Link to="/signin">
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/get-started">
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
