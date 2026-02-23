import React from 'react';
import { useNavigate } from 'react-router-dom';


const Marketplace = () => {
  // Example: Fetch marketplace items from API and display
  // TODO: Replace with real API call

  // Use mockup data only
  const [items, setItems] = React.useState<any[]>([
    {
      id: 1,
      title: 'Modern Couch',
      description: 'A stylish and comfy 3-seater couch, perfect for any living room.',
      price: 3500,
      seller: 'Landlord',
      image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=400&q=80', // Couch: https://unsplash.com/photos/gray-fabric-sofa-near-brown-wooden-table-1519710164239-da123dc03ef4
    },
    {
      id: 2,
      title: 'Dining Table Set',
      description: 'Solid wood table with 6 chairs. Great for family meals.',
      price: 4200,
      seller: 'Tenant',
      image: 'https://images.unsplash.com/photo-1503389152951-9c3d045ebb74?auto=format&fit=crop&w=400&q=80', // Dining Table: https://unsplash.com/photos/brown-wooden-dining-table-set-1503389152951-9c3d045ebb74
    },
    {
      id: 3,
      title: 'Fridge',
      description: 'Energy-efficient fridge, 2 years old, works perfectly.',
      price: 2500,
      seller: 'Landlord',
      image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80', // Fridge: https://unsplash.com/photos/white-refrigerator-1519125323398-675f0ddb6308
    },
    {
      id: 4,
      title: 'Microwave Oven',
      description: 'Compact microwave, ideal for small kitchens.',
      price: 800,
      seller: 'Tenant',
      image: 'https://images.unsplash.com/photo-1506368083636-6defb67639d0?auto=format&fit=crop&w=400&q=80', // Microwave: https://unsplash.com/photos/white-microwave-oven-on-brown-wooden-table-1506368083636-6defb67639d0
    },
  ]);
  const [showModal, setShowModal] = React.useState(false);
  const [form, setForm] = React.useState({
    title: '',
    description: '',
    price: '',
    seller: '',
    image: ''
  });

  const handleAddItem = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setForm({ title: '', description: '', price: '', seller: '', image: '' });
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.seller) return;
    const newItem = {
      id: items.length + 1,
      title: form.title,
      description: form.description,
      price: Number(form.price),
      seller: form.seller,
      image: form.image || 'https://via.placeholder.com/150',
    };
    setItems([newItem, ...items]);
    handleCloseModal();
  };



  const navigate = useNavigate();

  const handleMessageSeller = (sellerId: string) => {
    // Navigate to chat page, optionally with seller info as state or query param
    navigate(`/chat?seller=${encodeURIComponent(sellerId)}`);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 text-primary">Marketplace</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Buy and sell products for your home! Both <span className="font-semibold text-secondary">landlords</span> and <span className="font-semibold text-secondary">tenants</span> can list and purchase items here. All prices are in <span className="font-bold">Rand (R)</span>.
          </p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg shadow transition text-lg font-semibold" onClick={handleAddItem}>
          + Add Item
        </button>
      </div>

      {/* Add Item Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl" onClick={handleCloseModal}>&times;</button>
            <h2 className="text-2xl font-bold mb-4">Add New Item</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="border rounded px-3 py-2" required />
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="border rounded px-3 py-2" />
              <input name="price" value={form.price} onChange={handleChange} placeholder="Price (R)" type="number" min="0" className="border rounded px-3 py-2" required />
              <input name="seller" value={form.seller} onChange={handleChange} placeholder="Seller (Landlord/Tenant)" className="border rounded px-3 py-2" required />
              <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL (optional)" className="border rounded px-3 py-2" />
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded font-semibold mt-2">Add Item</button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground">No items found.</div>
        ) : (
          items.map(item => (
            <div key={item.id} className="bg-white border border-border rounded-xl shadow hover:shadow-lg transition p-6 flex flex-col items-center">
              <img src={item.image || 'https://via.placeholder.com/150'} alt={item.title} className="w-36 h-36 object-cover mb-4 rounded-lg border" />
              <h2 className="text-2xl font-bold mb-1 text-center">{item.title}</h2>
              <p className="text-gray-600 mb-2 text-center">{item.description}</p>
              <span className="font-bold text-primary text-xl mb-2">R{item.price}</span>
              <span className="text-xs text-muted-foreground mb-2">Seller: {item.seller || item.seller_id}</span>
              <button
                className="mt-auto bg-secondary hover:bg-secondary/80 text-primary px-4 py-2 rounded transition font-medium mb-2"
                onClick={() => handleMessageSeller(item.seller || item.seller_id)}
              >
                Message Seller
              </button>
              <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded transition font-medium">Buy</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default Marketplace;
