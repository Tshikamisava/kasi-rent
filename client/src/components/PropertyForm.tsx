import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Copy } from "lucide-react";

export const PropertyForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    property_type: "",
    description: "",
    image_url: "",
  });

  // Local file upload + preview state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  // Debug: store last uploaded image URL for quick verification
  const [lastUploadedUrl, setLastUploadedUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleCopyUrl = async () => {
    if (!lastUploadedUrl) return;
    try {
      await navigator.clipboard.writeText(lastUploadedUrl);
      toast({ title: "Copied!", description: "Image URL copied to clipboard" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to copy URL", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;    

    setLoading(true);
    try {
      // If user selected a file, upload it to Supabase Storage and use its public URL
      let finalImageUrl = formData.image_url;

      if (selectedFile) {
        setUploading(true);
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `properties/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from('images').upload(filePath, selectedFile);
        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage.from('images').getPublicUrl(filePath);
        finalImageUrl = publicData.publicUrl;
      }

      const { error } = await supabase.from("properties").insert({
        landlord_id: user._id,
        title: formData.title,
        location: formData.location,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        property_type: formData.property_type,
        description: formData.description,
        image_url: finalImageUrl,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Property listed successfully",
      });

      // Debug: show uploaded image URL and log it for verification
      if (finalImageUrl) {
        toast({
          title: "Image uploaded",
          description: finalImageUrl,
        });
        console.log("Uploaded image URL:", finalImageUrl);
        setLastUploadedUrl(finalImageUrl);
      }

      // reset form + uploaded file preview
      setFormData({
        title: "",
        location: "",
        price: "",
        bedrooms: "",
        bathrooms: "",
        property_type: "",
        description: "",
        image_url: "",
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploading(false);

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to list property",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>List New Property</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Property Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Riverside, Fourways"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Monthly Rent (R)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="property_type">Property Type</Label>
              <Select
                value={formData.property_type}
                onValueChange={(value) => setFormData({ ...formData, property_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="House">House</SelectItem>
                  <SelectItem value="Townhouse">Townhouse</SelectItem>
                  <SelectItem value="Studio">Studio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                min="1"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label>Image</Label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-2"
              disabled={uploading || loading}
            />

            {uploading && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" aria-hidden />
                <span>Uploading image...</span>
              </div>
            )}

            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="mt-2 h-40 w-full object-cover rounded" />
            ) : formData.image_url ? (
              <img
                src={formData.image_url}
                alt="preview"
                className="mt-2 h-40 w-full object-cover rounded"
                onError={(e) => {
                  const t = e.target as HTMLImageElement;
                  t.src = '/property-placeholder.png';
                }}
              />
            ) : null}

            {lastUploadedUrl && (
              <div className="mt-2 text-sm flex items-center gap-3">
                <div>
                  Uploaded URL: <a href={lastUploadedUrl} target="_blank" rel="noopener noreferrer" className="underline text-primary">{lastUploadedUrl}</a>
                </div>
                <div>
                  <Button size="sm" onClick={handleCopyUrl} aria-label="Copy uploaded image URL">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                </div>
              </div>
            )}

            <Label htmlFor="image_url" className="mt-3">Or Image URL</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="/riverside-apartment-1.jpg (or your own image URL)"
              disabled={uploading || loading}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Try: /riverside-house-1.jpg, /riverside-apartment-1.jpg, /riverside-studio-1.jpg, or /riverside-townhouse-1.jpg
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <Button type="submit" disabled={loading || uploading} className="w-full">
            {uploading ? (
              <div className="flex items-center justify-center w-full">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" aria-hidden />
                <span>Uploading...</span>
              </div>
            ) : loading ? (
              "Listing..."
            ) : (
              "List Property"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
