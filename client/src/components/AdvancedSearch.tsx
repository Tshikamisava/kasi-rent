import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";

export interface SearchFilters {
  search: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: string;
  bathrooms: string;
  property_type: string;
  sortBy: string;
  sortOrder: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

export const AdvancedSearch = ({ onSearch, initialFilters }: AdvancedSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    search: initialFilters?.search || "",
    minPrice: initialFilters?.minPrice || 0,
    maxPrice: initialFilters?.maxPrice || 50000,
    bedrooms: initialFilters?.bedrooms || "all",
    bathrooms: initialFilters?.bathrooms || "all",
    property_type: initialFilters?.property_type || "all",
    sortBy: initialFilters?.sortBy || "created_at",
    sortOrder: initialFilters?.sortOrder || "DESC",
  });

  const [priceRange, setPriceRange] = useState([
    filters.minPrice,
    filters.maxPrice,
  ]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    setFilters((prev) => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1],
    }));
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      search: "",
      minPrice: 0,
      maxPrice: 50000,
      bedrooms: "all",
      bathrooms: "all",
      property_type: "all",
      sortBy: "created_at",
      sortOrder: "DESC",
    };
    setFilters(resetFilters);
    setPriceRange([0, 50000]);
    onSearch(resetFilters);
  };

  const activeFiltersCount = [
    filters.search !== "",
    filters.minPrice > 0 || filters.maxPrice < 50000,
    filters.bedrooms !== "all",
    filters.bathrooms !== "all",
    filters.property_type !== "all",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by location, title, or description..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Advanced Filters</SheetTitle>
              <SheetDescription>
                Refine your property search with detailed filters
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* Price Range */}
              <div className="space-y-3">
                <Label>Price Range</Label>
                <div className="px-2">
                  <Slider
                    min={0}
                    max={50000}
                    step={500}
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>R{priceRange[0].toLocaleString()}</span>
                  <span>R{priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <Label>Property Type</Label>
                <Select
                  value={filters.property_type}
                  onValueChange={(value) =>
                    handleFilterChange("property_type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Townhouse">Townhouse</SelectItem>
                    <SelectItem value="Studio">Studio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bedrooms */}
              <div className="space-y-2">
                <Label>Bedrooms</Label>
                <Select
                  value={filters.bedrooms}
                  onValueChange={(value) => handleFilterChange("bedrooms", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bedrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5+">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bathrooms */}
              <div className="space-y-2">
                <Label>Bathrooms</Label>
                <Select
                  value={filters.bathrooms}
                  onValueChange={(value) => handleFilterChange("bathrooms", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bathrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3+">3+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => handleFilterChange("sortBy", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Date Listed</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="bedrooms">Bedrooms</SelectItem>
                    <SelectItem value="bathrooms">Bathrooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value) => handleFilterChange("sortOrder", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DESC">Descending</SelectItem>
                    <SelectItem value="ASC">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    handleSearch();
                    setIsOpen(false);
                  }}
                  className="flex-1"
                >
                  Apply Filters
                </Button>
                <Button onClick={handleReset} variant="outline">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <span>Search: {filters.search}</span>
              <button
                onClick={() => {
                  handleFilterChange("search", "");
                  handleSearch();
                }}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {(filters.minPrice > 0 || filters.maxPrice < 50000) && (
            <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <span>
                R{filters.minPrice.toLocaleString()} - R
                {filters.maxPrice.toLocaleString()}
              </span>
              <button
                onClick={() => {
                  setPriceRange([0, 50000]);
                  handleFilterChange("minPrice", 0);
                  handleFilterChange("maxPrice", 50000);
                  handleSearch();
                }}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.bedrooms !== "all" && (
            <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <span>{filters.bedrooms} Bedrooms</span>
              <button
                onClick={() => {
                  handleFilterChange("bedrooms", "all");
                  handleSearch();
                }}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.bathrooms !== "all" && (
            <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <span>{filters.bathrooms} Bathrooms</span>
              <button
                onClick={() => {
                  handleFilterChange("bathrooms", "all");
                  handleSearch();
                }}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.property_type !== "all" && (
            <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <span>{filters.property_type}</span>
              <button
                onClick={() => {
                  handleFilterChange("property_type", "all");
                  handleSearch();
                }}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
