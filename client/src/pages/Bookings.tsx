import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, MapPin, Home, CheckCircle, Clock, X, History } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const Bookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    if (!user) {
      navigate("/signin?redirect=/bookings");
      return;
    }
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      const userId = user.id || user._id;
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/bookings/tenant/${userId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch bookings");
      }

      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Cancelled</Badge>;
      case "completed":
        return <Badge className="bg-blue-500"><History className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const activeBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  const renderBookingCard = (booking: any) => (
    <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      {booking.property?.image_url ? (
        <div className="h-48 overflow-hidden">
          <img
            src={booking.property.image_url}
            alt={booking.property.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Home className="w-16 h-16 text-primary/40" />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg">{booking.property?.title || "Property"}</CardTitle>
          {getStatusBadge(booking.status)}
        </div>
        <CardDescription>
          <div className="flex items-start gap-1">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
            <span className="text-sm">{booking.property?.location || "Location not available"}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm bg-muted/50 p-2 rounded">
            <Calendar className="w-4 h-4 mr-2 text-primary" />
            <span className="font-medium">Move-in: {new Date(booking.move_in_date).toLocaleDateString()}</span>
          </div>
          {booking.move_out_date && (
            <div className="flex items-center text-sm bg-muted/50 p-2 rounded">
              <Calendar className="w-4 h-4 mr-2 text-primary" />
              <span className="font-medium">Move-out: {new Date(booking.move_out_date).toLocaleDateString()}</span>
            </div>
          )}
          {booking.message && (
            <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded border-l-2 border-primary">
              <p className="font-semibold mb-1">Your message:</p>
              <p className="line-clamp-2">{booking.message}</p>
            </div>
          )}
          <div className="pt-2 border-t">
            <div className="flex items-center text-xl font-bold text-primary">
              R{booking.property?.price?.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground ml-1">/month</span>
            </div>
          </div>
          <Button 
            className="w-full" 
            variant={booking.status === "confirmed" ? "outline" : "default"}
            onClick={() => navigate(`/properties`)}
          >
            View Property Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="mb-4">
            <button type="button" onClick={handleBack} className="p-2 rounded-lg hover:bg-muted flex items-center gap-2 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">My Bookings</h1>
            <p className="text-xl text-muted-foreground mb-6">
              View and manage your property bookings
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>{activeBookings.length} Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>{completedBookings.length} Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>{cancelledBookings.length} Cancelled</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20 max-w-2xl mx-auto">
              <Calendar className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50" />
              <h2 className="text-3xl font-bold mb-4">No Bookings Yet</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Start browsing properties to make your first booking!
              </p>
              <Button size="lg" onClick={() => navigate('/properties')}>
                Browse Properties
              </Button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="active">Active ({activeBookings.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled ({cancelledBookings.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-6">
                {activeBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg text-muted-foreground">No active bookings</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeBookings.map(renderBookingCard)}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                {completedBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg text-muted-foreground">No completed bookings</p>
                    <p className="text-sm text-muted-foreground mt-2">Your booking history will appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedBookings.map(renderBookingCard)}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="mt-6">
                {cancelledBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <X className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg text-muted-foreground">No cancelled bookings</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cancelledBookings.map(renderBookingCard)}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Bookings;
