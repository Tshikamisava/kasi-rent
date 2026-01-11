import { useEffect, useState } from "react";
import { Heart, MapPin, BedDouble, Bath, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/FavoriteButton";

interface FavoriteProperty {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  images: string[];
  image_url: string;
  landlord_name: string;
  favorite_id: number;
  favorited_at: string;
  average_rating: number;
  review_count: number;
}

export default function Favorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/");
      toast({
        title: "Authentication required",
        description: "Please sign in to view your favorites",
        variant: "destructive",
      });
      return;
    }
    fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = user?.token || localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/api/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load your favorites",
        variant: "destructive",
      });
      // Set empty array so the UI doesn't show loading state forever
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = (propertyId: number) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== propertyId));
  };

  const handlePropertyClick = (propertyId: number) => {
    navigate(`/?property=${propertyId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-500 fill-current" />
          My Favorites
        </h1>
        <p className="text-muted-foreground">
          Properties you've saved for later
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-24 w-24 mx-auto text-muted-foreground/20 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No favorites yet</h2>
          <p className="text-muted-foreground mb-6">
            Start exploring and save properties you like
          </p>
          <Button onClick={() => navigate("/")}>Browse Properties</Button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            {favorites.length} {favorites.length === 1 ? "property" : "properties"} saved
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((property) => {
              const displayImage =
                property.images && property.images.length > 0
                  ? property.images[0]
                  : property.image_url;

              return (
                <Card
                  key={property.id}
                  className="group cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => handlePropertyClick(property.id)}
                >
                  <CardContent className="p-0">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={displayImage}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/property-placeholder.png";
                        }}
                      />
                      <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
                        <FavoriteButton
                          propertyId={property.id}
                          onToggle={(isFavorite) => {
                            if (!isFavorite) {
                              handleRemoveFavorite(property.id);
                            }
                          }}
                        />
                      </div>
                      <Badge className="absolute bottom-2 left-2 bg-primary">
                        R{property.price.toLocaleString()}/month
                      </Badge>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">
                          {property.title}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">{property.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <BedDouble className="h-4 w-4 text-muted-foreground" />
                          <span>{property.bedrooms || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4 text-muted-foreground" />
                          <span>{property.bathrooms || "N/A"}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {property.property_type}
                        </Badge>
                      </div>

                      {property.average_rating > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center">
                            ⭐ {Number(property.average_rating).toFixed(1)}
                          </div>
                          <span className="text-muted-foreground">
                            ({property.review_count} reviews)
                          </span>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Saved{" "}
                        {new Date(property.favorited_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
