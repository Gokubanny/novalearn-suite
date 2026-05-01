
ALTER TABLE public.institutions 
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive';

CREATE INDEX IF NOT EXISTS idx_institutions_stripe_customer_id ON public.institutions(stripe_customer_id);
