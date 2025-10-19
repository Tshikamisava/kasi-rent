import { MapPin, BedDouble, Bath } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const properties = [
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
];

export const FeaturedProperties = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Featured Properties</h2>
          <p className="text-xl text-muted-foreground">
            Verified, trusted listings from our community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
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

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="px-8">
            View All Properties
          </Button>
        </div>
      </div>
    </section>
  );
};

const Building = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
