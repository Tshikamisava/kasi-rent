import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ListProperty = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [propertyType, setPropertyType] = useState("Apartment");
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setImages(Array.from(files).slice(0, 10));
  };

  const handleSubmit = async () => {
    if (!title || !price || !location) {
      toast({ title: 'Missing fields', description: 'Title, price and location are required', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      // Upload images if present
      let imageUrls: string[] = [];
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((f) => formData.append('images', f));

        const uploadRes = await (await import('@/lib/api')).apiFetch('/api/upload/multiple', {
          method: 'POST',
          body: formData,
          // NOTE: apiFetch will set Authorization and avoid JSON headers
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrls = uploadData.imageUrls || uploadData.imageUrls || [];
        } else {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err.message || 'Image upload failed');
        }
      }

      // Create property
      const payload = {
        title,
        description,
        price: Number(price),
        location,
        bedrooms,
        bathrooms,
        property_type: propertyType,
        images: imageUrls,
      };

      const res = await (await import('@/lib/api')).apiFetch('/api/properties', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create property');
      }

      toast({ title: 'Success', description: 'Property listed successfully' });
      // reset form
      setTitle(''); setDescription(''); setPrice(''); setLocation(''); setImages([]);
    } catch (error) {
      console.error('Error listing property:', error);
      toast({ title: 'Error', description: (error as Error).message || 'Failed to list property', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold mb-4">Advertise Your Property</h1>
          <p className="text-muted-foreground mb-6">Create a compelling listing — upload images, set your price in Rands, and reach tenants across the app.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 rounded-lg border border-border p-6 bg-card">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Spacious 2-bed apartment in Rosebank" className="w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="w-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (R)</label>
                    <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 4500" className="w-full" />
                    <p className="text-xs text-muted-foreground mt-1">Prices are shown in South African Rands (R)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Property Type</label>
                    <select className="w-full rounded-md border p-2" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                      <option>Apartment</option>
                      <option>House</option>
                      <option>Studio</option>
                      <option>Room</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bedrooms</label>
                    <Input type="number" value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Bathrooms</label>
                    <Input type="number" value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} className="w-full" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Suburb or full address" className="w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Photos (up to 10)</label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <span className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm">Choose Files</span>
                    <input className="hidden" type="file" accept="image/*" multiple onChange={handleImages} />
                    <span className="text-sm text-muted-foreground">{images.length === 0 ? 'No files chosen' : `${images.length} selected`}</span>
                  </label>
                  <div className="mt-2 text-xs text-muted-foreground">Tip: Use bright, well-lit photos showing bedrooms and living areas.</div>
                </div>

                <div className="mt-4">
                  <Button onClick={handleSubmit} disabled={uploading}>{uploading ? 'Uploading...' : 'Publish Listing'}</Button>
                </div>
              </div>
            </div>

            <aside className="rounded-lg border border-border p-6 bg-card">
              <h3 className="font-semibold mb-3">Listing Tips</h3>
              <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-2">
                <li>Use clear photos and a descriptive title.</li>
                <li>Set competitive pricing in Rands.</li>
                <li>Respond quickly to messages to improve conversion.</li>
              </ul>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListProperty;
