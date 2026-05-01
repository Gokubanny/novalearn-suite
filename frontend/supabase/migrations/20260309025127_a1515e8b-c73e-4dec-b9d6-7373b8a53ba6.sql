
-- Allow admins to update approval_status on profiles in their institution
CREATE POLICY "Admins can update profiles in their institution"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND institution_id = (
    SELECT p.institution_id FROM public.profiles p WHERE p.user_id = auth.uid() LIMIT 1
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND institution_id = (
    SELECT p.institution_id FROM public.profiles p WHERE p.user_id = auth.uid() LIMIT 1
  )
);
