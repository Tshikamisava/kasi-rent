import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Search, SlidersHorizontal, Save, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function AdvancedSearch() {
  const [filters, setFilters] = useState({
    location: '',
    min_price: 0,
    max_price: 50000,
    bedrooms: '',
    bathrooms: '',
    property_type: '',
    furnished: false,
    pets_allowed: false,
    utilities_included: false,
    available_from: '',
  });

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    searchProperties();
  }, []);

  const searchProperties = async () => {
    try {
      setLoading(true);
      
      // Build query string
      const params = new URLSearchParams();
      if (filters.location) params.append('location', filters.location);
      if (filters.min_price > 0) params.append('min_price', filters.min_price.toString());
      if (filters.max_price < 50000) params.append('max_price', filters.max_price.toString());
      if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
      if (filters.bathrooms) params.append('bathrooms', filters.bathrooms);
      if (filters.property_type) params.append('property_type', filters.property_type);
      if (filters.furnished) params.append('furnished', 'true');
      if (filters.pets_allowed) params.append('pets_allowed', 'true');
      if (filters.utilities_included) params.append('utilities_included', 'true');
      if (filters.available_from) params.append('available_from', filters.available_from);

      const response = await fetch(`${API_BASE}/api/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setProperties(data.properties || []);
      setTotalResults(data.total || 0);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to search properties",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSearch = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Please login to save searches",
          variant: "destructive"
        });
        return;
      }

      const searchName = prompt('Enter a name for this search:');
      if (!searchName) return;

      const response = await fetch(`${API_BASE}/api/search/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: searchName,
          ...filters,
          email_alerts: true,
          alert_frequency: 'daily'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save search');
      }

      toast({
        title: "Success",
        description: "Search saved! You'll receive email alerts for new matches."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save search",
        variant: "destructive"
      });
    }
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      min_price: 0,
      max_price: 50000,
      bedrooms: '',
      bathrooms: '',
      property_type: '',
      furnished: false,
      pets_allowed: false,
      utilities_included: false,
      available_from: '',
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Search className="w-8 h-8 text-primary" />
          Advanced Property Search
        </h1>
        <p className="text-gray-600">Find your perfect property with advanced filters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                  {showFilters ? <X className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            {showFilters && (
              <CardContent className="space-y-4">
                {/* Location */}
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City or area"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                  />
                </div>

                {/* Price Range */}
                <div>
                  <Label>Price Range: R{filters.min_price.toLocaleString()} - R{filters.max_price.toLocaleString()}</Label>
                  <div className="space-y-2 mt-2">
                    <Slider
                      value={[filters.min_price]}
                      onValueChange={(value) => setFilters({...filters, min_price: value[0]})}
                      max={50000}
                      step={500}
                    />
                    <Slider
                      value={[filters.max_price]}
                      onValueChange={(value) => setFilters({...filters, max_price: value[0]})}
                      max={50000}
                      step={500}
                    />
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Select value={filters.bedrooms || 'any'} onValueChange={(value) => setFilters({...filters, bedrooms: value === 'any' ? '' : value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="0">Studio</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bathrooms */}
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Select value={filters.bathrooms || 'any'} onValueChange={(value) => setFilters({...filters, bathrooms: value === 'any' ? '' : value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Property Type */}
                <div>
                  <Label htmlFor="property_type">Property Type</Label>
                  <Select value={filters.property_type || 'any'} onValueChange={(value) => setFilters({...filters, property_type: value === 'any' ? '' : value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amenities */}
                <div className="space-y-2">
                  <Label>Amenities</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="furnished"
                      checked={filters.furnished}
                      onCheckedChange={(checked) => setFilters({...filters, furnished: checked as boolean})}
                    />
                    <label htmlFor="furnished" className="text-sm cursor-pointer">Furnished</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pets_allowed"
                      checked={filters.pets_allowed}
                      onCheckedChange={(checked) => setFilters({...filters, pets_allowed: checked as boolean})}
                    />
                    <label htmlFor="pets_allowed" className="text-sm cursor-pointer">Pets Allowed</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="utilities_included"
                      checked={filters.utilities_included}
                      onCheckedChange={(checked) => setFilters({...filters, utilities_included: checked as boolean})}
                    />
                    <label htmlFor="utilities_included" className="text-sm cursor-pointer">Utilities Included</label>
                  </div>
                </div>

                {/* Available From */}
                <div>
                  <Label htmlFor="available_from">Available From</Label>
                  <Input
                    id="available_from"
                    type="date"
                    value={filters.available_from}
                    onChange={(e) => setFilters({...filters, available_from: e.target.value})}
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t">
                  <Button className="w-full" onClick={searchProperties} disabled={loading}>
                    <Search className="w-4 h-4 mr-2" />
                    {loading ? 'Searching...' : 'Search'}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={saveSearch}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Search
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={resetFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Reset Filters
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {totalResults} {totalResults === 1 ? 'Property' : 'Properties'} Found
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : properties.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No properties found matching your criteria</p>
                <p className="text-sm mt-2">Try adjusting your filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.map((property: any) => (
                <Card key={property.id} className="hover:shadow-lg transition-shadow">
                  <img
                    src={property.images?.[0] || property.image_url || '/placeholder.jpg'}
                    alt={property.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{property.location}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        R{property.price.toLocaleString()}
                      </span>
                      <div className="text-sm text-gray-500">
                        {property.bedrooms} bed • {property.bathrooms} bath
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
