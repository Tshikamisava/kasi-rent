import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Home, Search, MessageSquare, FileText, MapPin, Calendar, Star, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { PropertyReviews } from "@/components/PropertyReviews";
import { useToast } from "@/hooks/use-toast";

const TenantDashboard = () => {
  const { user, userType, setUser, setUserType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { ref: card1Ref, isVisible: card1Visible } = useScrollAnimation();
  const { ref: card2Ref, isVisible: card2Visible } = useScrollAnimation();
  const { ref: card3Ref, isVisible: card3Visible } = useScrollAnimation();
  const { ref: card4Ref, isVisible: card4Visible } = useScrollAnimation();
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [writingReviewFor, setWritingReviewFor] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
    if (userType !== 'tenant') {
      navigate(`/dashboard/${userType || 'tenant'}`);
    } else {
      fetchBookings();
    }
  }, [user, userType, navigate]);

  const fetchBookings = async () => {
    if (!user?._id) return;
    
    try {
      setLoadingBookings(true);
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/bookings/tenant/${user._id}`);
      
      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load your bookings",
        variant: "destructive",
      });
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserType(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-8 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Tenant Dashboard</h1>
              <p className="text-muted-foreground mt-2">Welcome back! Find your perfect home.</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card 
              ref={card1Ref}
              className={`hover:shadow-lg transition-all ${
                card1Visible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
              }`}
              style={{ animationDelay: '0ms', animationFillMode: 'both' }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Browse Properties</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">150+</div>
                <p className="text-xs text-muted-foreground">Available listings</p>
              </CardContent>
            </Card>

            <Card 
              ref={card2Ref}
              className={`hover:shadow-lg transition-all ${
                card2Visible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
              }`}
              style={{ animationDelay: '100ms', animationFillMode: 'both' }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Bookings</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookings.length}</div>
                <p className="text-xs text-muted-foreground">Active bookings</p>
              </CardContent>
            </Card>

            <Card 
              ref={card3Ref}
              className={`hover:shadow-lg transition-all ${
                card3Visible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
              }`}
              style={{ animationDelay: '200ms', animationFillMode: 'both' }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Unread messages</p>
              </CardContent>
            </Card>

            <Card 
              ref={card4Ref}
              className={`hover:shadow-lg transition-all ${
                card4Visible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
              }`}
              style={{ animationDelay: '300ms', animationFillMode: 'both' }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Pending reviews</p>
              </CardContent>
            </Card>
          </div>

          {/* My Bookings Section */}
          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>View and manage your property bookings</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBookings ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No bookings yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start exploring properties and make your first booking!
                  </p>
                  <Button onClick={() => navigate('/properties')}>
                    <Search className="mr-2 h-4 w-4" />
                    Browse Properties
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Property Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-lg">
                                  {booking.property?.title || 'Property'}
                                </h4>
                                <div className="flex items-center text-muted-foreground text-sm mt-1">
                                  <MapPin className="w-3.5 h-3.5 mr-1" />
                                  {booking.property?.location || 'N/A'}
                                </div>
                              </div>
                              <Badge 
                                variant={
                                  booking.status === 'confirmed' ? 'default' :
                                  booking.status === 'pending' ? 'outline' :
                                  booking.status === 'completed' ? 'secondary' :
                                  'destructive'
                                }
                                className={
                                  booking.status === 'pending' 
                                    ? 'border-yellow-400 text-yellow-700 bg-yellow-50' 
                                    : booking.status === 'confirmed'
                                    ? 'bg-emerald-500'
                                    : ''
                                }
                              >
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                            </div>

                            {/* Booking Details */}
                            <div className="space-y-2 mt-4">
                              <div className="flex items-center text-sm">
                                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground">Move-in:</span>
                                <span className="ml-2 font-medium">
                                  {new Date(booking.move_in_date).toLocaleDateString()}
                                </span>
                              </div>
                              {booking.move_out_date && (
                                <div className="flex items-center text-sm">
                                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                  <span className="text-muted-foreground">Move-out:</span>
                                  <span className="ml-2 font-medium">
                                    {new Date(booking.move_out_date).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              {booking.property?.price && (
                                <div className="text-sm mt-2">
                                  <span className="text-primary font-bold text-lg">
                                    R{booking.property.price.toLocaleString()}
                                  </span>
                                  <span className="text-muted-foreground ml-1">/month</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions - Write Review for completed bookings */}
                          {booking.status === 'completed' && (
                            <div className="flex md:flex-col gap-2 md:min-w-[120px]">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 md:w-full"
                                onClick={() => setWritingReviewFor(booking.property_id)}
                              >
                                <Pencil className="w-4 h-4 mr-1" />
                                Write Review
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Review Form */}
                        {writingReviewFor === booking.property_id && (
                          <div className="mt-4 pt-4 border-t">
                            <PropertyReviews 
                              propertyId={booking.property_id} 
                              onSubmitReview={() => {
                                setWritingReviewFor(null);
                                toast({
                                  title: "Review Submitted",
                                  description: "Thank you for your feedback!",
                                });
                              }}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with your rental search</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Search className="mr-2 h-4 w-4" />
                  Search Properties
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  View Saved Properties
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                  <p className="text-sm">Tenant</p>
                </div>
                <Button variant="outline" className="w-full">Edit Profile</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TenantDashboard;
