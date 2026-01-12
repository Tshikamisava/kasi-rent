import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, BedDouble, Bath, Search, Building2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PropertyDetailModal } from "@/components/PropertyDetailModal";
import { RecommendedProperties } from "@/components/RecommendedProperties";
import { FavoriteButton } from "@/components/FavoriteButton";

const Properties = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [priceRangeFilter, setPriceRangeFilter] = useState("all");

  useEffect(() => {
    const verifiedParam = searchParams.get("verified");
    const isVerifiedFilter = verifiedParam === "true" || verifiedParam === "1";
    setOnlyVerified(isVerifiedFilter);
    fetchProperties(isVerifiedFilter);
  }, [searchParams]);

  const fetchProperties = async (verifiedOnly: boolean) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const verifiedParam = verifiedOnly ? '?is_verified=true' : '';
      const response = await fetch(`${API_BASE}/api/properties${verifiedParam}`);
      const data = await response.json();

      if (!response.ok) throw new Error('Failed to fetch properties');
      
      setProperties(data || []);
      setFilteredProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
      setFilteredProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const trackPropertyView = async (propertyId: string) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await fetch(`${API_BASE}/api/recommendations/track-view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });

      // Also store in localStorage for personalized recommendations
      const viewed = localStorage.getItem("viewedProperties");
      const viewedList = viewed ? JSON.parse(viewed) : [];
      if (!viewedList.includes(propertyId)) {
        viewedList.push(propertyId);
        localStorage.setItem("viewedProperties", JSON.stringify(viewedList));
      }
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  const filteredProperties = properties.filter((property) => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location?.toLowerCase().includes(searchQuery.toLowerCase());

    // Property type filter
    const matchesType = propertyTypeFilter === "all" || 
      property.property_type?.toLowerCase() === propertyTypeFilter.toLowerCase();

    // Price range filter
    let matchesPrice = true;
    if (priceRangeFilter !== "all") {
      const price = property.price || 0;
      if (priceRangeFilter === "0-2000") matchesPrice = price <= 2000;
      else if (priceRangeFilter === "2000-4000") matchesPrice = price > 2000 && price <= 4000;
      else if (priceRangeFilter === "4000-6000") matchesPrice = price > 4000 && price <= 6000;
      else if (priceRangeFilter === "6000+") matchesPrice = price > 6000;
    }

    return matchesSearch && matchesType && matchesPrice;
  });

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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Home</h1>
            <p className="text-xl text-muted-foreground">
              Browse verified properties across South African townships
            </p>
            {onlyVerified && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm border border-emerald-200">
                Showing verified listings only
              </div>
            )}
          </div>

          {/* Search & Filters */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-12 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="Search by location or property name..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="bachelor">Bachelor</SelectItem>
                  <SelectItem value="room">Room</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priceRangeFilter} onValueChange={setPriceRangeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-2000">R0 - R2,000</SelectItem>
                  <SelectItem value="2000-4000">R2,000 - R4,000</SelectItem>
                  <SelectItem value="4000-6000">R4,000 - R6,000</SelectItem>
                  <SelectItem value="6000+">R6,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Property Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading properties...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-20 max-w-2xl mx-auto">
              <Building2 className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50" />
              <h2 className="text-3xl font-bold mb-4">{properties.length === 0 ? 'No Properties Available Yet' : 'No Properties Match Your Filters'}</h2>
              <p className="text-lg text-muted-foreground mb-8">
                {properties.length === 0 
                  ? 'Are you a landlord? Be the first to list your property and reach thousands of potential tenants!'
                  : 'Try adjusting your search filters to find more properties.'}
              </p>
              {properties.length === 0 && (
                <a href="/get-started">
                  <Button size="lg" className="px-8">
                    List Your Property
                  </Button>
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  {property.image_url ? (
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={property.image_url} 
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/property-placeholder.png';
                        }}
                      />
                      {/* Favorite Button */}
                      <div className="absolute top-2 right-2">
                        <FavoriteButton 
                          propertyId={property.id} 
                          variant="default"
                          className="bg-white/90 hover:bg-white shadow-md"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Building2 className="w-20 h-20 text-primary/40" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold">{property.title}</h3>
                      {property.is_verified && (
                        <Badge variant="default" className="bg-accent">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <BedDouble className="w-4 h-4 mr-1" />
                        {property.bedrooms}
                      </div>
                      <div className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        {property.bathrooms}
                      </div>
                      <Badge variant="outline">{property.property_type}</Badge>
                    </div>
                    <div className="flex items-center text-2xl font-bold text-primary">
                      R{property.price.toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground ml-1">/month</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => {
                        setSelectedProperty(property);
                        setModalOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations Section */}
        {!loading && filteredProperties.length > 0 && (
          <>
            <div className="mb-12 mt-20">
              <RecommendedProperties
                title="Trending Properties"
                subtitle="Most viewed and popular listings"
                type="trending"
                limit={6}
                onPropertyClick={(propertyId) => {
                  trackPropertyView(propertyId);
                  const property = properties.find(p => p.id === propertyId);
                  if (property) {
                    setSelectedProperty(property);
                    setModalOpen(true);
                  }
                }}
              />
            </div>
          </>
        )}
      </main>
      <Footer />
      
      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          property={selectedProperty}
        />
      )}
    </div>
  );
};

export default Properties;
