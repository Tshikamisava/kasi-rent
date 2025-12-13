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
import { MapPin, BedDouble, Bath, Phone, Mail, User, Building2, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

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

  if (!property) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{property.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {property.location}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Image */}
          {property.image_url ? (
            <div className="h-64 w-full rounded-lg overflow-hidden">
              <img
                src={property.image_url}
                alt={property.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/property-placeholder.png';
                }}
              />
            </div>
          ) : (
            <div className="h-64 w-full rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Building2 className="w-24 h-24 text-primary/40" />
            </div>
          )}

          {/* Property Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Property Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BedDouble className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{property.bedrooms} Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{property.bathrooms} Bathrooms</span>
                  </div>
                  <div>
                    <Badge variant="outline">{property.property_type}</Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-2xl font-bold text-primary">
                      R{property.price?.toLocaleString()}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
