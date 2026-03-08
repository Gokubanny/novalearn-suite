

# Plan: Subscription-Based Dashboard Feature Gating

## What We're Building

Read the institution's `subscription_plan` (Basic/Pro/Enterprise) from the database and use it to conditionally show, hide, or lock dashboard features with upgrade prompts.

## Feature Matrix

```text
Feature                  | Basic | Pro   | Enterprise
─────────────────────────┼───────┼───────┼───────────
Max Students             | 500   | 2,000 | Unlimited
Max Lecturers            | 10    | 50    | Unlimited
AI Assistant             | ✗     | ✓     | ✓
Advanced Analytics       | ✗     | ✓     | ✓
Facial Recognition       | ✗     | ✗     | ✓
Notification Centre      | Basic | Full  | Full
Priority Support         | ✗     | ✓     | ✓
```

## Implementation Steps

### 1. Extend AuthContext with `institutionId`

**File:** `src/contexts/AuthContext.tsx`
- Add `institutionId?: string` to `UserProfile` interface
- In `fetchUserProfile`, map `profile.institution_id` to the new field

### 2. Create `useSubscription` Hook

**File:** `src/hooks/useSubscription.ts` (new)
- Takes `institutionId` from `useAuth()`
- Queries `institutions` table for `subscription_plan`
- Returns `{ plan, isLoading, canAccess(feature), limits }`
- Contains a static config map defining which features/limits each plan gets

### 3. Create `UpgradePrompt` Component

**File:** `src/components/dashboard/UpgradePrompt.tsx` (new)
- Reusable card: icon, "This feature requires [Plan]" message, feature description
- CTA button linking to `/dashboard/admin/subscription`
- Used on all gated pages

### 4. Gate Dashboard Pages

- **`AIAssistantPage.tsx`** — If plan is Basic, render `UpgradePrompt` instead of chat (requires Pro+)
- **`FacialRecognitionPage.tsx`** — If plan is not Enterprise, render `UpgradePrompt` (requires Enterprise)
- **`NotificationCentrePage.tsx`** — Basic: limit to 10 notifications, disable real-time; Pro/Enterprise: full access

### 5. Add Nav Item Locking

**File:** `src/components/dashboard/DashboardLayout.tsx`
- Extend `NavItem` interface with optional `requiredPlan?: string`
- In sidebar rendering, show a lock icon next to gated items and redirect to subscription page on click
- Update nav item arrays in Student/Lecturer/Admin dashboards to tag gated features

### 6. Admin Dashboard Plan Badge & Usage

**File:** `src/pages/dashboard/AdminDashboard.tsx`
- Show current plan badge in header area
- Display usage progress bars (e.g., "120/500 Students") by querying profile counts
- Warning banner when usage exceeds 80% of limit

### 7. Wire Subscription Page to Real Data

**File:** `src/pages/dashboard/admin/SubscriptionPage.tsx`
- Fetch actual `subscription_plan` from `institutions` table
- Mark the current plan as active dynamically
- Show real usage counts against plan limits

## Files Summary

| File | Action |
|------|--------|
| `src/contexts/AuthContext.tsx` | Modify — add `institutionId` |
| `src/hooks/useSubscription.ts` | Create — subscription hook |
| `src/components/dashboard/UpgradePrompt.tsx` | Create — upgrade prompt card |
| `src/components/dashboard/DashboardLayout.tsx` | Modify — nav item lock icons |
| `src/pages/dashboard/student/AIAssistantPage.tsx` | Modify — gate behind Pro |
| `src/pages/dashboard/ai/FacialRecognitionPage.tsx` | Modify — gate behind Enterprise |
| `src/pages/dashboard/ai/NotificationCentrePage.tsx` | Modify — limit for Basic |
| `src/pages/dashboard/AdminDashboard.tsx` | Modify — plan badge + usage bars |
| `src/pages/dashboard/admin/SubscriptionPage.tsx` | Modify — real plan data |
| Student/Lecturer nav arrays | Modify — tag gated items |

No database changes needed — `institutions.subscription_plan` already exists.

