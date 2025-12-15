-- Add banned column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN banned boolean NOT NULL DEFAULT false;

-- Create index for faster banned user queries
CREATE INDEX idx_profiles_banned ON public.profiles(banned);

-- Update RLS policy to prevent banned users from logging in (they can still view their profile but app should check banned status)
CREATE POLICY "Banned users cannot update their profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id AND banned = false);