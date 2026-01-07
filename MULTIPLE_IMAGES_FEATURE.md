# Multiple Image Upload Feature

## Overview
Landlords can now upload multiple images for their properties, allowing them to showcase different rooms, angles, and features of their apartments or houses.

## Features

### 1. Multiple Image Selection
- Landlords can select multiple images at once using the file input
- Images are previewed in a grid before upload
- Each image can be individually removed before submission

### 2. Image Gallery
- Property detail pages display all images in an interactive gallery
- Navigation arrows to browse through images
- Thumbnail navigation for quick access
- Image counter showing current position (e.g., "2 / 5")

### 3. Image Indicators
- Property cards show an image count badge when multiple images exist
- Featured image (first in array) is displayed as the main thumbnail

### 4. Upload Progress
- Real-time upload progress indicator
- Individual file upload handling with error recovery
- Failed uploads are skipped with user notification

## Database Schema

### Properties Table
```sql
-- New column for multiple images
images TEXT[] DEFAULT '{}';  -- Array of image URLs

-- Existing column (kept for backward compatibility)
image_url TEXT;  -- Primary/featured image
```

### Migration
Location: `/client/supabase/migrations/20260107000000_add_multiple_images_support.sql`

The migration:
- Adds `images` array column
- Migrates existing `image_url` data to `images` array
- Maintains backward compatibility

## Usage

### For Landlords

#### Uploading Multiple Images
1. Navigate to "List New Property" page
2. Click on "Property Images (Multiple)" file input
3. Select multiple images (Ctrl+Click or Shift+Click)
4. Preview all selected images in the grid
5. Remove unwanted images by clicking the X button
6. Fill in other property details
7. Submit the form

#### Image Order
- The first image in the selection becomes the **primary/featured** image
- This image is displayed on property cards and listings
- All images are available in the property detail gallery

### For Tenants

#### Viewing Property Images
1. Click "View Details" on any property
2. Browse images using:
   - Left/Right arrow buttons
   - Thumbnail navigation bar
   - Keyboard arrows (if implemented)
3. See image counter at bottom right

## Technical Implementation

### Frontend Components

#### PropertyForm.tsx
**State Management:**
```typescript
const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
const [previewUrls, setPreviewUrls] = useState<string[]>([]);
const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
```

**File Handling:**
- Multiple file selection via HTML5 file input with `multiple` attribute
- Preview URL generation with automatic cleanup
- Individual image removal before upload

**Upload Logic:**
```typescript
// Upload each file to Supabase Storage
for (const file of selectedFiles) {
  const filePath = `properties/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const { error } = await supabase.storage.from('images').upload(filePath, file);
  // Handle errors gracefully
}
```

#### PropertyDetailModal.tsx
**Gallery Features:**
- Image carousel with navigation arrows
- Thumbnail strip for quick navigation
- Current image indicator
- Responsive design for mobile/desktop

**State:**
```typescript
const [currentImageIndex, setCurrentImageIndex] = useState(0);

const propertyImages = property?.images && Array.isArray(property.images) 
  ? property.images 
  : property?.image_url 
  ? [property.image_url] 
  : [];
```

#### FeaturedProperties.tsx
**Image Count Badge:**
- Shows number of images on property cards
- Only displayed when multiple images exist
- Uses Lucide `Images` icon

### Backend Integration

#### Property Model (MySQL/Sequelize)
```javascript
images: {
  type: DataTypes.JSON,
  defaultValue: []
}
```

#### API Endpoints
The existing property endpoints automatically handle the `images` array:
- `POST /api/properties` - Creates property with images array
- `GET /api/properties` - Returns properties with images
- `PUT /api/properties/:id` - Updates property images

### Storage

#### Supabase Storage
- Bucket: `images`
- Path pattern: `properties/{timestamp}-{random}.{ext}`
- Public URLs generated automatically
- No file size limit enforced (configurable in Supabase dashboard)

**Recommended Storage Policies:**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow public to read
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');
```

## Future Enhancements

### Planned Features
1. **Drag-and-drop** reordering of images
2. **Image compression** before upload to save storage
3. **Max image limit** (e.g., 10 images per property)
4. **Room labeling** - Tag images as "Living Room", "Bedroom", etc.
5. **Video support** - Allow landlords to upload property videos
6. **360° photos** - Support for panoramic views
7. **Bulk edit** - Edit/delete multiple images at once
8. **Image optimization** - Auto-resize and compress on upload

### Accessibility Improvements
- Keyboard navigation for image gallery
- Screen reader announcements for image changes
- Alt text customization per image
- High contrast mode support

### Performance Optimizations
- Lazy loading for thumbnails
- Image CDN integration
- Progressive image loading
- Thumbnail generation on server

## Troubleshooting

### Common Issues

#### Images not uploading
**Check:**
- Supabase Storage bucket exists and is public
- Authentication token is valid
- File size within limits
- Network connection stable

**Solution:**
```javascript
// Enable detailed error logging
console.log('Upload error:', uploadError);
```

#### Images not displaying
**Check:**
- Image URLs are valid and accessible
- CORS settings allow image loading
- Browser console for 404 errors

**Solution:**
```tsx
// Add error handler to image tags
<img 
  src={imageUrl} 
  onError={(e) => {
    e.target.src = '/property-placeholder.png';
  }}
/>
```

#### Migration fails
**Check:**
- Database permissions
- Column doesn't already exist
- PostgreSQL version supports array types

**Solution:**
```sql
-- Check if column exists first
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'images'
  ) THEN
    ALTER TABLE properties ADD COLUMN images TEXT[] DEFAULT '{}';
  END IF;
END $$;
```

## Testing

### Manual Testing Checklist
- [ ] Upload single image - works as before
- [ ] Upload multiple images (2-5)
- [ ] Upload many images (10+)
- [ ] Remove images before upload
- [ ] Gallery navigation works
- [ ] Thumbnail navigation works
- [ ] Image counter displays correctly
- [ ] Mobile responsive design
- [ ] Error handling for failed uploads
- [ ] Backward compatibility with old properties

### Automated Tests (To be implemented)
```typescript
describe('Multiple Image Upload', () => {
  test('should handle multiple file selection', () => {
    // Test implementation
  });
  
  test('should upload all selected images', () => {
    // Test implementation
  });
  
  test('should display images in gallery', () => {
    // Test implementation
  });
});
```

## API Reference

### Property Object Schema
```typescript
interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  landlord_id: string;
  
  // Image fields
  image_url: string;      // Primary/featured image (legacy)
  images: string[];       // All property images (new)
  
  created_at: string;
  updated_at: string;
}
```

### Upload Response
```typescript
interface UploadResponse {
  success: boolean;
  uploadedUrls: string[];
  failedUploads: string[];
  message: string;
}
```

## Security Considerations

1. **File Type Validation**
   - Only accept image types (jpg, png, webp)
   - Validate MIME types on server

2. **File Size Limits**
   - Implement max file size (e.g., 5MB per image)
   - Show warning for large files

3. **Storage Quotas**
   - Monitor Supabase storage usage
   - Set up alerts for quota limits

4. **Access Control**
   - Only property owners can upload/edit images
   - Admins can moderate inappropriate images

## Support

For issues or questions:
- Check troubleshooting section above
- Review Supabase Storage logs
- Check browser console for errors
- Contact development team

---

**Version:** 1.0  
**Last Updated:** January 7, 2026  
**Author:** KasiRent Development Team
