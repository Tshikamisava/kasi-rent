import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, BedDouble, Bath, Heart, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { PropertyDetailModal } from "@/components/PropertyDetailModal";
import { FavoriteButton } from "@/components/FavoriteButton";

const Favorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    if (!user?._id) return;

    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/favorites/user/${user._id}`);
      const data = await response.json();

      if (data.success) {
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyClick = (property: any) => {
    setSelectedProperty(property);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground">Loading your favorites...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500 fill-red-500" />
              My Favorites
            </h1>
            <p className="text-muted-foreground">
              {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved
            </p>
          </div>

          {favorites.length === 0 ? (
            <Card className="p-12 text-center">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-2xl font-bold mb-2">No Favorites Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start exploring properties and save your favorites!
              </p>
              <Button onClick={() => navigate('/properties')}>
                Browse Properties
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => {
                const property = favorite.property;
                if (!property) return null;

                const displayImage = property.images && property.images.length > 0 
                  ? property.images[0] 
                  : property.image_url;

                return (
                  <Card 
                    key={favorite.id} 
                    className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => handlePropertyClick(property)}
                  >
                    <CardHeader className="p-0 relative">
                      {displayImage ? (
                        <img
                          src={displayImage}
                          alt={property.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/property-placeholder.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <Building2 className="w-16 h-16 text-primary/40" />
                        </div>
                      )}
                      
                      {/* Favorite Button */}
                      <div className="absolute top-2 right-2">
                        <FavoriteButton 
                          propertyId={property.id} 
                          variant="default"
                          className="bg-white/90 hover:bg-white"
                        />
                      </div>

                      {property.is_verified && (
                        <Badge className="absolute top-2 left-2 bg-green-500">
                          Verified
                        </Badge>
                      )}
                    </CardHeader>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                        {property.title}
                      </h3>
                      <div className="flex items-center text-muted-foreground mb-3 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {property.address || property.location}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center">
                          <BedDouble className="w-4 h-4 mr-1" />
                          {property.bedrooms || 0}
                        </div>
                        <div className="flex items-center">
                          <Bath className="w-4 h-4 mr-1" />
                          {property.bathrooms || 0}
                        </div>
                        <Badge variant="outline">{property.property_type}</Badge>
                      </div>
                      {property.average_rating && (
                        <div className="flex items-center text-sm mb-2">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span>{Number(property.average_rating).toFixed(1)}</span>
                          <span className="text-muted-foreground ml-1">
                            ({property.review_count || 0} reviews)
                          </span>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          R{property.price?.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">/month</p>
                      </div>
                      <Button onClick={() => handlePropertyClick(property)}>
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <PropertyDetailModal
        property={selectedProperty}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            // Refresh favorites when modal closes (in case property was unfavorited)
            fetchFavorites();
          }
        }}
      />

      <Footer />
    </div>
  );
};

export default Favorites;
