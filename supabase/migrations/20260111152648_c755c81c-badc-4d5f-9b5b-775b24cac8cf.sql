-- Create creator applications table
CREATE TABLE public.creator_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    motivation TEXT NOT NULL,
    specialty TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    meeting_date TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view their own applications"
ON public.creator_applications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own applications
CREATE POLICY "Users can insert their own applications"
ON public.creator_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.creator_applications
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update applications
CREATE POLICY "Admins can update applications"
ON public.creator_applications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete applications
CREATE POLICY "Admins can delete applications"
ON public.creator_applications
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_creator_applications_updated_at
BEFORE UPDATE ON public.creator_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();