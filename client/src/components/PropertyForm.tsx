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
import { Copy, AlertTriangle, ShieldCheck, ShieldAlert, Sparkles, Zap, X } from "lucide-react";

interface PropertyFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
  editingProperty?: any;
}

export const PropertyForm = ({ onSuccess, onCancel, editingProperty }: PropertyFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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
  });

  // Load editing data if provided
  useEffect(() => {
    if (editingProperty) {
      setFormData({
        title: editingProperty.title || "",
        location: editingProperty.location || "",
        address: editingProperty.address || "",
        price: editingProperty.price?.toString() || "",
        bedrooms: editingProperty.bedrooms?.toString() || "",
        bathrooms: editingProperty.bathrooms?.toString() || "",
        property_type: editingProperty.property_type || "",
        description: editingProperty.description || "",
        image_url: editingProperty.image_url || "",
        video_url: editingProperty.video_url || "",
      });
    }
  }, [editingProperty]);

  // Local file upload + preview state - now supporting multiple files
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  // Video upload state
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>("");
  const [videoInputType, setVideoInputType] = useState<"url" | "file">("url"); // Toggle between URL and file upload
  // Debug: store last uploaded image URLs for quick verification
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
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
      if (videoPreviewUrl && videoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [previewUrls, videoPreviewUrl]);

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

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Copied!", description: "Image URL copied to clipboard" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to copy URL", variant: "destructive" });
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate video file type
      const allowedTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi', 'video/mkv'];
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a video file (mp4, webm, mov, avi, mkv)",
          variant: "destructive"
        });
        return;
      }

      // Check file size (max 100MB)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Video file must be less than 100MB",
          variant: "destructive"
        });
        return;
      }

      setSelectedVideoFile(file);
      // Create preview URL
      if (videoPreviewUrl && videoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
      const previewUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(previewUrl);
    }
  };

  const removeVideoFile = () => {
    if (videoPreviewUrl && videoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setSelectedVideoFile(null);
    setVideoPreviewUrl("");
    setUploadedVideoUrl("");
  };

  const uploadVideoFile = async () => {
    if (!selectedVideoFile) return null;

    setUploadingVideo(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const formData = new FormData();
      formData.append('video', selectedVideoFile);

      const response = await fetch(`${API_BASE}/api/video-upload/single`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        const fullVideoUrl = `${API_BASE}${data.videoUrl}`;
        setUploadedVideoUrl(fullVideoUrl);
        toast({
          title: "Video uploaded!",
          description: `Video uploaded successfully (${(data.size / (1024 * 1024)).toFixed(2)}MB)`,
        });
        return fullVideoUrl;
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Video upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload video",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingVideo(false);
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
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to list a property",
        variant: "destructive",
      });
      return;
    }

    // Frontend Validation
    const validationErrors: string[] = [];
    
    if (!formData.title || formData.title.trim().length < 5) {
      validationErrors.push('Property title must be at least 5 characters');
    }
    
    if (!formData.location || formData.location.trim().length < 2) {
      validationErrors.push('Location must be at least 2 characters');
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      validationErrors.push('Price must be greater than 0');
    }
    
    if (parseFloat(formData.price) > 1000000) {
      validationErrors.push('Price seems unrealistic (max: R1,000,000)');
    }
    
    if (!formData.property_type) {
      validationErrors.push('Please select a property type');
    }
    
    if (!formData.bedrooms || parseInt(formData.bedrooms) < 0) {
      validationErrors.push('Please enter number of bedrooms (0 or more)');
    }
    
    if (!formData.bathrooms || parseInt(formData.bathrooms) < 1) {
      validationErrors.push('Please enter number of bathrooms (at least 1)');
    }
    
    if (selectedFiles.length === 0 && !formData.image_url) {
      validationErrors.push('Please upload at least one image or provide an image URL');
    }
    
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join('. '),
        variant: "destructive",
      });
      return;
    }

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
      // Upload video file if selected
      let videoUrl = formData.video_url; // Default to URL input
      if (videoInputType === "file" && selectedVideoFile) {
        const uploadedUrl = await uploadVideoFile();
        if (uploadedUrl) {
          videoUrl = uploadedUrl;
        }
      }

      // Upload multiple images to server
      const uploadedUrls: string[] = [];
      let uploadErrors = 0;

      if (selectedFiles.length > 0) {
        setUploading(true);
        
        const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
        
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

      // Use the first uploaded image as the primary image, or use existing/URL field
      const primaryImageUrl = uploadedUrls.length > 0 
        ? uploadedUrls[0] 
        : (editingProperty?.image_url || formData.image_url || null);

      console.log('Submitting property with:', {
        images: uploadedUrls,
        primaryImage: primaryImageUrl,
        userId: user._id,
        isEditing: !!editingProperty
      });

      // Submit to MySQL API
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const isEditing = !!editingProperty;
      const apiUrl = isEditing 
        ? `${API_BASE}/api/properties/${editingProperty.id}`
        : `${API_BASE}/api/properties`;
      
      console.log(isEditing ? 'Updating' : 'Creating', 'property at:', apiUrl);
      
      const propertyData = {
        landlord_id: user._id,
        title: formData.title,
        location: formData.location,
        address: formData.address,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        property_type: formData.property_type,
        description: formData.description,
        image_url: primaryImageUrl,
        images: uploadedUrls.length > 0 
          ? uploadedUrls 
          : (editingProperty?.images || (formData.image_url ? [formData.image_url] : [])),
        video_url: videoUrl || null,
      };
      
      console.log('Property data:', propertyData);
      
      const response = await fetch(apiUrl, {
        method: isEditing ? 'PUT' : 'POST',
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
        
        // Display validation errors if present
        if (result.errors && Array.isArray(result.errors)) {
          toast({
            title: "Validation Error",
            description: result.errors.join('. '),
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: result.message || 'Failed to create property',
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Success!",
        description: isEditing 
          ? "Property updated successfully"
          : (uploadedUrls.length > 0 
              ? `Property listed successfully with ${uploadedUrls.length} image(s)` 
              : "Property listed successfully"),
      });

      // Store uploaded URLs for reference
      if (uploadedUrls.length > 0) {
        setUploadedImageUrls(uploadedUrls);
        console.log("Uploaded image URLs:", uploadedUrls);
      }

      // reset form + uploaded file previews
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
      });
      setSelectedFiles([]);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      setUploading(false);
      // Reset video upload state
      removeVideoFile();
      setVideoInputType("url");

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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{editingProperty ? 'Edit Property' : 'List New Property'}</CardTitle>
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        )}
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
                minLength={5}
                maxLength={200}
                className="flex-1"
                placeholder="e.g., Modern 3BR House in Soweto"
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
            <Label htmlFor="location">City/Area</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Pretoria, Soweto, Sandton"
              required
              minLength={2}
              maxLength={100}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Main city or area
            </p>
          </div>

          <div>
            <Label htmlFor="address">Full Address (for map location)</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g., 123 Main Street, Riverside"
              minLength={5}
              maxLength={200}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Street address helps tenants find you on the map
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
                  min="1"
                  max="1000000"
                  step="0.01"
                  className="flex-1"
                  placeholder="5000"
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
              <Label htmlFor="property_type">Property Type *</Label>
              <Select
                value={formData.property_type}
                onValueChange={(value) => setFormData({ ...formData, property_type: value })}
                required
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
                max="50"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                required
                placeholder="3"
              />
            </div>

            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                min="1"
                max="20"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                required
                placeholder="2"
              />
            </div>
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
              <Label htmlFor="video_url">🎥 Video Tour (Optional)</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={videoInputType === "url" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVideoInputType("url")}
                  className="text-xs"
                >
                  URL
                </Button>
                <Button
                  type="button"
                  variant={videoInputType === "file" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVideoInputType("file")}
                  className="text-xs"
                >
                  Upload
                </Button>
              </div>
            </div>

            {videoInputType === "url" ? (
              <>
                <Input
                  id="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                  disabled={uploading || loading}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Add a YouTube, Vimeo, or direct video link to showcase your property with a video tour
                </p>
              </>
            ) : (
              <>
                <Input
                  id="video_file"
                  type="file"
                  accept="video/mp4,video/webm,video/mov,video/avi,video/mkv"
                  onChange={handleVideoFileChange}
                  disabled={uploading || loading || uploadingVideo}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Upload a video file (MP4, WebM, MOV, AVI, MKV) - Max 100MB
                </p>

                {/* Video Preview */}
                {selectedVideoFile && (
                  <div className="mt-4 relative">
                    <video
                      src={videoPreviewUrl}
                      controls
                      className="w-full max-h-64 rounded-lg"
                    >
                      Your browser does not support the video tag.
                    </video>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeVideoFile}
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      {selectedVideoFile.name} - {(selectedVideoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                )}

                {/* Uploaded Video Confirmation */}
                {uploadedVideoUrl && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="font-semibold text-sm text-green-900 mb-2">
                      ✓ Video Uploaded Successfully
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <a 
                        href={uploadedVideoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="underline text-primary truncate flex-1"
                      >
                        {uploadedVideoUrl}
                      </a>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleCopyUrl(uploadedVideoUrl)} 
                        className="h-6 px-2"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
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
                editingProperty ? "Updating..." : "Listing..."
              ) : fraudAnalysis?.isSuspicious ? (
                "Submit Anyway"
              ) : (
                editingProperty ? "Update Property" : "List Property"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
