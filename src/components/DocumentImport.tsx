import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { FileUp, FileText, Check, X, Loader2, Eye } from "lucide-react";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface ImportPayload {
  content: string;
  sourceUrl?: string;
}

interface DocumentImportProps {
  /** Reçoit le HTML extrait + l'URL publique du fichier source (.pdf/.docx). */
  onImport: (payload: ImportPayload) => void;
}

interface ProgressInfo {
  currentPage: number;
  totalPages: number;
  estimatedTimeRemaining: number;
}

export const DocumentImport = ({ onImport }: DocumentImportProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  const extractTextFromDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return result.value;
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const MAX_PAGES = 10;
      let fullContent = "";

      const totalPages = pdf.numPages;
      const pagesToProcess = Math.min(totalPages, MAX_PAGES);
      
      const startTime = Date.now();

      for (let i = 1; i <= pagesToProcess; i++) {
        const pageStartTime = Date.now();
        
        // Update progress
        const elapsedTime = Date.now() - startTime;
        const avgTimePerPage = i > 1 ? elapsedTime / (i - 1) : 2000;
        const remainingPages = pagesToProcess - i + 1;
        const estimatedTimeRemaining = Math.round((avgTimePerPage * remainingPages) / 1000);
        
        setProgress({
          currentPage: i,
          totalPages: pagesToProcess,
          estimatedTimeRemaining,
        });

        const page = await pdf.getPage(i);

        // Extract text
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");

        if (pageText.trim()) {
          fullContent += `<p>${pageText}</p>\n`;
        }

        // Render page as image to capture all visual content including images
        const scale = 1.0;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page
            .render({
              canvasContext: context,
              viewport,
              canvas,
            })
            .promise;

          // Convert canvas to base64 image
          const imageData = canvas.toDataURL("image/jpeg", 0.7);
          fullContent += `<img src="${imageData}" alt="Page ${i}" style="max-width: 100%; height: auto; margin: 1rem 0;" />\n`;
        }
      }

      setProgress(null);

      if (totalPages > MAX_PAGES) {
        fullContent = `<p><em>Ce document contient ${totalPages} pages. Seules les ${MAX_PAGES} premières ont été importées pour des raisons de performance.</em></p>\n` + fullContent;
      }

      if (!fullContent.trim()) {
        throw new Error("Aucun contenu lisible trouvé dans ce PDF.");
      }

      return fullContent;
    } catch (error) {
      setProgress(null);
      console.error("PDF extraction error:", error);
      throw new Error("Impossible de lire le fichier PDF");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);
    setShowPreview(false);
    setSourceUrl(undefined);

    try {
      let content = "";
      const fileName = selectedFile.name.toLowerCase();

      if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
        content = await extractTextFromDocx(selectedFile);
      } else if (fileName.endsWith(".pdf")) {
        content = await extractTextFromPdf(selectedFile);
      } else {
        throw new Error("Format de fichier non supporté");
      }

      setPreview(content);
      setShowPreview(true);

      // Upload du fichier source dans le bucket public d'articles (préfixe documents/)
      try {
        const ext = selectedFile.name.split(".").pop();
        const path = `documents/${Date.now()}-${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("article-images")
          .upload(path, selectedFile, {
            upsert: false,
            contentType: selectedFile.type || "application/octet-stream",
          });
        if (!upErr) {
          const { data } = supabase.storage.from("article-images").getPublicUrl(path);
          setSourceUrl(data.publicUrl);
        }
      } catch (upErr) {
        console.warn("Source document upload failed", upErr);
      }

      toast({
        title: "Document analysé",
        description: "Prévisualisez le contenu avant de l'importer.",
      });
    } catch (error: any) {
      console.error("Error extracting text:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'analyser le document",
        variant: "destructive",
      });
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (preview) {
      onImport({ content: preview, sourceUrl });
      toast({
        title: "Contenu importé",
        description: "Le contenu a été ajouté à l'éditeur.",
      });
      resetState();
    }
  };

  const resetState = () => {
    setFile(null);
    setPreview("");
    setShowPreview(false);
    setProgress(null);
    setSourceUrl(undefined);
  };

  return (
    <div className="space-y-4">
      {/* File upload zone */}
      <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
        <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Importer un document Word ou PDF
        </p>
        <Input
          type="file"
          accept=".doc,.docx,.pdf"
          onChange={handleFileSelect}
          className="max-w-xs mx-auto"
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground mt-2">
          <FileText className="h-3 w-3 inline mr-1" />
          Formats supportés: .doc, .docx, .pdf
        </p>
      </div>

      {/* Loading state with progress */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-2 py-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm text-muted-foreground">
              {progress 
                ? `Analyse de la page ${progress.currentPage}/${progress.totalPages}...`
                : "Chargement du document..."
              }
            </span>
          </div>
          {progress && (
            <div className="w-full max-w-xs space-y-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(progress.currentPage / progress.totalPages) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {progress.estimatedTimeRemaining > 0 
                  ? `Temps restant estimé: ~${progress.estimatedTimeRemaining}s`
                  : "Presque terminé..."
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Preview section */}
      {showPreview && preview && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Prévisualisation: {file?.name}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetState}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-64 border rounded-md p-4 bg-muted/20">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: preview }}
              />
            </ScrollArea>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetState}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={handleConfirmImport}>
                <Check className="h-4 w-4 mr-2" />
                Importer ce contenu
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
