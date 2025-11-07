import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface MediaUploadProps {
  handleUpload: (file: File) => Promise<void>;
}

export default function MediaUpload({ handleUpload }: MediaUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        try {
          const schema = z.object({
            file: z
              .instanceof(File)
              .refine(
                (f) => f.type.startsWith("audio/") || f.type.startsWith("video/"),
                "Precisa ser áudio ou vídeo"
              )
              .refine((f) => f.size <= 200 * 1024 * 1024, "Máx. 200MB"),
          });
          schema.parse({ file });
          handleUpload(file);
        } catch (err) {
          toast.error("Tipo de arquivo inválido ou tamanho excedido (máx. 200MB).");
          console.error("Validação falhou:", err);
        }
      });
    },
    [handleUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".ogg"],
      "video/*": [".mp4", ".webm", ".mov", ".avi", ".mkv"],
    },
  });

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground text-xl">Upload de Mídia</CardTitle>
        <CardDescription>
          Faça upload dos seus arquivos de áudio ou vídeo para transcrição automática
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? "border-primary bg-primary/5 scale-[1.02] shadow-lg shadow-primary/10"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full transition-colors ${
              isDragActive ? "bg-primary/10" : "bg-muted/50"
            }`}>
              <Upload className={`h-8 w-8 sm:h-10 sm:w-10 transition-colors ${
                isDragActive ? "text-primary" : "text-muted-foreground"
              }`} />
            </div>
            {isDragActive ? (
              <div className="space-y-2">
                <p className="text-lg font-medium text-primary">Solte os arquivos aqui</p>
                <p className="text-sm text-muted-foreground">Arquivos serão enviados automaticamente</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-base sm:text-lg font-medium text-foreground mb-1">
                    Arraste arquivos de áudio ou vídeo aqui
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ou clique para selecionar
                  </p>
                </div>
                <Button variant="outline" className="mt-2">
                  Selecionar Arquivos
                </Button>
                <p className="text-xs text-muted-foreground pt-2">
                  Áudio: MP3, WAV, M4A, OGG • Vídeo: MP4, WEBM, MOV, AVI, MKV • Máx. 200MB
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}