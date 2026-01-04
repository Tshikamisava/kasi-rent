import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  rating: number;
  comment: string;
  author_name: string;
  created_at: string;
}

interface ReviewsProps {
  propertyId: string;
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
  onSubmitReview?: (rating: number, comment: string) => void;
}

export const PropertyReviews = ({
  propertyId,
  reviews = [],
  averageRating = 4.5,
  totalReviews = 0,
  onSubmitReview,
}: ReviewsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviewsList, setReviewsList] = useState<Review[]>(reviews);
  const [avgRating, setAvgRating] = useState(averageRating);
  const [total, setTotal] = useState(totalReviews);

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/reviews/property/${propertyId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();
      setReviewsList(data.reviews || []);
      setAvgRating(data.averageRating || 0);
      setTotal(data.totalReviews || 0);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to leave a review",
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Empty review",
        description: "Please write something in your review",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: propertyId,
          rating,
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback",
      });

      setComment("");
      setRating(5);
      setShowForm(false);

      // Refresh reviews
      await fetchReviews();

      if (onSubmitReview) {
        onSubmitReview(rating, comment);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (stars: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(stars)
                ? "fill-yellow-400 text-yellow-400"
                : i < stars
                ? "fill-yellow-200 text-yellow-200"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Reviews</CardTitle>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                {renderStars(avgRating)}
                <span className="text-sm font-semibold ml-2">{avgRating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">({total} reviews)</span>
            </div>
          </div>
          {user && !showForm && (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              Leave Review
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Review Form */}
            {showForm && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-3 border">
            <div>
              <label className="text-sm font-semibold block mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 cursor-pointer transition-colors ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground hover:text-yellow-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2">Your Review</label>
              <Textarea
                placeholder="Share your experience with this property..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {reviewsList.length > 0 ? (
          <div className="space-y-3">
            {reviewsList.map((review) => (
              <div key={review.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{review.author_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary">{review.rating}.0★</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-3">No reviews yet</p>
            {user && (
              <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
                Be the first to review
              </Button>
            )}
          </div>
        )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyReviews;
