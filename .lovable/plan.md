

## Account Add & Edit Features

Currently the Accounts page is read-only. I'll add the ability to **add new accounts** and **edit existing accounts** (name, balance, category, icon).

### Changes

**1. LedgerContext (`src/contexts/LedgerContext.tsx`)**
- Add `addAccount(account)` function — adds a new account to the list
- Add `editAccount(id, updates)` function — updates name, balance, category, icon
- Add `deleteAccount(id)` function — removes an account
- Expose these in the context type

**2. AccountsPage (`src/pages/AccountsPage.tsx`)**
- Add a **"+ Add Account"** button at the top
- Add **edit (pencil) and delete (trash) icons** on each account card
- Add a **Dialog form** for adding/editing with fields:
  - Account Name (text input)
  - Category (select: DBBL, bKash, Rocket, Nagad, Cash, Other)
  - Balance (number input)
  - Icon (select from available icons)
- Reuse the same dialog for both add and edit modes

### UI Flow
- Tap "+" button → opens empty form → save creates new account
- Tap pencil icon on account → opens pre-filled form → save updates account
- Tap trash icon → confirmation → deletes account

