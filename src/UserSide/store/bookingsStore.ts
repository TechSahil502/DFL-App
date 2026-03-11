// ─── Bookings Store ───────────────────────────────────────────────────────────
// Simple in-memory store that survives navigation between screens.
// Uses a listener pattern so screens can subscribe to updates.

export type ShipmentStatus =
    | 'Pending'
    | 'Processing'
    | 'In Transit'
    | 'Out for Delivery'
    | 'Delivered'
    | 'Cancelled'
    | 'On Hold'
    | 'Dispute';

export interface BookingRecord {
    id: string;                 // e.g. "DFL48602997"
    shipperName: string;
    shipperCompany: string;
    shipperMobile: string;
    shipperEmail: string;
    shipperAddress: string;
    shipperCity: string;
    shipperState: string;
    shipperCountry: string;
    shipperPincode: string;
    pickupDate: string;
    pickupType: 'Pickup' | 'Drop-off';

    consigneeName: string;
    consigneeCompany: string;
    consigneeMobile: string;
    consigneeEmail: string;
    consigneeAddress: string;
    consigneeCity: string;
    consigneeState: string;
    consigneeCountry: string;
    consigneePincode: string;

    shipmentType: string;       // "Parcel" | "Document"
    category: string;           // "CSB-IV …"
    invoiceNo: string;
    refNo: string;
    currency: string;
    totalWeight: string;        // kg
    totalValue: string;
    totalBoxes: number;

    carrier: string;            // "DFL EXPRESS - Priority"
    eta: string;                // "5-6 BUSINESS DAYS"
    price: number;
    gst: number;
    total: number;

    selectedServices: string[];
    status: ShipmentStatus;
    bookedAt: string;           // ISO date string
    csbVDetails?: any;          // Optional CSB-V details
    trackingHistory: { status: string; description: string; date: string }[];
}

type Listener = () => void;

let _bookings: BookingRecord[] = [];
const _listeners: Set<Listener> = new Set();
let _currentEditBooking: BookingRecord | null = null;

function notify() {
    _listeners.forEach(l => l());
}

export const BookingsStore = {
    /** Get a snapshot of all bookings (newest first). */
    getAll(): BookingRecord[] {
        return [..._bookings].reverse();
    },

    /** Set the booking to be viewed/edited in the form. */
    setEditBooking(booking: BookingRecord | null) {
        _currentEditBooking = booking;
        notify();
    },

    /** Get the booking currently being edited. */
    getEditBooking(): BookingRecord | null {
        return _currentEditBooking;
    },

    /** Add a new booking entry. */
    add(booking: BookingRecord) {
        _bookings.push(booking);
        notify();
    },

    /** Update the status of a booking by id. */
    updateStatus(id: string, status: ShipmentStatus) {
        const b = _bookings.find(b => b.id === id);
        if (b) {
            b.status = status;
            notify();
        }
    },

    /** Subscribe to store changes; returns an unsubscribe function. */
    subscribe(listener: Listener): () => void {
        _listeners.add(listener);
        return () => _listeners.delete(listener);
    },
};
