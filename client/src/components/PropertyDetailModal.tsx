import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, BedDouble, Bath, Phone, Mail, User, Building2, Copy, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { RecommendedProperties } from "@/components/RecommendedProperties";
import { PropertyReviews } from "@/components/PropertyReviews";
import { FraudDetector } from "@/components/FraudDetector";
import { FavoriteButton } from "@/components/FavoriteButton";

interface PropertyDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: any;
}

export const PropertyDetailModal = ({ open, onOpenChange, property }: PropertyDetailModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [landlord, setLandlord] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    move_in_date: "",
    move_out_date: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get all images from the property
  const propertyImages = property?.images && Array.isArray(property.images) && property.images.length > 0
    ? property.images
    : property?.image_url
    ? [property.image_url]
    : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
  };

  // Debug logging
  useEffect(() => {
    console.log('PropertyDetailModal - open:', open, 'property:', property);
  }, [open, property]);

  useEffect(() => {
    if (open && property?.landlord_id) {
      fetchLandlordInfo();
    }
  }, [open, property]);

  const fetchLandlordInfo = async () => {
    try {
      setLoading(true);
      
      // First check if property already has landlord data
      if (property.landlord) {
        setLandlord(property.landlord);
        return;
      }

      // Try to fetch from backend API
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = user?.token || localStorage.getItem("token");

      if (!token) {
        // User not signed in - show message to sign in
        setLandlord({
          name: "Property Owner",
          email: null,
          phone: null,
          contactViaPlatform: true,
        });
        return;
      }

      try {
        const response = await fetch(
          `${apiUrl}/api/users/landlord/${property.landlord_id}/contact`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.landlord) {
            setLandlord(data.landlord);
            return;
          }
        }
      } catch (apiError) {
        console.error("API Error:", apiError);
      }

      // Fallback: Try Supabase users table
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("id, name, email, phone")
        .eq("id", property.landlord_id)
        .single();

      if (!profileError && profileData) {
        setLandlord({
          name: profileData.name || "Landlord",
          email: profileData.email || "Not available",
          phone: profileData.phone || null,
        });
        return;
      }

      // Final fallback
      setLandlord({
        name: "Property Owner",
        email: null,
        phone: null,
        contactViaPlatform: true,
      });
    } catch (error) {
      console.error("Error fetching landlord info:", error);
      setLandlord({
        name: "Property Owner",
        email: null,
        phone: null,
        contactViaPlatform: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast({
        title: "Phone number not available",
        description: "Please contact the landlord through the platform.",
        variant: "destructive",
      });
    }
  };

  const handleEmail = (email: string) => {
    if (email) {
      window.location.href = `mailto:${email}`;
    } else {
      toast({
        title: "Email not available",
        description: "Please contact the landlord through the platform.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleBookNow = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to book a property",
        variant: "destructive",
      });
      window.location.href = "/signin?redirect=/properties";
      return;
    }
    setShowBookingForm(true);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to book a property",
        variant: "destructive",
      });
      return;
    }

    if (!bookingData.move_in_date) {
      toast({
        title: "Missing information",
        description: "Please select a move-in date",
        variant: "destructive",
      });
      return;
    }

    // Validate all required fields before submission
    if (!property?.id) {
      console.error('Property ID missing:', property);
      toast({
        title: "Error",
        description: "Property information is missing. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    // Check both id and _id fields for user
    const userId = user?.id || user?._id;
    if (!userId) {
      console.error('User ID missing:', user);
      toast({
        title: "Error",
        description: "User information is missing. Please sign in again.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const bookingPayload = {
        property_id: property.id,
        tenant_id: userId,
        landlord_id: property.landlord_id || property.landlord?.id || null,
        move_in_date: bookingData.move_in_date,
        move_out_date: bookingData.move_out_date || null,
        message: bookingData.message,
      };

      console.log('Submitting booking with payload:', bookingPayload);

      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingPayload),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response format from server");
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create booking");
      }

      toast({
        title: "Booking request sent!",
        description: "The landlord will review your request and get back to you.",
      });

      setShowBookingForm(false);
      setBookingData({ move_in_date: "", move_out_date: "", message: "" });
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit booking request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!property) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{property.title || "Property Details"}</DialogTitle>
              <DialogDescription className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {property.address || property.location || "Location not specified"}
              </DialogDescription>
            </div>
            <FavoriteButton 
              propertyId={property.id} 
              size="default"
              className="ml-2"
            />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Image Gallery */}
          {propertyImages.length > 0 ? (
            <div className="relative">
              <div className="h-96 md:h-[600px] w-full rounded-lg overflow-hidden">
                <img
                  src={propertyImages[currentImageIndex]}
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/property-placeholder.png';
                  }}
                />
              </div>
              
              {/* Navigation Arrows */}
              {propertyImages.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {propertyImages.length}
                  </div>
                </>
              )}
              
              {/* Thumbnail Navigation */}
              {propertyImages.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {propertyImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 h-20 w-28 rounded overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-primary ring-2 ring-primary scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-96 md:h-[600px] w-full rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Building2 className="w-24 h-24 text-primary/40" />
            </div>
          )}

          {/* Property Video */}
          {property.video_url && (
            <div className="mt-4">
              <h3 className="font-semibold text-lg mb-3">Property Video Tour</h3>
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                {property.video_url.includes('youtube.com') || property.video_url.includes('youtu.be') ? (
                  <iframe
                    src={property.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    className="w-full h-full"
                    allowFullScreen
                    title="Property Video"
                  />
                ) : property.video_url.includes('vimeo.com') ? (
                  <iframe
                    src={property.video_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                    className="w-full h-full"
                    allowFullScreen
                    title="Property Video"
                  />
                ) : (
                  <video 
                    controls 
                    className="w-full h-full"
                    src={property.video_url}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>
          )}

          {/* Property Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Property Details</h3>
                <div className="space-y-3">
                  {property.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{property.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BedDouble className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{property.bedrooms || 'N/A'} Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{property.bathrooms || 'N/A'} Bathrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{property.wifi_available ? 'WiFi available' : 'No WiFi'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{property.pets_allowed ? 'Pets allowed' : 'No pets'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{property.furnished ? 'Furnished' : 'Unfurnished'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{property.parking_available ? 'Parking available' : 'No parking'}</span>
                  </div>
                  {property.amenities && Array.isArray(property.amenities) && property.amenities.length > 0 && (
                    <div className="pt-2">
                      <div className="text-sm font-medium mb-2">Amenities</div>
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.map((a:any, idx:number) => (
                          <Badge key={idx} variant="secondary">{a}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <Badge variant="outline">{property.property_type || 'Property'}</Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-2xl font-bold text-primary">
                      R{property.price?.toLocaleString() || '0'}
                      <span className="text-sm font-normal text-muted-foreground ml-1">/month</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Landlord Contact Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Landlord
                </h3>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading contact information...</p>
                  </div>
                ) : landlord ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Name</p>
                      <p className="text-base font-medium">{landlord.name || "Property Owner"}</p>
                    </div>
                    
                    {landlord.email ? (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                        <div className="flex items-center gap-2">
                          <p className="text-base break-all flex-1">{landlord.email}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyToClipboard(landlord.email, "Email")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : null}
                    
                    {landlord.phone ? (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Phone</p>
                        <div className="flex items-center gap-2">
                          <p className="text-base flex-1">{landlord.phone}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyToClipboard(landlord.phone, "Phone number")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    {landlord.contactViaPlatform ? (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">
                          Contact information is available to registered tenants. Please sign in to view landlord contact details.
                        </p>
                        {!user && (
                          <Button className="w-full" onClick={() => window.location.href = '/signin'}>
                            Sign In to View Contact
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-2">
                        {landlord.phone ? (
                          <Button
                            onClick={() => handleCall(landlord.phone)}
                            className="flex-1"
                            variant="default"
                          >
                            <Phone className="mr-2 h-4 w-4" />
                            Call
                          </Button>
                        ) : null}
                        {landlord.email ? (
                          <Button
                            onClick={() => handleEmail(landlord.email)}
                            className="flex-1"
                            variant="outline"
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Email
                          </Button>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Contact information not available. Please sign in to contact the landlord.
                    </p>
                    {!user && (
                      <Button className="w-full" onClick={() => window.location.href = '/signin'}>
                        Sign In
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {property.description && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {property.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Booking Form or Button */}
          {showBookingForm ? (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Book This Property
                </h3>
                <form onSubmit={handleSubmitBooking} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="move_in_date">Move-in Date *</Label>
                      <Input
                        id="move_in_date"
                        type="date"
                        value={bookingData.move_in_date}
                        onChange={(e) => setBookingData({ ...bookingData, move_in_date: e.target.value })}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="move_out_date">Move-out Date (Optional)</Label>
                      <Input
                        id="move_out_date"
                        type="date"
                        value={bookingData.move_out_date}
                        onChange={(e) => setBookingData({ ...bookingData, move_out_date: e.target.value })}
                        min={bookingData.move_in_date || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message to Landlord (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Add any questions or special requests..."
                      value={bookingData.message}
                      onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting} className="flex-1">
                      {submitting ? "Submitting..." : "Submit Booking Request"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowBookingForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="flex justify-center">
              <Button size="lg" onClick={handleBookNow} className="px-12">
                <Calendar className="mr-2 h-5 w-5" />
                Book Now
              </Button>
            </div>
          )}

          {/* Similar Properties Section */}
          <RecommendedProperties
            title="Similar Properties"
            subtitle="Other great options in the same area"
            type="similar"
            referencePropertyId={property.id}
            limit={3}
            onPropertyClick={(propertyId) => {
              // Reload modal with new property
              window.location.hash = `property=${propertyId}`;
              onOpenChange(false);
            }}
          />

          {/* Reviews Section */}
          <PropertyReviews
            propertyId={property.id}
            reviews={[]}
            averageRating={4.5}
            totalReviews={0}
          />

          {/* Fraud Detector Section */}
          <FraudDetector
            propertyId={property.id}
            propertyTitle={property.title}
            propertyDescription={property.description}
            price={property.price}
            location={property.location}
            propertyType={property.property_type}
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
