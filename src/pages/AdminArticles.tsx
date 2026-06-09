import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { RichTextEditor } from "@/components/RichTextEditor";
import { DocumentImport } from "@/components/DocumentImport";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  rubrique: string;
  image_url: string;
  published: boolean;
  created_at: string;
  source_document_url?: string | null;
}

const rubriques = [
  "Espèces à la loupe",
  "Comprendre l'environnement",
  "Acteurs du vivant",
  "Traditions & Nature",
  "Initiatives locales",
  "Jeunesse & Pédagogie",
  "Ressources",
];

const AdminArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    rubrique: "",
    image_url: "",
    published: false,
    source_document_url: "",
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les articles",
        variant: "destructive",
      });
    } else {
      setArticles(data || []);
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

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
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
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const articleData = {
      ...formData,
      author_id: user?.id,
    };

    if (editingId) {
      const { error } = await supabase
        .from("articles")
        .update(articleData)
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
        description: "Article mis à jour",
      });
    } else {
      // Les éditeurs créent en mode brouillon (published: false)
      const newArticleData = {
        ...articleData,
        published: false,
      };
      
      const { error } = await supabase.from("articles").insert([newArticleData]);

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
        description: "Article créé (en attente de validation)",
      });
    }

    resetForm();
    fetchArticles();
  };

  const handleEdit = (article: Article) => {
    setFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      rubrique: article.rubrique,
      image_url: article.image_url,
      published: article.published,
      source_document_url: article.source_document_url || "",
    });
    setEditingId(article.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;

    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Article supprimé",
      });
      fetchArticles();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      rubrique: "",
      image_url: "",
      published: false,
      source_document_url: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-serif font-bold text-foreground">Articles</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel article
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h2 className="text-2xl font-serif font-bold mb-4">
            {editingId ? "Modifier l'article" : "Nouvel article"}
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
              <Label htmlFor="rubrique">Rubrique</Label>
              <Select
                value={formData.rubrique}
                onValueChange={(value) =>
                  setFormData({ ...formData, rubrique: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une rubrique" />
                </SelectTrigger>
                <SelectContent>
                  {rubriques.map((rubrique) => (
                    <SelectItem key={rubrique} value={rubrique}>
                      {rubrique}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="excerpt">Extrait</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                rows={2}
              />
            </div>

            <div>
              <Label>Contenu</Label>
              <div className="space-y-3">
                {/* Document import with preview */}
                <DocumentImport 
                  onImport={({ content, sourceUrl }) =>
                    setFormData((prev) => ({
                      ...prev,
                      content,
                      source_document_url: sourceUrl ?? prev.source_document_url,
                    }))
                  }
                />
                
                {/* Rich text editor */}
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="image_upload">Image de l'article</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="image_upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="flex-1"
                  />
                  {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
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
              <Label htmlFor="published">Publier l'article</Label>
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
        {articles.map((article) => (
          <Card key={article.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-serif font-bold">
                    {article.title}
                  </h3>
                  {article.published ? (
                    <Eye className="h-4 w-4 text-secondary" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {article.rubrique} • {new Date(article.created_at).toLocaleDateString()}
                </p>
                <p className="text-muted-foreground">{article.excerpt}</p>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(article)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(article.id)}
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

export default AdminArticles;
