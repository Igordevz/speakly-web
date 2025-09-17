import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileAudio, Play, Trash2 } from "lucide-react";

interface AudioFile {
  id: string;
  name: string;
  size: number;
  uploadProgress: number;
  isUploading: boolean;
  transcribed: boolean;
  uploadedAt?: Date;
  error?: boolean;
}

interface AudioCardProps {
  file: AudioFile;
  removeFile: (id: string) => void;
  formatFileSize: (bytes: number) => string;
}

export default function AudioCard({ file, removeFile, formatFileSize }: AudioCardProps) {
  return (
    <div
      key={file.id}
      className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 border rounded-lg"
    >
      <FileAudio className="h-8 w-8 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium break-words">{file.name}</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mt-1">
          <span>{formatFileSize(file.size)}</span>
          {file.uploadedAt && (
            <span>
              {file.transcribed
                ? `Transcrito em ${file.uploadedAt.toLocaleDateString()}`
                : `Enviado em ${file.uploadedAt.toLocaleDateString()}`}
            </span>
          )}
        </div>
        {file.isUploading && (
          <div className="mt-2">
            <Progress value={file.uploadProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {file.uploadProgress}% enviado
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-4 sm:mt-0 flex-shrink-0">
        <Link href={`/audio/${file.id}`} className="w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer w-full"
          >
            <Play className="h-4 w-4 mr-2 " />
            Ver Transcrição
          </Button>
        </Link>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => removeFile(file.id)}
          className="w-full sm:w-auto"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}