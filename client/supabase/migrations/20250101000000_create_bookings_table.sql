-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL,
  move_in_date DATE NOT NULL,
  move_out_date DATE,
  message TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_tenant_id ON bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_landlord_id ON bookings(landlord_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Add RLS policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Tenants can view their own bookings
CREATE POLICY "Tenants can view own bookings" ON bookings
  FOR SELECT
  USING (tenant_id = auth.uid());

-- Landlords can view bookings for their properties
CREATE POLICY "Landlords can view property bookings" ON bookings
  FOR SELECT
  USING (landlord_id = auth.uid());

-- Tenants can create bookings
CREATE POLICY "Tenants can create bookings" ON bookings
  FOR INSERT
  WITH CHECK (tenant_id = auth.uid());

-- Landlords can update status of bookings for their properties
CREATE POLICY "Landlords can update booking status" ON bookings
  FOR UPDATE
  USING (landlord_id = auth.uid());

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookings_timestamp
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_updated_at();
