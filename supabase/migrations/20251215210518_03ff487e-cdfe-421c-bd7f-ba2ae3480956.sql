-- Create storage bucket for session files
INSERT INTO storage.buckets (id, name, public)
VALUES ('sessions', 'sessions', false);

-- Allow admins to upload session files
CREATE POLICY "Admins can upload session files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'sessions' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to read session files
CREATE POLICY "Admins can read session files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'sessions' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to delete session files
CREATE POLICY "Admins can delete session files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'sessions' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Create table to track individual session files
CREATE TABLE public.session_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('brasileiras', 'estrangeiras')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sold_at TIMESTAMP WITH TIME ZONE,
  order_id UUID REFERENCES public.orders(id),
  user_id UUID
);

-- Enable RLS
ALTER TABLE public.session_files ENABLE ROW LEVEL SECURITY;

-- Admins can manage all session files
CREATE POLICY "Admins can manage session files"
ON public.session_files
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Users can view their own purchased sessions
CREATE POLICY "Users can view their purchased sessions"
ON public.session_files
FOR SELECT
TO authenticated
USING (user_id = auth.uid());