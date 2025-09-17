import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileAudio } from "lucide-react";

interface AudioActionsCardProps {
  downloadTranscription: () => void;
  handleProcessAudio: () => Promise<void>;
  isProcessing: boolean;
}

export default function AudioActionsCard({
  downloadTranscription,
  handleProcessAudio,
  isProcessing,
}: AudioActionsCardProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start bg-transparent"
          onClick={downloadTranscription}
        >
          <Download className="h-4 w-4 mr-2" />
          Baixar Transcrição
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start bg-transparent"
          onClick={handleProcessAudio}
          disabled={isProcessing}
        >
          <FileAudio className="h-4 w-4 mr-2" />
          {isProcessing ? 'Reprocessando...' : 'Reprocessar Áudio'}
        </Button>
      </CardContent>
    </Card>
  );
}