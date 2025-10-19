import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-lg border-b border-orange-200 shadow-lg' 
        : 'bg-white border-b border-orange-500'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <span className={`text-2xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-orange-600' : 'text-orange-500'
            }`}>
              KasiRent
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <span
              className={`transition-colors font-medium cursor-not-allowed text-gray-400 ${
                isScrolled ? '' : ''
              }`}
              aria-disabled="true"
              tabIndex={-1}
            >
              Properties
            </span>
            <Link 
              to="/about" 
              className={`transition-colors font-medium hover:text-orange-600 ${
                isScrolled ? 'text-gray-700' : 'text-gray-800'
              }`}
            >
              About
            </Link>
            <Link to="/signin">
              <Button 
                variant="outline" 
                className={`font-medium px-6 py-2 rounded-lg transition-all duration-300 ${
                  isScrolled 
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Sign In
              </Button>
            </Link>
            <Link to="/get-started">
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className={`md:hidden transition-colors duration-300 ${
              isScrolled ? 'text-gray-700' : 'text-gray-800'
            }`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className={`md:hidden py-4 border-t transition-colors duration-300 ${
            isScrolled ? 'border-gray-200' : 'border-orange-200'
          }`}>
            <div className="flex flex-col gap-4">
              <Link 
                to="/properties" 
                className={`transition-colors py-2 font-medium hover:text-orange-600 ${
                  isScrolled ? 'text-gray-700' : 'text-gray-800'
                }`}
              >
                Properties
              </Link>
              <Link 
                to="/about" 
                className={`transition-colors py-2 font-medium hover:text-orange-600 ${
                  isScrolled ? 'text-gray-700' : 'text-gray-800'
                }`}
              >
                About
              </Link>
              <Link to="/signin">
                <Button 
                  variant="outline" 
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/get-started">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
