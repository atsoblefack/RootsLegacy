# Family Heritage Book PDF Export System

## Overview
This document describes the custom family book PDF export feature, which is included in the Heritage tier and available as an in-app purchase for lower tiers.

## Pricing Tiers & Access

### Included Tiers
- **Heritage ($99 first year)**: Unlimited PDF exports included

### In-App Purchase for Other Tiers
- **Roots, Family, Clan**: Can purchase PDF export access for **$19.99 one-time**
- Once purchased, unlimited PDF exports are available forever

## Architecture

### Backend (Supabase Edge Functions)

**File: `/supabase/functions/server/pdf-export.tsx`**

Key Functions:
- `hasPdfExportAccess(userId)`: Checks if user has access (Heritage tier or purchased)
- `purchasePdfExport(userId, amount)`: Records PDF export purchase
- `getPdfExportStatus(userId)`: Returns current access status and reason
- `generatePdfExportData(userId, familyName)`: Generates structured data for PDF
- `recordPdfExport(userId, familyName)`: Tracks export history

**API Routes in `/supabase/functions/server/index.tsx`:**

1. `GET /pdf-export/status` - Check access status
2. `POST /pdf-export/purchase` - Purchase PDF export access ($19.99)
3. `POST /pdf-export/generate` - Generate PDF data (requires access)

### Frontend

**File: `/src/app/components/family-book-export.tsx`**

Features:
- Access status display with visual indicators
- Purchase flow for non-Heritage users
- PDF generation with family data
- HTML-based PDF creation (prints to PDF via browser)

**Navigation:**
- Accessible from Settings → Support → Family Heritage Book
- Route: `/family-book-export`

## PDF Content

The generated Heritage Book includes:

1. **Cover Page**
   - Family name
   - "Heritage Book" title
   - Generation date

2. **Family Overview**
   - Total members count
   - Number of generations
   - Oldest/youngest birth dates

3. **Family Members**
   - Name, photo (if available)
   - Birth date and place
   - Profession
   - Biography/stories

4. **Design**
   - Cultural colors (terracotta, ocre, brun profond)
   - Print-ready A4 format
   - Professional typography

## Technical Implementation

### Storage Keys (KV Store)
- `user:{userId}:tier` - User's subscription tier
- `user:{userId}:pdf_export_purchased` - Boolean flag
- `user:{userId}:pdf_export_purchase_metadata` - Purchase date and amount
- `user:{userId}:pdf_exports` - Array of export history

### Access Logic
```typescript
if (tier === 'heritage') {
  return true; // Unlimited access
}
if (purchased === 'true') {
  return true; // Purchased access
}
return false; // No access
```

### PDF Generation Flow

1. User clicks "Generate Heritage Book"
2. Frontend checks access via API
3. If access granted:
   - Backend fetches all family profiles
   - Backend fetches all relationships
   - Backend calculates statistics
   - Returns structured JSON data
4. Frontend generates HTML document
5. Opens print dialog for "Save as PDF"

## Future Enhancements

### Possible Improvements:
- Server-side PDF generation with pdfkit or similar
- Download directly as PDF file (no print dialog)
- Additional export formats (EPUB, Word)
- Customization options (theme, sections)
- Photo integration in PDF
- Family tree diagrams in export
- Multi-language support for content

### Payment Integration
Currently uses a mock payment. In production:
- Integrate with Stripe, PayPal, or mobile payment SDKs
- Add proper payment validation
- Send receipt emails
- Handle payment failures and refunds

## Testing

### Test Scenarios:

1. **Heritage User**
   - Should see "PDF Export Active"
   - Can generate unlimited PDFs
   - No purchase required

2. **Non-Heritage User (Not Purchased)**
   - Should see purchase option
   - Price displayed: $19.99
   - After purchase → unlimited access

3. **Non-Heritage User (Already Purchased)**
   - Should see "PDF Export Active"
   - Purchase date displayed
   - Can generate unlimited PDFs

4. **PDF Generation**
   - Test with empty family
   - Test with 1-5 members
   - Test with 50+ members
   - Test with/without photos
   - Test with/without biographies

## Security Considerations

- All API routes require authentication (access token)
- Purchase records stored securely in KV store
- No sensitive data exposed in PDF
- User can only export their own family data

## Maintenance Notes

- Monitor PDF generation performance for large families
- Track purchase conversion rates
- Collect user feedback on PDF quality
- Consider bandwidth for large PDF files
