import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Copy, AlertTriangle, ShieldCheck, ShieldAlert, Sparkles, Zap } from "lucide-react";

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
  // Fraud detection state
  const [fraudAnalysis, setFraudAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showFraudWarning, setShowFraudWarning] = useState(false);
  // Description generation state
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [suggestingPrice, setSuggestingPrice] = useState(false);
  const [priceSuggestion, setPriceSuggestion] = useState<any>(null);

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

  const analyzeFraud = async () => {
    setAnalyzing(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/fraud-detection/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price) || 0,
          location: formData.location,
          property_type: formData.property_type,
          bedrooms: parseInt(formData.bedrooms) || 0,
          bathrooms: parseInt(formData.bathrooms) || 0,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFraudAnalysis(data.analysis);
        setShowFraudWarning(data.analysis.isSuspicious);
      }
    } catch (error) {
      console.error("Fraud detection failed:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const generateDescription = async () => {
    if (!formData.property_type) {
      toast({
        title: "Missing info",
        description: "Please select property type first",
        variant: "destructive",
      });
      return;
    }

    setGeneratingDescription(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/description-generator/description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          property_type: formData.property_type,
          bedrooms: parseInt(formData.bedrooms) || 0,
          bathrooms: parseInt(formData.bathrooms) || 0,
          price: parseFloat(formData.price) || 0,
          location: formData.location,
          amenities: "",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFormData({ ...formData, description: data.description });
        toast({
          title: "Description generated!",
          description: "Feel free to edit and customize it",
        });
      }
    } catch (error) {
      console.error("Description generation failed:", error);
      toast({
        title: "Error",
        description: "Failed to generate description",
        variant: "destructive",
      });
    } finally {
      setGeneratingDescription(false);
    }
  };

  const generateTitle = async () => {
    if (!formData.property_type || !formData.location) {
      toast({
        title: "Missing info",
        description: "Please select property type and location",
        variant: "destructive",
      });
      return;
    }

    setGeneratingTitle(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/description-generator/title`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_type: formData.property_type,
          bedrooms: parseInt(formData.bedrooms) || 0,
          bathrooms: parseInt(formData.bathrooms) || 0,
          location: formData.location,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFormData({ ...formData, title: data.title });
        toast({
          title: "Title generated!",
          description: "Optimized for search visibility",
        });
      }
    } catch (error) {
      console.error("Title generation failed:", error);
      toast({
        title: "Error",
        description: "Failed to generate title",
        variant: "destructive",
      });
    } finally {
      setGeneratingTitle(false);
    }
  };

  const suggestPrice = async () => {
    if (!formData.property_type || !formData.location) {
      toast({
        title: "Missing info",
        description: "Please select property type and location",
        variant: "destructive",
      });
      return;
    }

    setSuggestingPrice(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/description-generator/suggest-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_type: formData.property_type,
          bedrooms: parseInt(formData.bedrooms) || 0,
          bathrooms: parseInt(formData.bathrooms) || 0,
          location: formData.location,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPriceSuggestion(data.suggestion);
        toast({
          title: "Price analysis ready!",
          description: `Suggested: R${data.suggestion.recommendedPrice}`,
        });
      }
    } catch (error) {
      console.error("Price suggestion failed:", error);
      toast({
        title: "Error",
        description: "Failed to suggest price",
        variant: "destructive",
      });
    } finally {
      setSuggestingPrice(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Run fraud detection first
    if (!fraudAnalysis) {
      await analyzeFraud();
      toast({
        title: "Please review fraud analysis",
        description: "Review the security check results before submitting",
        variant: "default",
      });
      return;
    }

    // Warn if suspicious but allow override
    if (fraudAnalysis.isSuspicious && !showFraudWarning) {
      setShowFraudWarning(true);
      toast({
        title: "Security Warning",
        description: "This listing has been flagged. Please review the warnings below.",
        variant: "destructive",
      });
      return;
    }

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
            <div className="flex gap-2">
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="flex-1"
              />
              <Button
                type="button"
                onClick={generateTitle}
                disabled={generatingTitle}
                variant="outline"
                title="Generate SEO-optimized title"
              >
                {generatingTitle ? (
                  <div className="animate-spin h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </div>
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
              <div className="flex gap-2">
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={suggestPrice}
                  disabled={suggestingPrice}
                  variant="outline"
                  title="Get AI price suggestion"
                >
                  {suggestingPrice ? (
                    <div className="animate-spin h-4 w-4" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                </Button>
              </div>
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

          {/* Price Suggestion Display */}
          {priceSuggestion && (
            <Alert className="bg-blue-50 border-blue-200">
              <Zap className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900">Price Suggestion</AlertTitle>
              <AlertDescription className="text-blue-800">
                <p className="mb-2">
                  <strong>Recommended:</strong> R{priceSuggestion.recommendedPrice}/month
                </p>
                <p className="mb-2 text-sm">
                  Range: R{priceSuggestion.minPrice} - R{priceSuggestion.maxPrice}
                </p>
                <p className="text-sm italic">{priceSuggestion.reasoning}</p>
              </AlertDescription>
            </Alert>
          )}

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
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="description">Description</Label>
              <Button
                type="button"
                onClick={generateDescription}
                disabled={generatingDescription}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                {generatingDescription ? (
                  <>
                    <div className="animate-spin h-3 w-3 mr-1" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-1" />
                    Generate with AI
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Describe your property in detail... or use AI to generate one"
            />
          </div>

          {/* Fraud Detection Results */}
          {fraudAnalysis && (
            <Alert variant={fraudAnalysis.isSuspicious ? "destructive" : "default"} className="mt-4">
              <div className="flex items-start gap-3">
                {fraudAnalysis.riskLevel === "low" ? (
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <ShieldAlert className="h-5 w-5" />
                )}
                <div className="flex-1">
                  <AlertTitle className="flex items-center gap-2 mb-2">
                    Security Check Results
                    <Badge variant={
                      fraudAnalysis.riskLevel === "high" ? "destructive" : 
                      fraudAnalysis.riskLevel === "medium" ? "outline" : 
                      "default"
                    }>
                      {fraudAnalysis.riskLevel.toUpperCase()} RISK
                    </Badge>
                    <Badge variant="secondary">
                      {fraudAnalysis.confidenceScore}% Confidence
                    </Badge>
                  </AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">{fraudAnalysis.reason}</p>
                    
                    {fraudAnalysis.flags.length > 0 && (
                      <div className="mt-3">
                        <p className="font-semibold mb-1 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          Issues Found:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {fraudAnalysis.flags.map((flag: string, idx: number) => (
                            <li key={idx}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {fraudAnalysis.recommendations.length > 0 && (
                      <div className="mt-3">
                        <p className="font-semibold mb-1">Recommendations:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {fraudAnalysis.recommendations.map((rec: string, idx: number) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!fraudAnalysis ? (
              <Button
                type="button"
                onClick={analyzeFraud}
                disabled={analyzing || !formData.title || !formData.description}
                variant="outline"
                className="flex-1"
              >
                {analyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Run Security Check
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  setFraudAnalysis(null);
                  setShowFraudWarning(false);
                }}
                variant="ghost"
              >
                Re-analyze
              </Button>
            )}

            <Button type="submit" disabled={loading || uploading || analyzing} className="flex-1">
              {uploading ? (
                <div className="flex items-center justify-center w-full">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" aria-hidden />
                  <span>Uploading...</span>
                </div>
              ) : loading ? (
                "Listing..."
              ) : fraudAnalysis?.isSuspicious ? (
                "Submit Anyway"
              ) : (
                "List Property"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
