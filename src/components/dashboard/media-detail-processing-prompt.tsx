import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileAudio, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface MediaDetailProcessingPromptProps {
  handleProcessMedia: () => Promise<void>;
  isProcessing: boolean;
}

export default function MediaDetailProcessingPrompt({
  handleProcessMedia,
  isProcessing,
}: MediaDetailProcessingPromptProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <FileAudio className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl font-bold">Mídia ainda não foi processada</CardTitle>
          <CardDescription>Esta mídia ainda não foi processada. Clique no botão abaixo para iniciar o processamento.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            onClick={handleProcessMedia}
            disabled={isProcessing}
            className="w-full cursor-pointer"
          >
            {isProcessing ? 'Processando...' : 'Processar Mídia'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="w-full mt-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}