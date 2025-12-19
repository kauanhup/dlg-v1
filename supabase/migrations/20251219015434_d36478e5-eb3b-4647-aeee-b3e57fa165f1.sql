-- Make bot-files bucket private to require authentication for downloads
UPDATE storage.buckets 
SET public = false 
WHERE id = 'bot-files';