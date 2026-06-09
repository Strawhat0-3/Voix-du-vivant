-- Add video support to podcasts table
ALTER TABLE public.podcasts 
ADD COLUMN video_url text,
ADD COLUMN media_type text NOT NULL DEFAULT 'audio' CHECK (media_type IN ('audio', 'video'));

-- Update existing podcasts to have media_type = 'audio'
UPDATE public.podcasts SET media_type = 'audio' WHERE media_type IS NULL;

-- Create storage bucket for podcast videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('podcast-videos', 'podcast-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for podcast videos
CREATE POLICY "Anyone can view podcast videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'podcast-videos');

CREATE POLICY "Authenticated users can upload podcast videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'podcast-videos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own podcast videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'podcast-videos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own podcast videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'podcast-videos' AND auth.uid() IS NOT NULL);