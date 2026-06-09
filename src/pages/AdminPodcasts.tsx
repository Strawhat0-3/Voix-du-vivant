import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, Video, Music } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Podcast {
  id: string;
  title: string;
  slug: string;
  description: string;
  audio_url: string;
  video_url?: string;
  media_type: "audio" | "video";
  image_url: string;
  duration: number;
  published: boolean;
  created_at: string;
}

const AdminPodcasts = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    audio_url: "",
    video_url: "",
    media_type: "audio" as "audio" | "video",
    image_url: "",
    duration: 0,
    published: false,
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les podcasts",
        variant: "destructive",
      });
    } else {
      setPodcasts((data || []) as Podcast[]);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = formData.media_type === "video";
    const validType = isVideo ? file.type.startsWith('video/') : file.type.startsWith('audio/');
    
    if (!validType) {
      toast({
        title: "Erreur",
        description: `Veuillez sélectionner un fichier ${isVideo ? 'vidéo' : 'audio'}`,
        variant: "destructive",
      });
      return;
    }

    setUploadingMedia(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      const bucket = isVideo ? 'podcast-videos' : 'podcast-audio';

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // Try to get media duration
      const mediaElement = isVideo ? document.createElement('video') : document.createElement('audio');
      mediaElement.src = URL.createObjectURL(file);
      mediaElement.onloadedmetadata = () => {
        if (isVideo) {
          setFormData({ 
            ...formData, 
            video_url: publicUrl,
            audio_url: "",
            duration: Math.floor(mediaElement.duration)
          });
        } else {
          setFormData({ 
            ...formData, 
            audio_url: publicUrl,
            video_url: "",
            duration: Math.floor(mediaElement.duration)
          });
        }
      };
      
      toast({
        title: "Succès",
        description: `${isVideo ? 'Vidéo' : 'Audio'} téléchargé avec succès`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier image",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      
      toast({
        title: "Succès",
        description: "Image téléchargée avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const podcastData = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description,
      audio_url: formData.media_type === "audio" ? formData.audio_url : "",
      video_url: formData.media_type === "video" ? formData.video_url : null,
      media_type: formData.media_type,
      image_url: formData.image_url,
      duration: formData.duration,
      published: formData.published,
      author_id: user?.id,
    };

    if (editingId) {
      const { error } = await supabase
        .from("podcasts")
        .update(podcastData)
        .eq("id", editingId);

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Podcast mis à jour",
      });
    } else {
      const newPodcastData = {
        ...podcastData,
        published: false,
      };
      
      const { error } = await supabase.from("podcasts").insert([newPodcastData]);

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Podcast créé (en attente de validation)",
      });
    }

    resetForm();
    fetchPodcasts();
  };

  const handleEdit = (podcast: Podcast) => {
    setFormData({
      title: podcast.title,
      slug: podcast.slug,
      description: podcast.description,
      audio_url: podcast.audio_url || "",
      video_url: podcast.video_url || "",
      media_type: podcast.media_type || "audio",
      image_url: podcast.image_url || "",
      duration: podcast.duration || 0,
      published: podcast.published,
    });
    setEditingId(podcast.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce podcast ?")) return;

    const { error } = await supabase.from("podcasts").delete().eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Podcast supprimé",
      });
      fetchPodcasts();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      description: "",
      audio_url: "",
      video_url: "",
      media_type: "audio",
      image_url: "",
      duration: 0,
      published: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-serif font-bold text-foreground">Podcasts</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau podcast
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h2 className="text-2xl font-serif font-bold mb-4">
            {editingId ? "Modifier le podcast" : "Nouveau podcast"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (!editingId) {
                    const slug = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "");
                    setFormData((prev) => ({ ...prev, slug }));
                  }
                }}
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                required
              />
            </div>

            {/* Media Type Selection */}
            <div className="space-y-3">
              <Label>Type de média</Label>
              <RadioGroup
                value={formData.media_type}
                onValueChange={(value: "audio" | "video") => 
                  setFormData({ ...formData, media_type: value, audio_url: "", video_url: "" })
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="audio" id="audio" />
                  <Label htmlFor="audio" className="flex items-center gap-2 cursor-pointer">
                    <Music className="h-4 w-4" />
                    Audio
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="video" id="video" />
                  <Label htmlFor="video" className="flex items-center gap-2 cursor-pointer">
                    <Video className="h-4 w-4" />
                    Vidéo
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Media Upload */}
            <div>
              <Label htmlFor="media_upload">
                Fichier {formData.media_type === "video" ? "vidéo" : "audio"}
              </Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="media_upload"
                    type="file"
                    accept={formData.media_type === "video" ? "video/*" : "audio/*"}
                    onChange={handleMediaUpload}
                    disabled={uploadingMedia}
                    className="flex-1"
                  />
                  {uploadingMedia && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                
                {formData.media_type === "audio" && formData.audio_url && (
                  <audio controls className="w-full">
                    <source src={formData.audio_url} type="audio/mpeg" />
                  </audio>
                )}
                
                {formData.media_type === "video" && formData.video_url && (
                  <video controls className="w-full max-h-64 rounded-md">
                    <source src={formData.video_url} type="video/mp4" />
                  </video>
                )}
                
                <Input
                  placeholder={`Ou entrez une URL ${formData.media_type === "video" ? "vidéo" : "audio"}`}
                  value={formData.media_type === "video" ? formData.video_url : formData.audio_url}
                  onChange={(e) =>
                    formData.media_type === "video"
                      ? setFormData({ ...formData, video_url: e.target.value })
                      : setFormData({ ...formData, audio_url: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="image_upload">Image du podcast (miniature)</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="image_upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="flex-1"
                  />
                  {uploadingImage && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                {formData.image_url && (
                  <div className="relative w-full h-48 border rounded-md overflow-hidden">
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <Input
                  placeholder="Ou entrez une URL d'image"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duration">Durée (en secondes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) =>
                  setFormData({ ...formData, published: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="published">Publier le podcast</Label>
            </div>

            <div className="flex space-x-2">
              <Button type="submit">
                {editingId ? "Mettre à jour" : "Créer"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {podcasts.map((podcast) => (
          <Card key={podcast.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {podcast.media_type === "video" ? (
                    <Video className="h-4 w-4 text-highlight" />
                  ) : (
                    <Music className="h-4 w-4 text-water" />
                  )}
                  <h3 className="text-xl font-serif font-bold">
                    {podcast.title}
                  </h3>
                  {podcast.published ? (
                    <Eye className="h-4 w-4 text-secondary" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {new Date(podcast.created_at).toLocaleDateString()}
                  {podcast.duration > 0 && ` • ${Math.floor(podcast.duration / 60)} min`}
                  {` • ${podcast.media_type === "video" ? "Vidéo" : "Audio"}`}
                </p>
                <p className="text-muted-foreground">{podcast.description}</p>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(podcast)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(podcast.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPodcasts;
