import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from '@/lib/api';

interface FavoriteButtonProps {
  propertyId: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "ghost" | "outline";
  className?: string;
}

export const FavoriteButton = ({ 
  propertyId, 
  size = "icon", 
  variant = "ghost",
  className = ""
}: FavoriteButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentUserId = user?.id || user?._id;

  useEffect(() => {
    if (currentUserId) {
      checkFavoriteStatus();
    }
  }, [propertyId, currentUserId]);

  const checkFavoriteStatus = async () => {
    if (!currentUserId) return;

    try {
      const res = await apiFetch(`/api/favorites/check?user_id=${currentUserId}&property_id=${propertyId}`);
      const data = await res.json();

      if (data.success) {
        setIsFavorited(data.isFavorited);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const endpoint = isFavorited ? '/api/favorites/remove' : '/api/favorites/add';
      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ user_id: currentUserId, property_id: propertyId })
      });
      const data = await res.json();

      if (data.success) {
        setIsFavorited(!isFavorited);
        toast({
          title: isFavorited ? "Removed from favorites" : "Added to favorites",
          description: data.message,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update favorites",
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
      className={className}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`h-5 w-5 transition-all ${
          isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"
        }`}
      />
    </Button>
  );
};
