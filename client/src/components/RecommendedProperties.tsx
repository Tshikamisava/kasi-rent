import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Zap, Star, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecommendedProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  image_url: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  is_verified: boolean;
  recommendationScore?: number;
  view_count?: number;
}

interface RecommendationsProps {
  properties?: RecommendedProperty[];
  title?: string;
  subtitle?: string;
  limit?: number;
  type?: "personalized" | "trending" | "similar";
  referencePropertyId?: string;
  onPropertyClick?: (propertyId: string) => void;
}

export const RecommendedProperties = ({
  properties,
  title = "Recommended For You",
  subtitle = "Based on your preferences",
  limit = 6,
  type = "personalized",
  referencePropertyId,
  onPropertyClick,
}: RecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<RecommendedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (properties && properties.length > 0) {
      setRecommendations(properties.slice(0, limit));
      setLoading(false);
    } else {
      fetchRecommendations();
    }
  }, [properties, limit, referencePropertyId, type]);

  const fetchRecommendations = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      
      let endpoint = `${API_BASE}/api/recommendations`;
      let body: any = { limit };

      if (type === "trending") {
        endpoint += "/trending";
        body.type = "viewed";
      } else if (type === "similar" && referencePropertyId) {
        endpoint += "/similar";
        body.propertyId = referencePropertyId;
      } else {
        endpoint += "/personalized";
        // Get viewed properties from localStorage
        const viewedFromStorage = localStorage.getItem("viewedProperties");
        body.viewedProperties = viewedFromStorage ? JSON.parse(viewedFromStorage) : [];
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations || data.similar || data.trending || []);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyClick = (propertyId: string) => {
    // Track view
    trackPropertyView(propertyId);
    
    if (onPropertyClick) {
      onPropertyClick(propertyId);
    } else {
      navigate(`/properties?selected=${propertyId}`);
    }
  };

  const trackPropertyView = async (propertyId: string) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await fetch(`${API_BASE}/api/recommendations/track-view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });

      // Also store in localStorage
      const viewed = localStorage.getItem("viewedProperties");
      const viewedList = viewed ? JSON.parse(viewed) : [];
      if (!viewedList.includes(propertyId)) {
        viewedList.push(propertyId);
        localStorage.setItem("viewedProperties", JSON.stringify(viewedList));
      }
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-b from-muted/30 to-transparent">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
          </div>
          <p className="text-lg text-muted-foreground">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((property) => (
            <Card
              key={property.id}
              className="group transition-transform will-change-transform hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 cursor-pointer overflow-hidden"
              onClick={() => handlePropertyClick(property.id)}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                {property.image_url ? (
                  <img
                    src={property.image_url}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 will-change-transform"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/property-placeholder.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="w-16 h-16 text-primary/40" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 right-3 flex gap-2">
                  {property.is_verified && (
                    <Badge className="bg-green-500">
                      <Star className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {property.recommendationScore && property.recommendationScore > 70 && (
                    <Badge className="bg-orange-500">
                      <Zap className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <CardHeader>
                <CardTitle className="text-lg">{property.title}</CardTitle>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                  <MapPin className="h-4 w-4" />
                  {property.location}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Details */}
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{property.bedrooms}</span>
                    <span className="text-muted-foreground">Beds</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{property.bathrooms}</span>
                    <span className="text-muted-foreground">Baths</span>
                  </div>
                  <Badge variant="outline">{property.property_type}</Badge>
                </div>

                {/* Price */}
                <div className="border-t pt-3">
                  <p className="text-2xl font-bold text-primary">
                    R{property.price?.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground ml-1">/month</span>
                  </p>
                </div>

                {/* View CTA */}
                <Button className="w-full" variant="default">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Link */}
        {recommendations.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/properties")}
            >
              View All Properties
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendedProperties;
