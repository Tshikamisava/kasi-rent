// Seed script for marketplace_items table (Supabase/Postgres)
// Run this with your preferred Node.js or SQL runner after setting up the table

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seedMarketplace() {
  const items = [
    {
      title: 'Modern Couch',
      description: 'A stylish and comfy 3-seater couch, perfect for any living room.',
      price: 3500,
      seller_id: 'demo-landlord-1',
      images: ['https://via.placeholder.com/150'],
      status: 'active'
    },
    {
      title: 'Dining Table Set',
      description: 'Solid wood table with 6 chairs. Great for family meals.',
      price: 4200,
      seller_id: 'demo-tenant-1',
      images: ['https://via.placeholder.com/150'],
      status: 'active'
    },
    {
      title: 'Fridge',
      description: 'Energy-efficient fridge, 2 years old, works perfectly.',
      price: 2500,
      seller_id: 'demo-landlord-2',
      images: ['https://via.placeholder.com/150'],
      status: 'active'
    },
    {
      title: 'Microwave Oven',
      description: 'Compact microwave, ideal for small kitchens.',
      price: 800,
      seller_id: 'demo-tenant-2',
      images: ['https://via.placeholder.com/150'],
      status: 'active'
    }
  ];

  const { data, error } = await supabase.from('marketplace_items').insert(items);
  if (error) {
    console.error('Seed error:', error);
  } else {
    console.log('Seeded marketplace items:', data);
  }
}

seedMarketplace();