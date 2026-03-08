

## Baki ও Joma এন্ট্রি Edit অপশন

### Changes

**1. LedgerContext (`src/contexts/LedgerContext.tsx`)**
- Add `editBaki(id, updates)` and `editJoma(id, updates)` functions
- Expose them in the context type

**2. BakiPage (`src/pages/BakiPage.tsx`)**
- Add a **Pencil (edit) icon** button next to each entry's delete button
- Reuse the existing add dialog for editing: when edit is tapped, pre-fill form fields with the entry's current values
- Track an `editingId` state — if set, the save button calls `editBaki`/`editJoma` instead of `addBaki`/`addJoma`
- Dialog title changes to "Edit Baki" / "Edit Joma" when editing

