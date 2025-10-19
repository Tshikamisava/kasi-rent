import { MapPin, BedDouble, Bath, Search } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const allProperties = [
  {
    id: 1,
    title: "Modern 2-Bedroom in Soweto",
    location: "Orlando East, Soweto",
    price: "R4,500",
    bedrooms: 2,
    bathrooms: 1,
    type: "Apartment",
    verified: true,
  },
  {
    id: 2,
    title: "Spacious Bachelor in Khayelitsha",
    location: "Site C, Khayelitsha",
    price: "R2,800",
    bedrooms: 1,
    bathrooms: 1,
    type: "Bachelor",
    verified: true,
  },
  {
    id: 3,
    title: "Family Home in Alexandra",
    location: "East Bank, Alexandra",
    price: "R6,200",
    bedrooms: 3,
    bathrooms: 2,
    type: "House",
    verified: true,
  },
  {
    id: 4,
    title: "Cozy Room in Diepsloot",
    location: "Extension 7, Diepsloot",
    price: "R1,800",
    bedrooms: 1,
    bathrooms: 1,
    type: "Room",
    verified: true,
  },
  {
    id: 5,
    title: "3-Bedroom in Mamelodi",
    location: "West, Mamelodi",
    price: "R5,500",
    bedrooms: 3,
    bathrooms: 2,
    type: "House",
    verified: true,
  },
  {
    id: 6,
    title: "Studio in Tembisa",
    location: "Hospital View, Tembisa",
    price: "R3,200",
    bedrooms: 1,
    bathrooms: 1,
    type: "Studio",
    verified: true,
  },
];

const Properties = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Home</h1>
            <p className="text-xl text-muted-foreground">
              Browse verified properties across South African townships
            </p>
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
                  />
                </div>
              </div>
              <Select>
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
              <Select>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Building className="w-20 h-20 text-primary/40" />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold">{property.title}</h3>
                    {property.verified && (
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
                    <Badge variant="outline">{property.type}</Badge>
                  </div>
                  <div className="flex items-center text-2xl font-bold text-primary">
                    {property.price}
                    <span className="text-sm font-normal text-muted-foreground ml-1">/month</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" size="lg">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Building = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default Properties;
