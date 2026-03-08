

# Plan: Unify the Login Page

## Current Problems

1. **Misleading role selector** — The login page has a 4-role selector (Student, Lecturer, Admin, Super Admin), but the user's actual role comes from the database. Selecting "Admin" and logging in with a student account navigates to the wrong dashboard.
2. **Register page links to non-existent route** — `RegisterPage` links to `/login/${selectedRole}` but only `/login` exists as a route.
3. **No automatic role-based redirect** — After login, the redirect is based on the selected UI role, not the user's real role from their profile.

## Proposed Solution

Remove the role selector from the login page entirely. After successful login, read the user's role from their profile and redirect to the correct dashboard automatically.

## Changes

### 1. Simplify `LoginPage.tsx`

- Remove the role selector grid and all role-related state/config
- Keep the clean two-panel layout (branding left, form right) with a single neutral color scheme
- On successful login, fetch the user's role from `AuthContext` and redirect accordingly:

```text
student     → /dashboard/student
lecturer    → /dashboard/lecturer
admin       → /dashboard/admin
super_admin → /dashboard/super-admin
```

- Add a helper function `getRoleRedirectPath(role)` to map roles to paths

### 2. Fix `RegisterPage.tsx` sign-in link

- Change the "Sign in" link from `/login/${selectedRole}` to just `/login`

### 3. Update `AuthContext` login return

- Ensure `login()` returns the user's role so `LoginPage` can redirect immediately without waiting for a state update, or use `user` from context after login succeeds

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/auth/LoginPage.tsx` | Remove role selector, add role-based redirect logic |
| `src/pages/auth/RegisterPage.tsx` | Fix sign-in link to `/login` |

No database or backend changes needed.

