import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart, MessageCircle, Tag } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface MarketplaceItem {
  id: number;
  title: string;
  description: string;
  price: number;
  seller_id: string;
  images: string | string[];
  status: string;
  created_at: string;
}

const Marketplace = () => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    seller: '',
    image: ''
  });

  // Fetch marketplace items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${API_URL}/api/marketplace`);
        if (!response.ok) throw new Error('Failed to fetch items');
        const data = await response.json();
        setItems(data);
      } catch (err) {
        console.error('Error fetching marketplace items:', err);
        setError('Could not load items from server');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleAddItem = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setForm({ title: '', description: '', price: '', seller: '', image: '' });
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.seller) return;
    
    try {
      const response = await fetch(`${API_URL}/api/marketplace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: Number(form.price),
          seller: form.seller,
          image: form.image
        })
      });
      
      if (response.ok) {
        const newItem = await response.json();
        setItems([newItem, ...items]);
      }
    } catch (err) {
      console.error('Error creating item:', err);
    }
    handleCloseModal();
  };

  const navigate = useNavigate();

  const handleMessageSeller = (sellerId: string) => {
    navigate(`/chat?seller=${encodeURIComponent(sellerId)}`);
  };

  const getImageUrl = (item: MarketplaceItem): string => {
    if (!item.images) return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop';
    try {
      const images = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
      return images[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop';
    } catch {
      return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-8 md:px-8 lg:px-12 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header Section */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <ShoppingCart className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary">Marketplace</h1>
                <p className="text-muted-foreground">
                  Buy and sell items for your home. Prices in <span className="font-semibold text-primary">Rand (R)</span>
                </p>
              </div>
            </div>
            <Button onClick={handleAddItem} className="gap-2" size="lg">
              <Plus className="w-5 h-5" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Add Item Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md m-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Tag className="w-6 h-6 text-primary" />
                  Add New Item
                </h2>
                <button 
                  className="text-muted-foreground hover:text-foreground text-2xl" 
                  onClick={handleCloseModal}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title *</label>
                  <input 
                    name="title" 
                    value={form.title} 
                    onChange={handleChange} 
                    placeholder="Item title" 
                    className="w-full border rounded-lg px-4 py-2.5" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <textarea 
                    name="description" 
                    value={form.description} 
                    onChange={handleChange} 
                    placeholder="Describe your item" 
                    className="w-full border rounded-lg px-4 py-2.5 min-h-[100px]" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Price (R) *</label>
                  <input 
                    name="price" 
                    value={form.price} 
                    onChange={handleChange} 
                    placeholder="0.00" 
                    type="number" 
                    min="0" 
                    step="0.01"
                    className="w-full border rounded-lg px-4 py-2.5" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Seller ID *</label>
                  <input 
                    name="seller" 
                    value={form.seller} 
                    onChange={handleChange} 
                    placeholder="Your seller ID" 
                    className="w-full border rounded-lg px-4 py-2.5" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Image URL</label>
                  <input 
                    name="image" 
                    value={form.image} 
                    onChange={handleChange} 
                    placeholder="https://..." 
                    className="w-full border rounded-lg px-4 py-2.5" 
                  />
                </div>
                <Button type="submit" className="w-full mt-2" size="lg">
                  Add Item
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <p className="text-amber-700">{error}</p>
            </div>
          </div>
        )}

        {/* Items Grid */}
        {!loading && !error && (
          <div className="max-w-6xl mx-auto">
            {items.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border">
                <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No items yet</h3>
                <p className="text-muted-foreground mb-6">Be the first to list an item in the marketplace!</p>
                <Button onClick={handleAddItem} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map(item => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="relative">
                      <img 
                        src={getImageUrl(item)} 
                        alt={item.title} 
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status || 'active'}
                        </span>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <h3 className="font-bold text-lg line-clamp-1">{item.title}</h3>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                        {item.description || 'No description'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">R{item.price}</span>
                        <span className="text-xs text-muted-foreground">ID: {item.seller_id.substring(0, 8)}...</span>
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 gap-2"
                        onClick={() => handleMessageSeller(item.seller_id)}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </Button>
                      <Button className="flex-1 gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Buy
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
export default Marketplace;
