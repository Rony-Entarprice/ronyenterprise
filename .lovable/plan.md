

## Daily Balance Snapshot System

আপনি প্রতিদিন সব অ্যাকাউন্টের ব্যালেন্স আপডেট করতে পারবেন এবং তারিখ অনুযায়ী হিস্ট্রি দেখতে পারবেন।

### What will be built

1. **New database table**: `daily_balance_snapshots` — প্রতিদিনের সব অ্যাকাউন্টের ব্যালেন্স সেভ রাখবে
2. **New page**: "Daily Balance" — যেখানে আজকের তারিখে সব অ্যাকাউন্টের ব্যালেন্স ইনপুট দিতে পারবেন
3. **History view**: তারিখ অনুযায়ী আগের দিনের ব্যালেন্স দেখতে পারবেন
4. **Navigation**: Bottom nav বা Dashboard থেকে এই পেজে যাওয়া যাবে

### Technical Details

**Database Migration:**
```sql
CREATE TABLE public.daily_balance_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  account_id uuid NOT NULL,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id, snapshot_date)
);

ALTER TABLE public.daily_balance_snapshots ENABLE ROW LEVEL SECURITY;
-- RLS policies for business-scoped access (same pattern as other tables)
```

**New Page** (`DailyBalancePage.tsx`):
- Top: Date picker (default today)
- List of all accounts with editable balance input fields
- "Save All" button to save/update all balances for that date
- Below: History section showing past snapshots grouped by date
- Each date expandable to show all account balances for that day

**LedgerContext updates:**
- Add `saveDailySnapshot` and `getDailySnapshots` functions
- Fetch snapshot history

**Routing:**
- Add `/daily-balance` route
- Add link from Dashboard or Accounts page

### Files to create/modify
- **New**: `src/pages/DailyBalancePage.tsx`
- **Modify**: `src/contexts/LedgerContext.tsx` — add snapshot functions
- **Modify**: `src/App.tsx` — add route
- **Modify**: `src/pages/Dashboard.tsx` or `src/components/BottomNav.tsx` — add navigation link

