import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, BedDouble, Bath, Search, Building2, ArrowLeft, Map, LayoutGrid, Video, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PropertyDetailModal } from "@/components/PropertyDetailModal";
import { RecommendedProperties } from "@/components/RecommendedProperties";
import { PropertiesMap } from "@/components/PropertiesMap";
import { StarRating } from "@/components/StarRating";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import type { SearchFilters } from "@/components/AdvancedSearch";
import { FavoriteButton } from "@/components/FavoriteButton";

const Properties = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [selectedPropertyForMap, setSelectedPropertyForMap] = useState<string | null>(null);
  
  const [propertyRatings, setPropertyRatings] = useState<{[key: string]: {avg: number, count: number}}>({});
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    search: "",
    minPrice: 0,
    maxPrice: 50000,
    bedrooms: "all",
    bathrooms: "all",
    property_type: "all",
    sortBy: "created_at",
    sortOrder: "DESC",
  });

  useEffect(() => {
    const verifiedParam = searchParams.get("verified");
    const isVerifiedFilter = verifiedParam === "true" || verifiedParam === "1";
    setOnlyVerified(isVerifiedFilter);
    fetchProperties(isVerifiedFilter);
  }, [searchParams]);

  const fetchProperties = async (verifiedOnly: boolean) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      
      // Build query parameters
      const params = new URLSearchParams();
      if (verifiedOnly) params.append('is_verified', 'true');
      if (searchFilters.search) params.append('search', searchFilters.search);
      if (searchFilters.minPrice > 0) params.append('minPrice', searchFilters.minPrice.toString());
      if (searchFilters.maxPrice < 50000) params.append('maxPrice', searchFilters.maxPrice.toString());
      if (searchFilters.bedrooms !== 'all') params.append('bedrooms', searchFilters.bedrooms);
      if (searchFilters.bathrooms !== 'all') params.append('bathrooms', searchFilters.bathrooms);
      if (searchFilters.property_type !== 'all') params.append('property_type', searchFilters.property_type);
      if (searchFilters.sortBy) params.append('sortBy', searchFilters.sortBy);
      if (searchFilters.sortOrder) params.append('sortOrder', searchFilters.sortOrder);
      
      const url = `${API_BASE}/api/properties?${params.toString()}`;
      
      console.log('Fetching from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw API response:', data);
      
      // Handle both array and object with value property
      const propertyList = Array.isArray(data) ? data : (data.value || []);
      console.log('Processed properties:', propertyList);
      
      setProperties(propertyList);
      
      // Fetch ratings for each property
      const ratings: {[key: string]: {avg: number, count: number}} = {};
      for (const prop of propertyList) {
        try {
          const ratingResponse = await fetch(`${API_BASE}/api/reviews/property/${prop.id}`);
          if (ratingResponse.ok) {
            const ratingData = await ratingResponse.json();
            ratings[prop.id] = {
              avg: ratingData.averageRating || 0,
              count: ratingData.totalReviews || 0
            };
          }
        } catch (err) {
          console.error('Error fetching rating for property:', prop.id);
        }
      }
      setPropertyRatings(ratings);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
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

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setLoading(true);
    fetchProperties(onlyVerified);
  };

  // filteredProperties is now just the properties array since filtering happens on backend
  const filteredProperties = properties;

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

          {/* Advanced Search & Filters */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-lg">
            <AdvancedSearch 
              onSearch={handleSearch}
              initialFilters={searchFilters}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <p className="text-muted-foreground">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
            </p>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("map")}
              >
                <Map className="w-4 h-4 mr-2" />
                Map
              </Button>
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
          ) : viewMode === "map" ? (
            <div className="relative">
              {/* Property Selector Overlay - appears on top of map */}
              {filteredProperties.length > 1 && (
                <div className="absolute top-4 left-4 z-[1000] bg-background/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-muted-foreground">Filter Map:</p>
                    <Select
                      value={selectedPropertyForMap || "all"}
                      onValueChange={(value) => setSelectedPropertyForMap(value === "all" ? null : value)}
                    >
                      <SelectTrigger className="w-[220px] bg-background">
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent className="z-[1001]">
                        <SelectItem value="all">All Properties</SelectItem>
                        {filteredProperties.map((prop) => (
                          <SelectItem key={prop.id} value={prop.id}>
                            {prop.title.length > 30 ? prop.title.substring(0, 30) + '...' : prop.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <PropertiesMap
                properties={selectedPropertyForMap 
                  ? filteredProperties.filter(p => p.id === selectedPropertyForMap)
                  : filteredProperties
                }
                onPropertyClick={(property) => {
                  setSelectedProperty(property);
                  setModalOpen(true);
                  trackPropertyView(property.id);
                }}
              />
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
                      <div className="absolute top-2 right-2">
                        <FavoriteButton propertyId={property.id} />
                      </div>
                      {property.video_url && (
                        <div className="absolute top-2 left-2 bg-red-600/90 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          Video
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Building2 className="w-20 h-20 text-primary/40" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold">{property.title}</h3>
                      {property.is_verified ? (
                        <Badge variant="default" className="bg-accent">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-yellow-400 text-yellow-700 bg-yellow-50">
                          Pending
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                    {propertyRatings[property.id]?.count > 0 && (
                      <div className="mt-2">
                        <StarRating 
                          rating={propertyRatings[property.id].avg} 
                          size="sm" 
                          showNumber 
                          readonly 
                        />
                      </div>
                    )}
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
                    <div className="flex items-center text-2xl font-bold text-primary mb-2">
                      R{property.price.toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground ml-1">/month</span>
                    </div>
                    {property.created_at && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        Posted {new Date(property.created_at).toLocaleDateString('en-ZA', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    )}
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
