# Address & Map Integration Feature

## What's New

Landlords can now add **full street addresses** to their property listings, and these addresses will be automatically geocoded and displayed accurately on the interactive map view!

## Features Added

### 1. **Address Field in Property Form**
- New "Full Address" input field below the City/Area field
- Optional but recommended for accurate map placement
- Example: "123 Main Street, Riverside"
- Helps tenants find the exact location on the map

### 2. **Automatic Geocoding**
- When landlords provide an address, the system automatically:
  - Converts the address to GPS coordinates (latitude/longitude)
  - Uses OpenStreetMap Nominatim API (free, respects privacy)
  - Stores coordinates in the database for fast map loading
  - Falls back to city-level coordinates if address isn't found

### 3. **Enhanced Map Display**
- Properties with addresses show exact pinpoint locations
- Map popups display the full address
- Properties without addresses use city-level approximation
- All existing properties continue to work with city-based locations

## Database Changes

**New columns added to `properties` table:**
- `address` (TEXT) - Full street address
- `latitude` (DECIMAL 10,8) - GPS latitude coordinate
- `longitude` (DECIMAL 11,8) - GPS longitude coordinate

Migration completed automatically ✅

## How It Works

### For Landlords:
1. Fill out property form as usual
2. Enter city/area in "City/Area" field (e.g., "Pretoria")
3. **NEW:** Enter full address in "Full Address" field (e.g., "456 Nelson Mandela Drive")
4. Submit property listing
5. System automatically geocodes the address behind the scenes

### For Tenants:
1. Browse properties normally
2. Switch to Map View
3. See properties at their exact locations
4. Click markers to see property details
5. Addresses are displayed in the popup (when available)

## Technical Details

### Files Modified:
- `server/models/Property.js` - Added address, latitude, longitude fields
- `server/controllers/propertyController.js` - Added geocoding integration
- `client/src/components/PropertyForm.tsx` - Added address input field
- `client/src/components/PropertiesMap.tsx` - Display addresses in popups

### Files Created:
- `server/utils/geocoding.js` - Geocoding utility functions
- `server/migrations/add-address-coordinates.sql` - Database migration
- `server/run-migration.js` - Migration runner script

### API Used:
- **OpenStreetMap Nominatim** - Free geocoding service
- Rate limit: 1 request/second (automatically handled)
- No API key required
- Privacy-friendly

## Testing

To test the new feature:

1. **Add a new property:**
   - Go to "Get Started" or landlord dashboard
   - Fill in property details
   - Add a specific address (e.g., "789 Church Street, Pretoria Central")
   - Submit the form

2. **View on map:**
   - Go to Properties page
   - Click "Map" view button
   - Find your property marker at the exact location
   - Click the marker to see the address in the popup

3. **Existing properties:**
   - Continue to display using city-level coordinates
   - Can be updated with addresses when landlords edit them

## Benefits

✅ **Accurate Location** - Tenants see exactly where properties are located  
✅ **Better Search** - Easier to find properties in specific neighborhoods  
✅ **Trust & Transparency** - Precise addresses build confidence  
✅ **No Cost** - Uses free, open-source geocoding  
✅ **Privacy Friendly** - No tracking or data selling  
✅ **Backward Compatible** - Existing properties work without addresses  

## Next Steps (Optional Enhancements)

- Add "Get My Location" button for landlords
- Show nearby amenities (schools, hospitals, transport)
- Draw property boundary polygons
- Add distance/directions from user's location
- Cluster markers when zoomed out for better performance
