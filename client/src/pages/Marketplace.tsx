import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFullImageUrl } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { formatRand } from '@/lib/currency';

const Marketplace = () => {
  const { user } = useAuth();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
        const res = await fetch(`${API_BASE}/api/properties?limit=8`);
        const data = await res.json();
        if (!res.ok) throw new Error('Failed to fetch listings');
        setListings(data || []);
      } catch (err) {
        console.error('Error fetching marketplace listings', err);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleSubscribe = async (listing: any) => {
    if (!user) {
      return window.location.assign('/signin');
    }

    setLoadingId(listing.id);

    try {
      const API = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '');
      const body = {
        plan: 'market_monthly',
        amount: 9.99,
        currency: 'ZAR',
        email: user.email,
        metadata: { listing_id: listing.id }
      };

      const resp = await fetch(`${API}/api/subscriptions/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token || ''}`
        },
        body: JSON.stringify(body)
      });

      const data = await resp.json();

      if (!resp.ok) {
        const detailedMessage = data?.message || data?.details?.message || data?.details || data?.error;
        throw new Error(detailedMessage || 'Failed to start subscription checkout.');
      }

      if (data?.payment?.authorization_url) {
        // redirect to payment gateway
        window.location.href = data.payment.authorization_url;
        return;
      }

      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }

      // Fallback for unexpected success response shape
      alert(data?.message || 'Checkout started, but no authorization URL was returned.');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to start subscription checkout.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Marketplace</h1>
            <p className="text-muted-foreground mt-1">Discover featured listings and special offers.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/list-property" className="px-4 py-2 bg-primary text-white rounded-md shadow hover:opacity-95">List Property</Link>
            <Link to="/save-money" className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/5">Savings</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div>Loading listings...</div>
          ) : listings.length ? (
            listings.map((l) => (
              <div key={l.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="h-48 w-full relative">
                  <img src={getFullImageUrl(l.image || l.image_url || '')} alt={l.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{l.title}</h3>
                    <div className="text-sm text-muted-foreground">{l.location}</div>
                  </div>
                  <p className="mt-2 text-primary font-semibold">{formatRand(l.price)}/month</p>
                  <div className="mt-4 flex items-center gap-3">
                    <Link to={`/properties/${l.id}`} className="text-sm px-3 py-2 border rounded-md">View</Link>
                    <button
                      onClick={() => handleSubscribe(l)}
                      className="ml-auto bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-md shadow"
                      disabled={loadingId === l.id}
                    >
                      {loadingId === l.id ? 'Processing...' : 'Subscribe'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-muted-foreground">No listings available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
