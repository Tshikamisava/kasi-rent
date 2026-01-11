import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Home, 
  Calendar, 
  Heart,
  Edit2,
  Save,
  X,
  Loader2
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  profile_photo?: string;
  bio?: string;
  phone?: string;
  location?: string;
  created_at: string;
}

interface ProfileStats {
  properties: number;
  bookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  favorites: number;
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  images: string[];
  average_rating: number;
  review_count: number;
  booking_count: number;
}

interface Booking {
  id: string;
  property_title: string;
  property_location: string;
  property_price: number;
  property_images: string[];
  check_in_date: string;
  check_out_date: string;
  status: string;
  total_price: number;
  landlord_name: string;
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "properties" | "bookings">("overview");
  
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    phone: "",
    location: "",
    profile_photo: ""
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === "properties" && properties.length === 0) {
      fetchProperties();
    } else if (activeTab === "bookings" && bookings.length === 0) {
      fetchBookings();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await fetch(`${API_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setStats(data.stats);
        setEditForm({
          name: data.user.name || "",
          bio: data.user.bio || "",
          phone: data.user.phone || "",
          location: data.user.location || "",
          profile_photo: data.user.profile_photo || ""
        });
      } else {
        throw new Error("Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/profile/properties`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/profile/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setEditForm(prev => ({ ...prev, profile_photo: data.url }));
        toast({
          title: "Success",
          description: "Photo uploaded successfully",
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              <div className="relative">
                {editForm.profile_photo || user.profile_photo ? (
                  <img
                    src={editForm.profile_photo || user.profile_photo}
                    alt={user.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-200">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90">
                    <Edit2 className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {!isEditing ? (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                      <Badge variant="outline" className="mb-2">
                        {user.role === "landlord" ? "Property Owner" : "Tenant"}
                      </Badge>
                    </div>
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>

                  {user.bio && (
                    <p className="text-gray-600 mb-4">{user.bio}</p>
                  )}

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {user.phone}
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {user.location}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Edit Profile</h2>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            name: user.name || "",
                            bio: user.bio || "",
                            phone: user.phone || "",
                            location: user.location || "",
                            profile_photo: user.profile_photo || ""
                          });
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        size="sm"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <Textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <Input
                      value={editForm.location}
                      onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Home className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{stats.properties}</p>
              <p className="text-sm text-gray-600">Properties</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{stats.bookings}</p>
              <p className="text-sm text-gray-600">Bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">{stats.pendingBookings}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{stats.confirmedBookings}</p>
              <p className="text-sm text-gray-600">Confirmed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <p className="text-2xl font-bold">{stats.favorites}</p>
              <p className="text-sm text-gray-600">Favorites</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          onClick={() => setActiveTab("overview")}
          variant={activeTab === "overview" ? "default" : "outline"}
        >
          Overview
        </Button>
        {user.role === "landlord" && (
          <Button
            onClick={() => setActiveTab("properties")}
            variant={activeTab === "properties" ? "default" : "outline"}
          >
            My Properties
          </Button>
        )}
        <Button
          onClick={() => setActiveTab("bookings")}
          variant={activeTab === "bookings" ? "default" : "outline"}
        >
          My Bookings
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <Card>
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Welcome to your profile dashboard! Here you can manage your account,
                view your {user.role === "landlord" ? "properties" : "bookings"}, and update your information.
              </p>
              {user.role === "landlord" && (
                <Button onClick={() => navigate("/add-property")}>
                  Add New Property
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "properties" && user.role === "landlord" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600 mb-4">You haven't listed any properties yet.</p>
                <Button onClick={() => navigate("/add-property")}>
                  List Your First Property
                </Button>
              </CardContent>
            </Card>
          ) : (
            properties.map((property) => (
              <Card key={property.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/properties`)}>
                <CardContent className="p-4">
                  <img
                    src={property.images[0] || "/placeholder.jpg"}
                    alt={property.title}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {property.location}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-primary">
                      R{property.price.toLocaleString()}/mo
                    </p>
                    <div className="text-sm text-gray-600">
                      ⭐ {Number(property.average_rating).toFixed(1)} ({property.review_count})
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {property.booking_count} bookings
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600 mb-4">You don't have any bookings yet.</p>
                <Button onClick={() => navigate("/properties")}>
                  Browse Properties
                </Button>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <img
                      src={booking.property_images[0] || "/placeholder.jpg"}
                      alt={booking.property_title}
                      className="w-full md:w-48 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.property_title}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {booking.property_location}
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                        <div>
                          <span className="font-medium">Check-in:</span>{" "}
                          {new Date(booking.check_in_date).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Check-out:</span>{" "}
                          {new Date(booking.check_out_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                          Host: {booking.landlord_name}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          R{booking.total_price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
