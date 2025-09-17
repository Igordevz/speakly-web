import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface AudioUploadProps {
  handleUpload: (file: File) => Promise<void>;
}

export default function AudioUpload({ handleUpload }: AudioUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        try {
          const schema = z.object({
            file: z
              .instanceof(File)
              .refine((f) => f.type.startsWith("audio/"), "Precisa ser áudio")
              .refine((f) => f.size <= 50 * 1024 * 1024, "Máx. 50MB"),
          });
          schema.parse({ file });
          handleUpload(file);
        } catch (err) {
          toast.error("Invalid file type or size.");
          console.error("Validação falhou:", err);
        }
      });
    },
    [handleUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "audio/*": [".mp3", ".wav", ".m4a", ".ogg"] },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload de Áudio</CardTitle>
        <CardDescription>
          Faça upload dos seus arquivos de áudio para transcrição
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          {isDragActive ? (
            <p className="text-lg">Solte os arquivos aqui...</p>
          ) : (
            <>
              <p className="text-lg mb-2">Arraste arquivos de áudio aqui</p>
              <p className="text-sm text-muted-foreground mb-4">
                ou clique para selecionar
              </p>
              <Button>Selecionar Arquivos</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}