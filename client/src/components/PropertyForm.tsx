import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
// supabase not used here; backend API used instead
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Copy, AlertTriangle, ShieldCheck, ShieldAlert, Sparkles, Zap } from "lucide-react";

export const PropertyForm = ({ onSuccess, initialData, onUpdate }: { 
  onSuccess: () => void, 
  initialData?: any,
  onUpdate?: (data: any) => void 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    location: initialData?.location || "",
    address: initialData?.address || "",
    price: initialData?.price?.toString() || "",
    bedrooms: initialData?.bedrooms?.toString() || "",
    bathrooms: initialData?.bathrooms?.toString() || "",
    property_type: initialData?.property_type || "",
    description: initialData?.description || "",
    image_url: initialData?.image_url || "",
    video_url: initialData?.video_url || "",
    wifi_available: initialData?.wifi_available ?? false,
    pets_allowed: initialData?.pets_allowed ?? false,
    furnished: initialData?.furnished ?? false,
    parking_available: initialData?.parking_available ?? false,
    amenities: initialData?.amenities || "",
  });

  // Local file upload + preview state - now supporting multiple files
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  // Document upload state (landlord ID / proof)
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string>('');
  // Debug: store last uploaded image URLs for quick verification
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  // Video upload UI mode: 'file' or 'link'
  const [videoMode, setVideoMode] = useState<'file' | 'link'>('link');
  // Video upload state
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
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
      // Clean up all preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [previewUrls, videoPreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
      // Create preview URLs for all selected files
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      // Clean up old preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls(newPreviewUrls);
    } else {
      setSelectedFiles([]);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    // Revoke the removed preview URL
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const switchToFile = () => {
    setVideoMode('file');
    // Clear link value when switching to file mode
    setFormData({ ...formData, video_url: "" });
  };

  const switchToLink = () => {
    setVideoMode('link');
    // Clear selected file/preview when switching to link mode
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setSelectedVideo(null);
    setVideoPreview("");
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Video must be less than 100MB",
          variant: "destructive"
        });
        return;
      }

      setSelectedVideo(file);
      // Create preview URL
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      const preview = URL.createObjectURL(file);
      setVideoPreview(preview);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setDocumentFile(file);
    if (file) {
      try {
        const url = URL.createObjectURL(file);
        if (documentPreviewUrl) URL.revokeObjectURL(documentPreviewUrl);
        setDocumentPreviewUrl(url);
      } catch (err) {
        setDocumentPreviewUrl('');
      }
    } else {
      if (documentPreviewUrl) URL.revokeObjectURL(documentPreviewUrl);
      setDocumentPreviewUrl('');
    }
  };

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setSelectedVideo(null);
    setVideoPreview("");
    setFormData({ ...formData, video_url: "" });
  };

  const uploadVideo = async () => {
    if (!selectedVideo) return null;

    setUploadingVideo(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const videoFormData = new FormData();
      videoFormData.append('video', selectedVideo);

      const response = await fetch(`${API_BASE}/api/upload/video`, {
        method: 'POST',
        body: videoFormData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Video upload failed');
      }

      const fullUrl = `${API_BASE}${data.videoUrl}`;
      setFormData({ ...formData, video_url: fullUrl });
      
      toast({
        title: "Success",
        description: "Video uploaded successfully",
      });

      return fullUrl;
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Copied!", description: "Image URL copied to clipboard" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to copy URL", variant: "destructive" });
    }
  };

  const analyzeFraud = async () => {
    setAnalyzing(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
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
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
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
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
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
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
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

    // Run fraud detection first (only for new properties)
    if (!initialData && !fraudAnalysis) {
      await analyzeFraud();
      toast({
        title: "Please review fraud analysis",
        description: "Review the security check results before submitting",
        variant: "default",
      });
      return;
    }

    // Warn if suspicious but allow override (only for new properties)
    if (!initialData && fraudAnalysis?.isSuspicious && !showFraudWarning) {
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
      // Upload video first if a file is selected
      let videoUrl = formData.video_url;
      if (selectedVideo && !initialData) {
        const uploadedVideoUrl = await uploadVideo();
        if (uploadedVideoUrl) {
          videoUrl = uploadedVideoUrl;
        }
      }

      // If editing and onUpdate callback is provided, use it
      if (initialData && onUpdate) {
        // Upload video for edit if selected
        if (selectedVideo) {
          const uploadedVideoUrl = await uploadVideo();
          if (uploadedVideoUrl) {
            videoUrl = uploadedVideoUrl;
          }
        }

        const updateData = {
          title: formData.title,
          location: formData.location,
          address: formData.address || null,
          price: parseFloat(formData.price),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          property_type: formData.property_type,
          description: formData.description,
          image_url: formData.image_url,
          video_url: videoUrl || null,
        };
        
        await onUpdate(updateData);
        setLoading(false);
        return;
      }

      // Upload multiple images to server (for new properties)
      const uploadedUrls: string[] = [];
      let uploadErrors = 0;

      if (selectedFiles.length > 0) {
        setUploading(true);
        
        const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
        
        // Upload each file to the server
        for (const file of selectedFiles) {
          try {
            const uploadFormData = new FormData();
            uploadFormData.append('image', file);

            console.log(`Uploading ${file.name}...`);

            const response = await fetch(`${API_BASE}/api/upload/single`, {
              method: 'POST',
              body: uploadFormData,
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
              throw new Error(data.message || 'Upload failed');
            }

            // Construct full URL
            const fullUrl = `${API_BASE}${data.imageUrl}`;
            uploadedUrls.push(fullUrl);
            console.log(`Successfully uploaded: ${fullUrl}`);

          } catch (fileError) {
            console.error('Error uploading file:', file.name, fileError);
            uploadErrors++;
            toast({
              title: "Upload Warning",
              description: `Failed to upload ${file.name}`,
              variant: "destructive",
            });
          }
        }

        setUploading(false);

        if (uploadErrors > 0 && uploadedUrls.length === 0) {
          toast({
            title: "Upload Failed",
            description: "All image uploads failed. Please try again or use the image URL field.",
          });
        } else if (uploadErrors > 0) {
          toast({
            title: "Partial Upload",
            description: `${uploadedUrls.length} of ${selectedFiles.length} images uploaded successfully`,
          });
        }
      }

      // Use the first uploaded image as the primary image, or use the URL field
      const primaryImageUrl = uploadedUrls.length > 0 ? uploadedUrls[0] : (formData.image_url || null);

      // Upload document (required for new listings)
      let documentUrl = initialData?.document_url || null;
      let documentFilename = initialData?.document_filename || null;
      let documentType = initialData?.document_type || null;

      if (!initialData && !documentFile) {
        toast({ title: 'Document required', description: 'Please upload an identity document before listing', variant: 'destructive' });
        setLoading(false);
        return;
      }

      if (documentFile) {
        setUploading(true);
        try {
          const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
          const form = new FormData();
          form.append('document', documentFile);
          const res = await fetch(`${API_BASE}/api/upload/document`, { method: 'POST', body: form });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.message || 'Document upload failed');
          documentUrl = `${API_BASE}${data.documentUrl}`;
          documentFilename = data.filename;
          documentType = data.originalName?.split('.').pop() || documentFile.type;
        } catch (err: any) {
          console.error('Document upload failed', err);
          toast({ title: 'Document upload failed', description: err.message || 'Please try again', variant: 'destructive' });
          setUploading(false);
          setLoading(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      console.log('Submitting property with:', {
        images: uploadedUrls,
        primaryImage: primaryImageUrl,
        userId: user._id
      });

      // Submit to MySQL API instead of Supabase
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const apiUrl = `${API_BASE}/api/properties`;
      
      console.log('Posting to:', apiUrl);
      
      const propertyData = {
        landlord_id: user._id,
        title: formData.title,
        location: formData.location,
        address: formData.address || null,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        property_type: formData.property_type,
        description: formData.description,
        image_url: primaryImageUrl,
        images: uploadedUrls.length > 0 ? uploadedUrls : (formData.image_url ? [formData.image_url] : []),
        video_url: videoUrl || null,
        document_url: documentUrl,
        document_filename: documentFilename,
        document_type: documentType,
        wifi_available: !!formData.wifi_available,
        pets_allowed: !!formData.pets_allowed,
        furnished: !!formData.furnished,
        parking_available: !!formData.parking_available,
        amenities: formData.amenities ? String(formData.amenities).split(',').map((s:any)=>s.trim()).filter(Boolean) : [],
      };
      
      console.log('Property data:', propertyData);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const result = await response.json();
      console.log('Response data:', result);

      if (!response.ok || !result.success) {
        console.error('Database insert error:', result);
        throw new Error(result.message || 'Failed to create property');
      }

      toast({
        title: "Success!",
        description: uploadedUrls.length > 0 
          ? `Property listed successfully with ${uploadedUrls.length} image(s)` 
          : "Property listed successfully",
      });

      // Store uploaded URLs for reference
      if (uploadedUrls.length > 0) {
        setUploadedImageUrls(uploadedUrls);
        console.log("Uploaded image URLs:", uploadedUrls);
      }

      // reset form + uploaded file previews (include full shape)
      setFormData({
        title: "",
        location: "",
        address: "",
        price: "",
        bedrooms: "",
        bathrooms: "",
        property_type: "",
        description: "",
        image_url: "",
        video_url: "",
        wifi_available: false,
        pets_allowed: false,
        furnished: false,
        parking_available: false,
        amenities: "",
      });
      setSelectedFiles([]);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
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
        <CardTitle>{initialData ? 'Edit Property' : 'List New Property'}</CardTitle>
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
            <Label htmlFor="location">City</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Riverside, Fourways"
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Street Address (Optional)</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g., 123 Main Street, Suburb"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Full address helps show exact location on map
            </p>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>WiFi Available</Label>
              <div className="flex items-center gap-3 mt-2">
                <input id="wifi_available" type="checkbox" checked={!!formData.wifi_available} onChange={(e) => setFormData({ ...formData, wifi_available: e.target.checked })} />
                <Label htmlFor="wifi_available" className="text-sm">Available</Label>
              </div>
            </div>

            <div>
              <Label>Pets Allowed</Label>
              <div className="flex items-center gap-3 mt-2">
                <input id="pets_allowed" type="checkbox" checked={!!formData.pets_allowed} onChange={(e) => setFormData({ ...formData, pets_allowed: e.target.checked })} />
                <Label htmlFor="pets_allowed" className="text-sm">Allowed</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <Label>Furnished</Label>
              <div className="flex items-center gap-3 mt-2">
                <input id="furnished" type="checkbox" checked={!!formData.furnished} onChange={(e) => setFormData({ ...formData, furnished: e.target.checked })} />
                <Label htmlFor="furnished" className="text-sm">Furnished</Label>
              </div>
            </div>

            <div>
              <Label>Parking Available</Label>
              <div className="flex items-center gap-3 mt-2">
                <input id="parking_available" type="checkbox" checked={!!formData.parking_available} onChange={(e) => setFormData({ ...formData, parking_available: e.target.checked })} />
                <Label htmlFor="parking_available" className="text-sm">Available</Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="amenities">Other Amenities (comma separated)</Label>
            <Input id="amenities" value={formData.amenities} onChange={(e) => setFormData({ ...formData, amenities: e.target.value })} placeholder="e.g., hot water, security, pool" />
          </div>

          <div>
            <Label>Property Images (Multiple)</Label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-2"
              disabled={uploading || loading}
              multiple
            />
            <p className="text-sm text-muted-foreground mt-1">
              Select multiple images to showcase different angles and rooms of your property
            </p>

            {uploading && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" aria-hidden />
                <span>Uploading {selectedFiles.length} image(s)...</span>
              </div>
            )}

            {/* Preview Grid */}
            {previewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={url} 
                      alt={`Preview ${index + 1}`} 
                      className="h-32 w-full object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {index === 0 ? 'Primary' : `Image ${index + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Display uploaded URLs */}
            {uploadedImageUrls.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="font-semibold text-sm text-green-900 mb-2">
                  ✓ {uploadedImageUrls.length} Image(s) Uploaded Successfully
                </p>
                <div className="space-y-2">
                  {uploadedImageUrls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <span className="text-green-700">Image {index + 1}:</span>
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="underline text-primary truncate flex-1"
                      >
                        {url}
                      </a>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleCopyUrl(url)} 
                        className="h-6 px-2"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Input Section with Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="video_url">Property Video (Optional)</Label>
                {videoMode === 'link' ? (
                  <Button type="button" variant="outline" size="sm" onClick={switchToFile} disabled={uploading || loading || uploadingVideo}>
                    Use File Upload
                  </Button>
                ) : (
                  <Button type="button" variant="outline" size="sm" onClick={switchToLink} disabled={uploading || loading || uploadingVideo}>
                    Use Link Input
                  </Button>
                )}
              </div>

              <div className="mt-4">
                <Label>Upload Identity Document (required)</Label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleDocumentChange}
                  className="mt-2"
                  disabled={uploading || loading}
                />
                <p className="text-sm text-muted-foreground mt-1">Upload a government ID or proof of identity. Admin will verify before the listing goes live.</p>

                {documentPreviewUrl && (
                  <div className="mt-3">
                    <a href={documentPreviewUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">Preview uploaded document</a>
                  </div>
                )}
              </div>

              {videoMode === 'file' ? (
                <div className="space-y-3 mt-2">
                  {/* Video File Upload */}
                  <div>
                    <Label htmlFor="video_file" className="cursor-pointer">
                      <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary transition-colors text-center">
                        <Input
                          id="video_file"
                          type="file"
                          accept="video/mp4,video/mov,video/avi,video/wmv,video/webm,video/mkv"
                          onChange={handleVideoChange}
                          className="hidden"
                          disabled={uploading || loading || uploadingVideo}
                        />
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Upload Video File</p>
                            <p className="text-sm text-muted-foreground">MP4, MOV, AVI, WebM (Max 100MB)</p>
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>

                  {/* Video Preview */}
                  {videoPreview && (
                    <div className="relative rounded-lg overflow-hidden border">
                      <video 
                        src={videoPreview} 
                        controls 
                        className="w-full max-h-64 object-contain bg-black"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeVideo}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-2">
                  {/* Video URL Input */}
                  <Input
                    id="video_url"
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="e.g., https://youtube.com/watch?v=... or https://vimeo.com/..."
                    disabled={uploading || loading || uploadingVideo}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Add a YouTube, Vimeo, or direct video URL
                  </p>
                </div>
              )}
            </div>

            <Label htmlFor="image_url" className="mt-3">Or Single Image URL (Optional)</Label>
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

            <Button type="submit" disabled={loading || uploading || analyzing || uploadingVideo} className="flex-1">
              {uploadingVideo ? (
                <div className="flex items-center justify-center w-full">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" aria-hidden />
                  <span>Uploading Video...</span>
                </div>
              ) : uploading ? (
                <div className="flex items-center justify-center w-full">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" aria-hidden />
                  <span>Uploading Images...</span>
                </div>
              ) : loading ? (
                initialData ? "Updating..." : "Listing..."
              ) : fraudAnalysis?.isSuspicious ? (
                "Submit Anyway"
              ) : (
                initialData ? "Update Property" : "List Property"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
