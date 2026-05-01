
-- Add approval_status column to profiles for student approval workflow
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending';

-- Set existing profiles to 'approved' so they're not blocked
UPDATE public.profiles SET approval_status = 'approved' WHERE approval_status = 'pending';

-- Change default for new signups back to pending
-- (The UPDATE above handled existing records, new ones will default to 'pending')
