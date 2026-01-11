import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, BedDouble, Bath, Building2, Images, Video, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { PropertyDetailModal } from "@/components/PropertyDetailModal";
import { StarRating } from "@/components/StarRating";

export const FeaturedProperties = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [propertyRatings, setPropertyRatings] = useState<{[key: string]: {avg: number, count: number}}>({});

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/properties?limit=3`);
      
      if (!response.ok) throw new Error('Failed to fetch properties');
      
      const data = await response.json();
      console.log('Featured properties API response:', data);
      
      // Handle both array and object with value property
      const propertyList = Array.isArray(data) ? data : (data.value || []);
      console.log('Featured properties list:', propertyList);
      
      setProperties(propertyList);
      
      // Fetch ratings for each property
      const ratings: {[key: string]: {avg: number, count: number}} = {};
      for (const prop of propertyList) {
        try {
          const ratingResponse = await fetch(`${API_BASE}/api/reviews/property/${prop.id}`);
          if (ratingResponse.ok) {
            const ratingData = await ratingResponse.json();
            ratings[prop.id] = {
              avg: ratingData.averageRating || 0,
              count: ratingData.totalReviews || 0
            };
          }
        } catch (err) {
          console.error('Error fetching rating for property:', prop.id);
        }
      }
      setPropertyRatings(ratings);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
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
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={displayImage} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/property-placeholder.png';
                    }}
                  />
                  {imageCount > 1 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <Images className="w-3 h-3" />
                      {imageCount}
                    </div>
                  )}
                  {property.video_url && (
                    <div className="absolute top-2 left-2 bg-red-600/90 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      Video
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Building2 className="w-20 h-20 text-primary/40" />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold">{property.title}</h3>
                  {property.is_verified ? (
                    <Badge variant="default" className="bg-accent">
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-yellow-400 text-yellow-700 bg-yellow-50">
                      Pending
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{property.location}</span>
                </div>
                {propertyRatings[property.id]?.count > 0 && (
                  <div className="mt-2">
                    <StarRating 
                      rating={propertyRatings[property.id].avg} 
                      size="sm" 
                      showNumber 
                      readonly 
                    />
                  </div>
                )}
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
                <div className="flex items-center text-2xl font-bold text-primary mb-2">
                  R{property.price.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground ml-1">/month</span>
                </div>
                {property.created_at && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    Posted {new Date(property.created_at).toLocaleDateString('en-ZA', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                )}
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
