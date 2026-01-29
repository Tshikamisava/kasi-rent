# Easy Booking Feature

## Overview
The Easy Booking feature allows tenants to submit booking requests for properties directly through the platform. Landlords can then review and manage these requests.

## Features

### For Tenants
- **Browse Properties**: View all available properties with search and filters
- **Book Property**: Submit booking request with:
  - Move-in date (required)
  - Move-out date (optional)
  - Message to landlord (optional)
- **View Bookings**: Track all booking requests and their status in /bookings
- **Real-time Status**: See if booking is pending, confirmed, cancelled, or completed

### For Landlords
- View all booking requests for their properties
- Update booking status (accept/reject)
- Communicate with tenants via chat

## User Flow

1. **Browse Properties** (`/properties`)
   - Search by location or title
   - Filter by property type and price range
   - Click "View Details" on any property card

2. **View Property Details** (PropertyDetailModal)
   - See full property information
   - View landlord contact details
   - Click "Book Now" button

3. **Submit Booking Request** (Booking Form)
   - Select move-in date (required)
   - Optionally select move-out date
   - Add message to landlord (optional)
   - Submit booking request

4. **Track Bookings** (`/bookings`)
   - View all submitted booking requests
   - See booking status badges:
     - 🟡 Pending - Awaiting landlord review
     - 🟢 Confirmed - Landlord accepted
     - 🔴 Cancelled - Booking cancelled
     - ✅ Completed - Tenancy completed

## Technical Implementation

### Database Schema (Supabase)

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  property_id UUID REFERENCES properties(id),
  tenant_id VARCHAR(255),
  landlord_id VARCHAR(255),
  move_in_date DATE NOT NULL,
  move_out_date DATE,
  message TEXT,
  status VARCHAR(50) CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Components

1. **Bookings.tsx** (`/client/src/pages/Bookings.tsx`)
   - Main bookings page
   - Displays all user bookings with status badges
   - Protected route (requires authentication)

2. **PropertyDetailModal.tsx** (Updated)
   - Added booking form with:
     - Move-in/out date pickers
     - Message textarea
     - Submit button
   - Form validation
   - Supabase integration for booking creation

3. **Features.tsx** (Updated)
   - Easy Booking card now links to `/bookings`
   - Clicking card takes user to bookings page

### Routes

- `/bookings` - View all user bookings (protected route)
- `/properties` - Browse and book properties
- Easy Booking card in homepage features section

### Authentication

- Booking form requires user to be signed in
- Redirects to `/signin?redirect=/properties` if not authenticated
- Uses Supabase RLS policies for data security

## Usage Examples

### Creating a Booking

```typescript
const { data, error } = await supabase
  .from("bookings")
  .insert([
    {
      property_id: property.id,
      tenant_id: user._id,
      landlord_id: property.landlord_id,
      move_in_date: "2024-02-01",
      move_out_date: "2025-02-01",
      message: "Looking forward to moving in!",
      status: "pending",
    },
  ])
  .select();
```

### Fetching User Bookings

```typescript
const { data, error } = await supabase
  .from("bookings")
  .select(`
    *,
    property:property_id (
      id,
      title,
      location,
      price,
      image_url,
      property_type
    )
  `)
  .eq("tenant_id", user._id)
  .order("created_at", { ascending: false });
```

## Future Enhancements

1. **Landlord Dashboard Integration**
   - Add booking management interface
   - Allow landlords to accept/reject requests
   - Send notifications on status changes

2. **Calendar Integration**
   - Block dates when property is booked
   - Show availability calendar
   - Prevent double bookings

3. **Payment Integration**
   - Require deposit on booking confirmation
   - Process first month's rent
   - Issue receipts

4. **Notifications**
   - Email notifications on booking status changes
   - In-app notifications
   - SMS alerts (optional)

5. **Reviews & Ratings**
   - Allow tenants to review properties after move-out
   - Landlord ratings for tenants
   - Display ratings on property cards

## Security

- Row Level Security (RLS) policies ensure:
  - Tenants can only view their own bookings
  - Landlords can only view bookings for their properties
  - Landlords can update booking status
  - Tenants can create bookings

## Testing

To test the booking feature:

1. Sign in as a tenant
2. Browse properties at `/properties`
3. Click "View Details" on any property
4. Click "Book Now" button
5. Fill in booking details and submit
6. View booking at `/bookings`

## Migration

Run the Supabase migration to create the bookings table:

```bash
cd client
npx supabase db push
```

Or manually run the migration file:
`client/supabase/migrations/20250101000000_create_bookings_table.sql`
