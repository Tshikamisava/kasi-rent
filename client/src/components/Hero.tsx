import { Home, Users, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #20b2aa 100%)'
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
      
      <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 animate-fade-in">
            Welcome to <span className="text-white drop-shadow-2xl">KasiRent</span>
          </h1>
          <p className="text-lg md:text-xl mb-16 text-white/95 animate-fade-in max-w-4xl mx-auto leading-relaxed">
            South Africa's most trusted digital rental platform connecting tenants, landlords, and agents in township communities
          </p>
          
          {/* CTA Section - Button and Input Field */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in mb-20">
            <Link to="/properties">
              <Button 
                size="lg" 
                className="text-base px-8 py-3 bg-white text-orange-600 hover:bg-white/95 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 min-w-[160px]"
              >
                Find a Property
              </Button>
            </Link>
            <div className="w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Search properties..." 
                className="w-full sm:w-80 px-4 py-3 rounded-lg border-0 bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-300"
              />
            </div>
          </div>

          {/* Feature Cards with Glassmorphism */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* For Tenants Card */}
            <div 
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white text-center">For Tenants</h3>
              <p className="text-white/90 text-base leading-relaxed text-center">
                Find verified properties, book securely, and pay safely
              </p>
            </div>

            {/* For Landlords Card */}
            <div 
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white text-center">For Landlords</h3>
              <p className="text-white/90 text-base leading-relaxed text-center">
                List properties, manage tenants, receive payments instantly
              </p>
            </div>

            {/* For Agents Card */}
            <div 
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white text-center">For Agents</h3>
              <p className="text-white/90 text-base leading-relaxed text-center">
                Connect clients, earn commissions, grow your business
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
