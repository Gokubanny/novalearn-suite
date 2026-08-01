# Fix registration fields and remove public Admin sign-up

## What's happening now

There are two sign-up screens in the project:

- `RegisterPage.tsx` — a 4-step flow (Role → School → Department → Details) that already collects exactly what the backend expects: `firstName, lastName, email, password, phone, schoolCode, departmentId` plus `level` + `matricNumber` for students, and `title` + `qualification` + `specialisation` for lecturers. It only offers Student and Lecturer.
- `AuthPage.tsx` — an older single-form sign-up that sends `department` and `institution` as free text (fields the backend does not accept), is missing `schoolCode`, `departmentId`, `level`, `matricNumber`, `title` and `qualification`, and shows an **Admin** role tile.

The router points both `/login` and `/register` at `AuthPage`, so the wrong form is the one users actually see. That's the cause of the mismatch.

## Changes

1. **Route `/register` to the correct form** (`src/App.tsx`)
  - Lazy-import `RegisterPage` and use it for `/register`. `/login` keeps using `AuthPage`.
2. **Remove public Admin sign-up** (`src/pages/auth/AuthPage.tsx`)
  - Drop the Admin tile from the role options so no path offers an admin account. Admins are created by the Super Admin only.
3. **Registration payloads** — no change needed
  - `AuthContext.register` and `auth.service` already post to `/api/auth/register/student` and `/api/auth/register/lecturer` with the exact field names the backend expects.

## Technical notes

- Files edited: `frontend/src/App.tsx`, `frontend/src/pages/auth/AuthPage.tsx`.
- `AuthPage`'s legacy register form becomes unused for routing; the Admin option is removed from it regardless so it can never be reached.
- No backend or business-logic changes.
- Preview is currently down for an unrelated reason: `frontend/node_modules` is empty, so `vite` isn't found. First step on build will be reinstalling frontend dependencies.   
i also want to add a suggestion for the registration UI i was thinking of a step by step process of filling the form 