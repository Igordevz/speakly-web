import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileAudio } from "lucide-react";

interface MediaActionsCardProps {
  downloadTranscription: () => void;
  handleProcessMedia: () => Promise<void>;
  isProcessing: boolean;
}

export default function MediaActionsCard({
  downloadTranscription,
  handleProcessMedia,
  isProcessing,
}: MediaActionsCardProps) {
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
          onClick={handleProcessMedia}
          disabled={isProcessing}
        >
          <FileAudio className="h-4 w-4 mr-2" />
          {isProcessing ? 'Reprocessando...' : 'Reprocessar Mídia'}
        </Button>
      </CardContent>
    </Card>
  );
}