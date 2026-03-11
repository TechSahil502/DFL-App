export interface DraftRecord {
    id: string;                 // e.g. "DRAFT5DCF0903"
    displayId: string;          // e.g. "#5DCF0903"

    // Shipper Data
    shipperData: any;

    // Consignee Data
    consigneeData: any;

    // Shipment Data
    shipmentData: any;

    // CSB-V Details
    csbVDetails?: any;

    // Metadata for Table
    shipperName: string;
    consigneeName: string;
    origin: string;
    destination: string;
    details: string;            // e.g. "Parcel 1 Box(es)"
    estAmount: string;
    savedAt: string;            // ISO date string
    activeStep: number;
}

type Listener = () => void;

let _drafts: DraftRecord[] = [];
const _listeners: Set<Listener> = new Set();
let _currentDraftToLoad: DraftRecord | null = null;

function notify() {
    _listeners.forEach(l => l());
}

export const DraftsStore = {
    /** Get a snapshot of all drafts (newest first). */
    getAll(): DraftRecord[] {
        return [..._drafts].reverse();
    },

    /** Set the draft to be loaded in the form. */
    setDraftToLoad(draft: DraftRecord | null) {
        _currentDraftToLoad = draft;
        notify();
    },

    /** Get the draft to be loaded. */
    getDraftToLoad(): DraftRecord | null {
        return _currentDraftToLoad;
    },

    /** Add a new draft entry. */
    add(draft: DraftRecord) {
        _drafts.push(draft);
        notify();
    },

    /** Remove a draft by id. */
    remove(id: string) {
        _drafts = _drafts.filter(d => d.id !== id);
        notify();
    },

    /** Subscribe to store changes; returns an unsubscribe function. */
    subscribe(listener: Listener): () => void {
        _listeners.add(listener);
        return () => _listeners.delete(listener);
    },
};
