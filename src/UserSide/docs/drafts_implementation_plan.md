# Drafts Functionality Implementation Plan

Implemented a robust "Drafts" feature allowing users to save and resume shipment bookings.

## 1. State Management (`DraftsStore.ts`)
- Created `DraftsStore` to manage `DraftRecord` objects.
- Supported operations: `add`, `remove`, `getAll`, `setDraftToLoad`, and `getDraftToLoad`.
- Implemented a listener pattern for reactive UI updates across screens.

## 2. Drafts Visualization (`DraftsScreen.tsx`)
- Developed a new screen to display saved drafts in a tabular format.
- **Key Columns**:
    - **Draft ID**: Unique identifier with a status icon (Red Package).
    - **Shipper/Consignee**: Primary name and optional secondary company name.
    - **Route**: Origin to Destination flow.
    - **Details**: Shipment type and box count.
    - **Est. Amount**: Parsed from the booking data.
    - **Date**: Formatted date and time of saving.
- **Actions**:
    - **Delete**: Remove draft with a confirmation prompt.
    - **Load**: Transfer draft data to the booking form and navigate.

## 3. Booking Integration (`BookShipmentScreen.tsx`)
- **Saving**: Updated `handleSaveAsDraft` to capture all current form states (Shipper, Consignee, Shipment, CSB-V, Step) into a `DraftRecord`.
- **Loading**: Modified `useEffect` to check for `DraftsStore.getDraftToLoad()` on mount.
    - Auto-fills all `shipperData`, `consigneeData`, and `shipmentData`.
    - Restores the exact step (`activeStep`) the user was on.
    - Clears the "load" state after successful population.

## 4. UI/UX & Alignment
- **Sidebar Integration**: Added "Drafts" to the sidebar with appropriate icons and active state highlighting.
- **Responsive Design**: Ensured the table and header elements adapt to different screen widths.
- **Premium Aesthetics**: Used a consistent color palette (#003049, #E67E22), rounded corners, and subtle shadows.

## 5. Verification
- Verified "Save as Draft" persists data in the store.
- Verified "Drafts" table correctly displays saved records and dummy data.
- Verified clicking the "Load" icon correctly populates the booking form and navigates to the correct step.
