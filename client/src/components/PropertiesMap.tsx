import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, BedDouble, Bath, ExternalLink } from "lucide-react";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";

// Fix Leaflet default marker icon issue
let DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Create custom icon for verified properties
const verifiedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Property {
  id: string;
  title: string;
  location: string;
  address?: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  image_url?: string;
  is_verified?: boolean;
  latitude?: number;
  longitude?: number;
}

interface PropertiesMapProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
  center?: [number, number];
  zoom?: number;
}

// Component to adjust map bounds to fit all markers
function MapBoundsHandler({ properties }: { properties: Property[] }) {
  const map = useMap();

  useEffect(() => {
    if (properties.length > 0) {
      const validProperties = properties.filter(p => p.latitude && p.longitude);
      if (validProperties.length > 0) {
        const bounds = L.latLngBounds(
          validProperties.map(p => [p.latitude!, p.longitude!] as [number, number])
        );
        
        // For single property, use higher zoom level
        if (validProperties.length === 1) {
          map.setView([validProperties[0].latitude!, validProperties[0].longitude!], 15);
        } else {
          // For multiple properties, fit bounds with appropriate padding
          map.fitBounds(bounds, { 
            padding: [80, 80], 
            maxZoom: 13,
            animate: true,
            duration: 0.5
          });
        }
      }
    }
  }, [properties, map]);

  return null;
}

export const PropertiesMap = ({
  properties,
  onPropertyClick,
  center = [-26.2041, 28.0473], // Johannesburg default
  zoom = 7, // Lower default zoom to see more of South Africa
}: PropertiesMapProps) => {
  // Geocode location names to coordinates (simplified version)
  const getCoordinates = (location: string): [number, number] | null => {
    // Common South African township/area coordinates (you can expand this)
    const locationMap: { [key: string]: [number, number] } = {
      soweto: [-26.2681, 27.8583],
      sandton: [-26.1076, 28.0567],
      pretoria: [-25.7461, 28.1881],
      tshwane: [-25.7461, 28.1881],
      johannesburg: [-26.2041, 28.0473],
      durban: [-29.8587, 31.0218],
      "cape town": [-33.9249, 18.4241],
      "port elizabeth": [-33.9608, 25.6022],
      alexandra: [-26.1036, 28.0936],
      diepsloot: [-25.9333, 28.0167],
      fourways: [-26.0146, 28.0082],
      randburg: [-26.0936, 28.0067],
      roodepoort: [-26.1625, 27.8725],
      boksburg: [-26.2097, 28.2621],
      germiston: [-26.2253, 28.1670],
      springs: [-26.2506, 28.4392],
      benoni: [-26.1885, 28.3207],
      ekurhuleni: [-26.1986, 28.2122],
      midrand: [-25.9953, 28.1285],
      centurion: [-25.8601, 28.1891],
      alberton: [-26.2667, 28.1222],
    };

    const normalizedLocation = location.toLowerCase().trim();
    
    // Exact match
    if (locationMap[normalizedLocation]) {
      return locationMap[normalizedLocation];
    }

    // Partial match
    for (const [key, coords] of Object.entries(locationMap)) {
      if (normalizedLocation.includes(key) || key.includes(normalizedLocation)) {
        return coords;
      }
    }

    // Default to Johannesburg if no match
    return [-26.2041 + (Math.random() - 0.5) * 0.1, 28.0473 + (Math.random() - 0.5) * 0.1];
  };

  // Add coordinates to properties
  const propertiesWithCoords = properties.map(property => ({
    ...property,
    latitude: property.latitude || getCoordinates(property.location)?.[0],
    longitude: property.longitude || getCoordinates(property.location)?.[1],
  }));

  const validProperties = propertiesWithCoords.filter(p => p.latitude && p.longitude);

  if (validProperties.length === 0) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No properties to display on map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] rounded-lg overflow-hidden border shadow-lg">
      <MapContainer
        key={`map-${validProperties.length}`}
        center={center}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={true}
        zoomControl={true}
        whenReady={(mapInstance) => {
          // Ensure map renders correctly
          setTimeout(() => {
            mapInstance.target.invalidateSize();
            
            // Immediately fit bounds for all properties
            const validProps = validProperties.filter(p => p.latitude && p.longitude);
            if (validProps.length > 0) {
              if (validProps.length === 1) {
                mapInstance.target.setView(
                  [validProps[0].latitude!, validProps[0].longitude!], 
                  15
                );
              } else {
                const bounds = L.latLngBounds(
                  validProps.map(p => [p.latitude!, p.longitude!] as [number, number])
                );
                mapInstance.target.fitBounds(bounds, { 
                  padding: [80, 80], 
                  maxZoom: 13 
                });
              }
            }
          }, 100);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBoundsHandler properties={validProperties} />

        {validProperties.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude!, property.longitude!]}
            icon={property.is_verified ? verifiedIcon : DefaultIcon}
            eventHandlers={{
              add: (e) => {
                // Auto-open popup for single property
                if (validProperties.length === 1) {
                  setTimeout(() => {
                    e.target.openPopup();
                  }, 500);
                }
              }
            }}
          >
            <Popup maxWidth={320} minWidth={280} autoPan={true}>
              <div className="p-3">
                {property.image_url && (
                  <img
                    src={property.image_url}
                    alt={property.title}
                    className="w-full h-32 object-cover rounded mb-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base leading-tight">{property.title}</h3>
                    {property.is_verified && (
                      <Badge variant="default" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-foreground/80 font-medium">
                    <MapPin className="w-4 h-4 mr-1.5" />
                    {property.address || property.location}
                  </div>
                  
                  {property.address && property.location && (
                    <div className="text-xs text-muted-foreground italic">
                      {property.location}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-foreground/70 font-medium">
                    <div className="flex items-center">
                      <BedDouble className="w-4 h-4 mr-1.5" />
                      {property.bedrooms}
                    </div>
                    <div className="flex items-center">
                      <Bath className="w-4 h-4 mr-1.5" />
                      {property.bathrooms}
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold">
                      {property.property_type}
                    </Badge>
                  </div>

                  <div className="text-xl font-bold text-primary">
                    R{property.price.toLocaleString()}
                    <span className="text-sm font-medium text-muted-foreground">/mo</span>
                  </div>

                  <Button
                    size="default"
                    className="w-full mt-3 font-semibold"
                    onClick={() => onPropertyClick?.(property)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
