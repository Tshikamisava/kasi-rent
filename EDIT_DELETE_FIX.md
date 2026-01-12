# Property Edit & Delete - Troubleshooting Guide

## Issue Reported
- Error: "doctype is not valid in json"
- 404 error when accessing property endpoint
- Property UUID in URL: `eae65410-3232-465b-a139-4574193a99e0`

## Root Cause
The error occurs because:
1. Server needs to be restarted after adding new endpoints
2. The MySQL Property model correctly uses UUID (not integer IDs)
3. New PUT and DELETE endpoints were added but server wasn't reloaded

## Solution

### 1. Restart the Server
```powershell
# Kill any process on port 5000
$port = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
if ($port) { Stop-Process -Id $port -Force }

# Start server
cd C:\Users\User\OneDrive\Desktop\kasi-rent\server
npm start
```

### 2. Verify Server is Running
```powershell
# Check if port 5000 is listening
Test-NetConnection -ComputerName localhost -Port 5000
```

### 3. Test the Endpoints

#### Test Delete
```powershell
# Replace with actual property ID and landlord ID
$propertyId = "eae65410-3232-465b-a139-4574193a99e0"
$landlordId = "443456e8-bca8-412f-82f5-241a3e06203f"

Invoke-RestMethod -Uri "http://localhost:5000/api/properties/$propertyId?landlord_id=$landlordId" -Method Delete
```

#### Test Update
```powershell
$body = @{
    landlord_id = "443456e8-bca8-412f-82f5-241a3e06203f"
    title = "Updated Property Title"
    price = 15000
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/properties/$propertyId" `
    -Method Put `
    -Body $body `
    -ContentType "application/json"
```

## Frontend Testing Steps

1. **Start Frontend**
   ```powershell
   cd C:\Users\User\OneDrive\Desktop\kasi-rent\client
   npm run dev
   ```

2. **Login as Landlord**
   - Go to http://localhost:5173
   - Sign in with landlord account

3. **Go to Landlord Dashboard**
   - Click on profile/avatar
   - Navigate to dashboard

4. **Test Edit**
   - Click "Edit" button on any property card
   - Modify property details
   - Click "Update Property"
   - Verify success toast appears
   - Verify property list refreshes with new data

5. **Test Delete**
   - Click trash icon on property card
   - Verify success toast appears
   - Verify property is removed from list

## API Endpoints Reference

### GET Properties
```
GET /api/properties?landlord_id={landlordId}
```

### CREATE Property
```
POST /api/properties
Content-Type: application/json

{
  "landlord_id": "uuid",
  "title": "string",
  "location": "string",
  "price": number,
  "bedrooms": number,
  "bathrooms": number,
  "property_type": "string",
  "description": "string",
  "image_url": "string",
  "images": ["url1", "url2"],
  "address": "string",
  "video_url": "string"
}
```

### UPDATE Property  
```
PUT /api/properties/{id}
Content-Type: application/json

{
  "landlord_id": "uuid",
  "title": "string",
  // ... other fields to update
}
```

### DELETE Property
```
DELETE /api/properties/{id}?landlord_id={landlordId}
```

## Common Errors & Solutions

### Error: "doctype is not valid in json"
**Cause:** Server returned HTML error page instead of JSON
**Solution:** 
- Check server is running
- Check correct API URL in frontend
- Verify endpoint exists in routes

### Error: 404 Not Found
**Cause:** Route not registered or server not restarted
**Solution:**
- Restart server
- Verify routes in `server/routes/propertyRoutes.js`
- Check console for route registration logs

### Error: EADDRINUSE Port 5000
**Cause:** Server already running on port 5000
**Solution:**
```powershell
$port = Get-NetTCPConnection -LocalPort 5000 | Select-Object -ExpandProperty OwningProcess -First 1
Stop-Process -Id $port -Force
```

### Error: 403 Unauthorized
**Cause:** landlord_id doesn't match property owner
**Solution:**
- Verify correct landlord_id is being sent
- Check property ownership in database
- Verify user is logged in correctly

## File Changes Made

1. ✅ `server/controllers/propertyController.js` - Added `updateProperty` and `deleteProperty`
2. ✅ `server/routes/propertyRoutes.js` - Added PUT and DELETE routes
3. ✅ `client/src/components/PropertyForm.tsx` - Added edit mode support
4. ✅ `client/src/pages/LandlordDashboard.tsx` - Integrated edit/delete handlers

## Next Steps

1. ✅ Restart server
2. Test edit functionality
3. Test delete functionality  
4. Verify authorization (try editing another landlord's property)
5. Test error handling (network errors, validation errors)
6. Add confirmation dialog for delete (optional enhancement)
