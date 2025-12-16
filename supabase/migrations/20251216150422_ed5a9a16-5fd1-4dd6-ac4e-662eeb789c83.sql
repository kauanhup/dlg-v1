-- Create table to store bot executable information
CREATE TABLE public.bot_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  version TEXT NOT NULL DEFAULT '1.0.0',
  is_active BOOLEAN NOT NULL DEFAULT true,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bot_files ENABLE ROW LEVEL SECURITY;

-- Admins can manage bot files
CREATE POLICY "Admins can manage bot files"
ON public.bot_files
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view active bot files (for download)
CREATE POLICY "Anyone can view active bot files"
ON public.bot_files
FOR SELECT
USING (is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_bot_files_updated_at
BEFORE UPDATE ON public.bot_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for bot files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bot-files', 'bot-files', true);

-- Storage policies for bot files
CREATE POLICY "Admins can upload bot files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'bot-files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update bot files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'bot-files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete bot files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'bot-files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can download bot files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'bot-files');