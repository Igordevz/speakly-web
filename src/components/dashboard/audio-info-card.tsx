import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FileAudio } from "lucide-react";

interface AudioInfoCardProps {
  filename: string;
  duration: string;
  fileSize: string;
  uploadDate: string;
}

export default function AudioInfoCard({ filename, duration, fileSize, uploadDate }: AudioInfoCardProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileAudio className="h-5 w-5 mr-2 text-primary" />
          Informações do Arquivo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileAudio className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{filename}</p>
              <p className="text-xs text-muted-foreground">Arquivo de áudio</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Duração:</span>
            <Badge variant="outline">{duration}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Tamanho:</span>
            <Badge variant="outline">{fileSize}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Upload:</span>
            <Badge variant="outline">{uploadDate}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}