import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface FavoriteButtonProps {
  propertyId: number;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "ghost" | "outline";
  showLabel?: boolean;
  onToggle?: (isFavorite: boolean) => void;
}

export const FavoriteButton = ({ 
  propertyId, 
  size = "icon", 
  variant = "ghost",
  showLabel = false,
  onToggle 
}: FavoriteButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [propertyId, user]);

  const checkFavoriteStatus = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = user?.token || localStorage.getItem("token");

      const response = await fetch(
        `${apiUrl}/api/favorites/check/${propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add properties to your favorites",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = user?.token || localStorage.getItem("token");

      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(
          `${apiUrl}/api/favorites/${propertyId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          setIsFavorite(false);
          toast({
            title: "Removed from favorites",
            description: "Property removed from your wishlist",
          });
          onToggle?.(false);
        }
      } else {
        // Add to favorites
        const response = await fetch(`${apiUrl}/api/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ propertyId }),
        });

        if (response.ok) {
          setIsFavorite(true);
          toast({
            title: "Added to favorites",
            description: "Property added to your wishlist",
          });
          onToggle?.(true);
        } else {
          const error = await response.json();
          toast({
            title: "Error",
            description: error.message || "Failed to add to favorites",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={toggleFavorite}
      disabled={loading}
      className={`transition-all ${isFavorite ? 'text-red-500' : ''}`}
    >
      <Heart
        className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`}
      />
      {showLabel && (
        <span className="ml-2">
          {isFavorite ? 'Saved' : 'Save'}
        </span>
      )}
    </Button>
  );
};
