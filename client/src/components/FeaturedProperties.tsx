import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, BedDouble, Bath, Building2, Images } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { PropertyDetailModal } from "@/components/PropertyDetailModal";
import { FavoriteButton } from "@/components/FavoriteButton";

export const FeaturedProperties = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/properties?limit=3`);
      const data = await response.json();

      if (!response.ok) throw new Error('Failed to fetch properties');
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <p className="text-center text-muted-foreground">Loading properties...</p>
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-2xl font-bold mb-2">No Properties Listed Yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first landlord to list your property and connect with tenants in your community!
            </p>
            <Link to="/get-started">
              <Button size="lg">Get Started as Landlord</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Featured Properties</h2>
          <p className="text-xl text-muted-foreground">
            Verified, trusted listings from our community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => {
            const imageCount = property.images && Array.isArray(property.images) ? property.images.length : (property.image_url ? 1 : 0);
            const displayImage = property.images && property.images.length > 0 ? property.images[0] : property.image_url;
            
            return (
            <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-shadow">
              {displayImage ? (
                <div className="h-80 overflow-hidden relative">
                  <img 
                    src={displayImage} 
                    alt={property.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/property-placeholder.png';
                    }}
                  />
                  {/* Favorite Button */}
                  <div className="absolute top-2 left-2">
                    <FavoriteButton 
                      propertyId={property.id} 
                      variant="default"
                      className="bg-white/90 hover:bg-white shadow-md"
                    />
                  </div>
                  {imageCount > 1 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <Images className="w-3 h-3" />
                      {imageCount}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-80 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Building2 className="w-20 h-20 text-primary/40" />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold">{property.title}</h3>
                  {property.is_verified && (
                    <Badge variant="default" className="bg-accent">
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{property.location}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <BedDouble className="w-4 h-4 mr-1" />
                    {property.bedrooms}
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-4 h-4 mr-1" />
                    {property.bathrooms}
                  </div>
                  <Badge variant="outline">{property.property_type}</Badge>
                </div>
                <div className="flex items-center text-2xl font-bold text-primary">
                  R{property.price.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground ml-1">/month</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => {
                    setSelectedProperty(property);
                    setModalOpen(true);
                  }}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          property={selectedProperty}
        />
      )}
          <Link to="/properties">
            <Button variant="outline" size="lg" className="px-8">
              View All Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
