import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Home, Plus, Users, DollarSign, Edit, Trash, MapPin, BedDouble, Bath, ShieldCheck, ArrowLeft, Images, ChevronLeft, ChevronRight, Calendar, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PropertyForm } from "@/components/PropertyForm";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const LandlordDashboard = () => {
  const { user, userType, setUser, setUserType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [imageIndexes, setImageIndexes] = useState<{ [key: string]: number }>({});
  const { ref: card1Ref, isVisible: card1Visible } = useScrollAnimation();
  const { ref: card2Ref, isVisible: card2Visible } = useScrollAnimation();
  const { ref: card3Ref, isVisible: card3Visible } = useScrollAnimation();
  const { ref: card4Ref, isVisible: card4Visible } = useScrollAnimation();

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }

    // Allow landlords or admins to access the dashboard
    if (userType !== 'landlord' && userType !== 'admin') {
      toast({
        title: 'Unauthorized',
        description: 'Only landlords or administrators can access the Landlord Dashboard.',
        variant: 'destructive'
      });
      navigate('/');
    }
  }, [user, userType, navigate, toast]);

  const handleSignOut = async () => {
    // Clear user state and local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUserType(null);
    navigate("/");
  };

  const fetchProperties = async () => {
    if (!user) return;
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/properties?landlord_id=${user._id}`);
      const data = await response.json();

      if (!response.ok) throw new Error('Failed to fetch properties');
      setProperties(data || []);
      
      // Initialize image indexes for each property
      const indexes: { [key: string]: number } = {};
      (data || []).forEach(prop => {
        indexes[prop.id] = 0;
      });
      setImageIndexes(indexes);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/bookings/landlord/${user._id}`);
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
        
        // Extract unique tenants from bookings
        const uniqueTenants = Array.from(
          new Set(data.bookings?.map((b: any) => b.tenant_id))
        );
        setTenants(uniqueTenants as any[]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchBookings();
  }, [user]);

  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const totalMonthlyRevenue = properties.reduce((sum, prop) => sum + (parseFloat(prop.price) || 0), 0);

  const nextImage = (propertyId: string, totalImages: number) => {
    setImageIndexes(prev => ({
      ...prev,
      [propertyId]: (prev[propertyId] + 1) % totalImages
    }));
  };

  const prevImage = (propertyId: string, totalImages: number) => {
    setImageIndexes(prev => ({
      ...prev,
      [propertyId]: (prev[propertyId] - 1 + totalImages) % totalImages
    }));
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const handleDelete = async (id: string) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/properties/${id}?landlord_id=${user?._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete property');
      }

      toast({
        title: "Success",
        description: "Property deleted successfully",
      });

      fetchProperties();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete property",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (property: any) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleUpdateProperty = async (updatedProperty: any) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/properties/${editingProperty.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updatedProperty,
          landlord_id: user?._id
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update property');
      }

      toast({
        title: "Success",
        description: "Property updated successfully",
      });

      setEditingProperty(null);
      setShowForm(false);
      fetchProperties();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update property",
        variant: "destructive",
      });
    }
  };

  const handleToggleVerification = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ is_verified: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Property ${!currentStatus ? 'verified' : 'unverified'} successfully`,
      });

      fetchProperties();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-8 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="mb-4">
            <button type="button" onClick={handleBack} className="p-2 rounded-lg hover:bg-muted flex items-center gap-2 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
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
              className={`hover:shadow-lg transition-all cursor-pointer ${
                card1Visible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
              }`}
              style={{ animationDelay: '0ms', animationFillMode: 'both' }}
              onClick={() => document.getElementById('my-properties-section')?.scrollIntoView({ behavior: 'smooth' })}
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
              className={`hover:shadow-lg transition-all cursor-pointer ${
                card2Visible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
              }`}
              style={{ animationDelay: '100ms', animationFillMode: 'both' }}
              onClick={() => {
                toast({
                  title: "Active Tenants",
                  description: `You have ${tenants.length} active tenant(s)`,
                });
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenants.length}</div>
                <p className="text-xs text-muted-foreground">Current tenants</p>
              </CardContent>
            </Card>

            <Card 
              ref={card3Ref}
              className={`hover:shadow-lg transition-all cursor-pointer ${
                card3Visible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
              }`}
              style={{ animationDelay: '200ms', animationFillMode: 'both' }}
              onClick={() => {
                toast({
                  title: "Monthly Revenue",
                  description: `Potential: R${totalMonthlyRevenue.toLocaleString()}`,
                });
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R{totalMonthlyRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Potential earnings</p>
              </CardContent>
            </Card>

            <Card 
              ref={card4Ref}
              className={`hover:shadow-lg transition-all cursor-pointer ${
                card4Visible ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
              }`}
              style={{ animationDelay: '300ms', animationFillMode: 'both' }}
              onClick={() => {
                if (pendingBookings > 0) {
                  toast({
                    title: "Pending Requests",
                    description: `You have ${pendingBookings} booking request(s) awaiting review`,
                  });
                } else {
                  toast({
                    title: "No Pending Requests",
                    description: "All booking requests have been processed",
                  });
                }
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingBookings}</div>
                <p className="text-xs text-muted-foreground">Need review</p>
              </CardContent>
            </Card>
          </div>

          {showForm && (
            <div className="mb-6">
              <PropertyForm 
                onSuccess={() => {
                  setShowForm(false);
                  setEditingProperty(null);
                  fetchProperties();
                }}
                initialData={editingProperty}
                onUpdate={editingProperty ? handleUpdateProperty : undefined}
              />
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

          <Card id="my-properties-section">
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
                  {properties.map((property) => {
                    const propertyImages = property.images && Array.isArray(property.images) && property.images.length > 0
                      ? property.images
                      : property.image_url
                      ? [property.image_url]
                      : [];
                    
                    const currentIndex = imageIndexes[property.id] || 0;
                    const currentImage = propertyImages[currentIndex];

                    return (
                    <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
                      {propertyImages.length > 0 ? (
                        <div className="relative h-56 overflow-hidden group">
                          <img
                            src={currentImage}
                            alt={property.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/property-placeholder.png';
                            }}
                          />
                          
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          {/* Image counter badge */}
                          {propertyImages.length > 1 && (
                            <>
                              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                                <Images className="w-3.5 h-3.5" />
                                {currentIndex + 1} / {propertyImages.length}
                              </div>
                              
                              {/* Navigation arrows */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  prevImage(property.id, propertyImages.length);
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                                aria-label="Previous image"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  nextImage(property.id, propertyImages.length);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                                aria-label="Next image"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                              
                              {/* Thumbnail dots */}
                              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {propertyImages.map((_, idx) => (
                                  <button
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setImageIndexes(prev => ({ ...prev, [property.id]: idx }));
                                    }}
                                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                      idx === currentIndex
                                        ? 'bg-white w-6'
                                        : 'bg-white/50 hover:bg-white/75'
                                    }`}
                                    aria-label={`Go to image ${idx + 1}`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="h-56 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <Home className="w-20 h-20 text-primary/40" />
                        </div>
                      )}
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold line-clamp-1">{property.title}</h3>
                          {property.is_verified ? (
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 shadow-md">
                              <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="shadow-sm">
                              Pending
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-muted-foreground text-sm">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="line-clamp-1">{property.location}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center">
                            <BedDouble className="w-4 h-4 mr-1" />
                            <span className="font-medium">{property.bedrooms}</span>
                          </div>
                          <div className="flex items-center">
                            <Bath className="w-4 h-4 mr-1" />
                            <span className="font-medium">{property.bathrooms}</span>
                          </div>
                          <Badge variant="outline" className="text-xs font-semibold">
                            {property.property_type}
                          </Badge>
                        </div>
                        <div className="flex items-baseline text-2xl font-bold text-primary mb-4">
                          R{property.price?.toLocaleString()}
                          <span className="text-sm font-normal text-muted-foreground ml-1">/month</span>
                        </div>
                        
                        {/* Property stats */}
                        <div className="bg-muted/50 rounded-lg p-3 mb-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Listed
                            </span>
                            <span className="font-medium">
                              {new Date(property.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {propertyImages.length > 1 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Images className="w-3.5 h-3.5" />
                                Gallery
                              </span>
                              <span className="font-medium">{propertyImages.length} photos</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button
                            variant={property.is_verified ? "outline" : "default"}
                            size="sm"
                            className="w-full"
                            onClick={() => handleToggleVerification(property.id, property.is_verified)}
                          >
                            <ShieldCheck className="w-4 h-4 mr-1" />
                            {property.is_verified ? 'Unverify' : 'Mark as Verified'}
                          </Button>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleEdit(property)}
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
                        </div>
                      </CardContent>
                    </Card>
                    );
                  })}
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
