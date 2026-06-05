## Goal

Two independent cleanups/upgrades now that the frontend runs entirely on the Render API:

1. Delete the dead Supabase scaffolding from the repo.
2. Replace the 15-second notification polling with a true WebSocket realtime channel, keeping polling only as a fallback.

---

## Part 1 — Remove legacy Supabase files

### What gets deleted

Frontend (no longer imported anywhere):
- `frontend/src/integrations/supabase/client.ts`
- `frontend/src/integrations/supabase/types.ts`
- `frontend/supabase/` (entire folder: `config.toml`, `functions/ai-tutor`, `functions/create-checkout-session`, `functions/create-portal-session`, `functions/seed-demo-data`, `functions/stripe-webhook`, all `migrations/*.sql`)

Repo root duplicates created by the Lovable Cloud auto-scaffold:
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `supabase/config.toml`
- `.env` at repo root (only if it just holds the Supabase keys — will verify before deleting)

### Safety checks before deletion

- `rg "@/integrations/supabase"` across `frontend/src` to confirm zero imports remain.
- `rg "supabase\\.from\\(|supabase\\.auth|supabase\\.storage|supabase\\.channel"` to confirm no runtime calls.
- If any stray reference is found, fix that file first (replace with the matching Render service) before deleting.

### Memory + config follow-ups

- Update `mem://tech/backend-infrastructure` and `mem://tech/file-access` to describe the Render + MongoDB + Cloudinary stack instead of Supabase/RLS/signed URLs.
- Update the Core line in `mem://index.md` that still says "Supabase + RLS backend".
- Leave Lovable Cloud "enabled" status alone — we only remove the project files; the integration toggle is managed in the UI.

---

## Part 2 — WebSocket realtime notifications

### Backend (`backend/`)

- Add `socket.io` dependency.
- In `backend/src/index.ts`, wrap the existing Express server with an `http.Server` and attach a Socket.IO server on the same port, sharing CORS config with Express.
- Create `backend/src/realtime/socket.ts`:
  - JWT auth middleware on the socket handshake (`auth.token`), reusing the same secret as the REST middleware.
  - On connect, join a per-user room: `user:{userId}` and, if present, `school:{schoolId}`.
  - Export `emitToUser(userId, event, payload)` and `emitToSchool(schoolId, event, payload)` helpers.
- In `backend/src/modules/notification/notification.controller.ts` (and wherever notifications are created elsewhere — attendance, assignments, results, discussions), call `emitToUser` with event `notification:new` right after persisting.
- Emit `notification:read` and `notification:read-all` on the corresponding PATCH endpoints so multiple tabs stay in sync.

### Frontend (`frontend/`)

- Add `socket.io-client`.
- Create `frontend/src/lib/socket.ts`: a singleton that lazily connects using the JWT from `authStore`, exposes `getSocket()`, `disconnect()`, and reconnects on token change.
- Rewrite `frontend/src/hooks/useNotifications.ts`:
  - Initial fetch via `notificationService.getNotifications()` (unchanged).
  - Subscribe to `notification:new` → prepend to list + bump unread count + fire toast.
  - Subscribe to `notification:read` / `notification:read-all` → update local state.
  - Keep a slow polling fallback (`60s`, not 15s) that only runs while the socket is disconnected; clear it as soon as `connect` fires.
  - Expose connection status (`isRealtime: boolean`) for the UI.
- `NotificationCentrePage.tsx`: show a small "Live" indicator when `isRealtime` is true, "Polling" when it falls back. No layout/redesign changes.
- Tear down the socket on logout (hook into `authStore` sign-out).

### Env / config

- Backend already uses one port for HTTP — Socket.IO attaches to the same server, so no new Render service or port is needed.
- Frontend reads the WebSocket URL from the existing `VITE_API_URL` (strip `/api` suffix if present) — no new env var required.

---

## Technical notes

- Socket.IO is chosen over raw `ws` because it handles reconnect, heartbeat, and the polling-transport fallback automatically, which matches the existing graceful-degradation behavior.
- Auth: JWT is passed in `io(url, { auth: { token } })`; the server verifies in `io.use(...)` middleware and attaches `socket.data.user`.
- No DB schema changes. No changes to any dashboard page layouts.
- Backend changes require a Render redeploy before the frontend realtime indicator will flip to "Live"; until then the fallback polling keeps everything working.

---

## Out of scope

- Realtime for chat, discussions, attendance sessions, or grades (can be added later using the same `emitToUser` helper).
- Removing the Lovable Cloud integration itself (just the local files).
- Any visual redesign.
