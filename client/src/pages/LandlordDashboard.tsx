import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Home, Plus, Users, DollarSign, Edit, Trash, MapPin, BedDouble, Bath } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PropertyForm } from "@/components/PropertyForm";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const LandlordDashboard = () => {
  const { user, userType, setUser, setUserType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref: card1Ref, isVisible: card1Visible } = useScrollAnimation();
  const { ref: card2Ref, isVisible: card2Visible } = useScrollAnimation();
  const { ref: card3Ref, isVisible: card3Visible } = useScrollAnimation();
  const { ref: card4Ref, isVisible: card4Visible } = useScrollAnimation();

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
    if (userType !== 'landlord') {
      navigate(`/dashboard/${userType || 'landlord'}`);
    }
  }, [user, userType, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserType(null);
    navigate("/");
  };

  const fetchProperties = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("landlord_id", user._id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Property deleted successfully",
      });

      fetchProperties();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-8 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Landlord Dashboard</h1>
              <p className="text-muted-foreground mt-2">Manage your properties and tenants</p>
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
                <CardTitle className="text-sm font-medium">My Properties</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{properties.length}</div>
                <p className="text-xs text-muted-foreground">Listed properties</p>
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
                <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Current tenants</p>
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
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R0</div>
                <p className="text-xs text-muted-foreground">This month</p>
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
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Need review</p>
              </CardContent>
            </Card>
          </div>

          {showForm && (
            <div className="mb-6">
              <PropertyForm onSuccess={() => {
                setShowForm(false);
                fetchProperties();
              }} />
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your rental business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  onClick={() => setShowForm(!showForm)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {showForm ? "Cancel" : "Add New Property"}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  View My Properties ({properties.length})
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Tenants
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
                  <p className="text-sm">Landlord</p>
                </div>
                <Button variant="outline" className="w-full">Edit Profile</Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>My Properties</CardTitle>
              <CardDescription>Manage your listed properties</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading properties...</p>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-12">
                  <Home className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No properties listed yet. Click "Add New Property" to get started.
                  </p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Property
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {property.image_url ? (
                        <div className="h-48 overflow-hidden">
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
                        <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <Home className="w-16 h-16 text-primary/40" />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold line-clamp-1">{property.title}</h3>
                        </div>
                        <div className="flex items-center text-muted-foreground text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="line-clamp-1">{property.location}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center">
                            <BedDouble className="w-4 h-4 mr-1" />
                            {property.bedrooms}
                          </div>
                          <div className="flex items-center">
                            <Bath className="w-4 h-4 mr-1" />
                            {property.bathrooms}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {property.property_type}
                          </Badge>
                        </div>
                        <div className="flex items-center text-xl font-bold text-primary mb-4">
                          R{property.price?.toLocaleString()}
                          <span className="text-sm font-normal text-muted-foreground ml-1">/month</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              // TODO: Implement edit functionality
                              toast({
                                title: "Edit Property",
                                description: "Edit functionality coming soon!",
                              });
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(property.id)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LandlordDashboard;
