# Dashboard navbar polish + logged-in public navbar

## What changes for the user

1. **Theme toggle in the dashboard header** — a sun/moon button next to the notification bell in the dashboard top bar (and in the mobile dashboard header), matching the public site toggle. The choice is remembered between visits and shared across public and dashboard views.

2. **Public navbar adapts to logged-in users** — when a session exists, the "Login" and "Get Started" buttons are replaced by the user's profile image (initials avatar fallback) plus their first name. Clicking opens a dropdown with:
   - Dashboard (routes to the right dashboard for their role)
   - Log out (clears session, returns to home)
   Logged-out visitors keep the current Login / Get Started buttons. The mobile menu mirrors the same behaviour.

## Technical notes

- New `useTheme` hook (`frontend/src/hooks/useTheme.ts`): reads/writes `localStorage["theme"]`, toggles the `dark` class on `<html>`, applies on load. `Navbar.tsx` switches its local `isDark` state over to this hook so both surfaces stay in sync.
- `DashboardLayout.tsx`: add the toggle button to the desktop header action row and to the mobile header; also add a Dashboard-relevant entry point for theme on small screens. No layout/structure changes otherwise.
- `Navbar.tsx`: consume `useAuth()`. When `user` is present render a `DropdownMenu` with the existing `AvatarImage` component (`user.avatar`, initials from first/last name) and `user.firstName`. Dashboard link resolved by role: student -> `/dashboard/student`, lecturer -> `/dashboard/lecturer`, admin -> `/dashboard/admin`, super_admin -> `/dashboard/super-admin` (same mapping already used after login). Logout calls `logout()` then navigates to `/`.
- Mobile menu: replace the Login/Get Started block with name + Dashboard + Log out links when authenticated.
- No backend, auth, or business-logic changes.
