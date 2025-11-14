# Specs UI Implementation

## Overview
Implemented a multi-tab interface for displaying service specifications from MongoDB, matching the design provided.

## Components Created

### 1. Main Layout (`src/pages/MainLayout.tsx`)
- Top-level navigation with 4 tabs:
  - **Specs** (implemented)
  - Inventory (placeholder)
  - Service Activation (placeholder)
  - Example Requests (placeholder)
- Two-column layout: main content + sidebar
- Responsive design

### 2. Specs Page (`src/pages/SpecsPage.tsx`)
- Sub-tab navigation for 4 specification types:
  - **Port** → `CFSS_ConnectX_Port`
  - **LAG** → `CFSS_ConnectX_LAG`
  - **VXC** → `CFSS_ConnectX_VXC`
  - **VXC Cloud** → `CFSS_ConnectX_VXC_Cloud`
- Dynamic table displaying:
  - Name
  - Value Type
  - Mandatory (derived from minCardinality > 0)
- API integration with MongoDB

### 3. Quick Links Sidebar (`src/components/QuickLinks.tsx`)
- Collapsible/expandable panel
- Two link sections:
  - **Order:**
    - Create Service Order
    - Service Order Created
    - Service Order Events
  - **Activation:**
    - Create Service Activation
    - Service Activation Created
    - Service Activation Events
- Jaeger link at bottom

### 4. API Route (`src/index.tsx`)
- **Endpoint:** `GET /api/specifications/:id`
- Fetches from MongoDB `serviceSpecification` collection
- Returns specification data including `specCharacteristic` array
- Error handling for not found / server errors

### 5. Styling (`src/styles/layout.css`)
- Matches the design from screenshot
- Orange accent color for active tabs
- Black table header
- Purple/gray Quick Links sidebar
- Responsive breakpoints

## Data Flow

```
User selects sub-tab (e.g., "Port")
    ↓
Frontend calls: /api/specifications/CFSS_ConnectX_Port
    ↓
Backend queries MongoDB: serviceSpecification.findOne({ id: "CFSS_ConnectX_Port" })
    ↓
Returns specification with specCharacteristic array
    ↓
Frontend displays in table format
```

## MongoDB Schema

The specifications are stored with this structure:

```json
{
  "@type": "CustomerFacingServiceSpecification",
  "id": "CFSS_ConnectX_VXC_Cloud",
  "name": "CFSS_ConnectX_VXC_Cloud",
  "description": "ConnectX - CFSS - VXC Cloud",
  "specCharacteristic": [
    {
      "name": "nonMobileNo",
      "valueType": "string",
      "configurable": true,
      "minCardinality": 1,
      "maxCardinality": 1
    },
    ...
  ]
}
```

## Features Implemented

✅ Top-level navigation tabs
✅ Sub-tab navigation for specifications
✅ Dynamic table from MongoDB data
✅ Quick Links collapsible sidebar
✅ API route with error handling
✅ Loading states
✅ Error states
✅ Responsive design
✅ Styling matching screenshot

## Usage

### Start Server
```bash
bun dev
```

The server will:
1. Load configuration from `config/config.toml`
2. Initialize logger
3. Connect to MongoDB
4. Start HTTP server on http://localhost:3000

### Access the UI
Open browser to: http://localhost:3000

### Navigate
- Click top tabs to switch between pages (only Specs is implemented)
- Click sub-tabs (Port, LAG, VXC, VXC Cloud) to see different specifications
- Click Quick Links header to collapse/expand sidebar
- Click links in Quick Links (they use placeholder URLs for now)

## File Structure

```
src/
├── pages/
│   ├── MainLayout.tsx         # Main navigation + layout
│   └── SpecsPage.tsx          # Specs page with sub-tabs
├── components/
│   └── QuickLinks.tsx         # Sidebar component
├── styles/
│   └── layout.css             # All layout styles
├── App.tsx                    # App entry point
└── index.tsx                  # Server + API routes
```

## Next Steps

To fully complete the implementation:

1. **Add more data to MongoDB** if specifications are incomplete
2. **Implement placeholder pages:**
   - Inventory
   - Service Activation
   - Example Requests
3. **Update Quick Links URLs** with actual navigation
4. **Add shadcn/ui components** for more polished UI:
   - Table component
   - Tabs component
   - Card component
5. **Add search/filter functionality** to specifications table
6. **Add pagination** if specification lists are long

## Testing

The server successfully:
- ✅ Loads configuration
- ✅ Connects to MongoDB
- ✅ Serves API endpoints
- ✅ Serves React frontend
- ✅ Hot module replacement works

All existing tests still pass (29/29).
