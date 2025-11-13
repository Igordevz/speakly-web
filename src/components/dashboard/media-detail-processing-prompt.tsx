import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <FileAudio className="mx-auto h-12 w-12 text-primary mb-4" />
          <DialogTitle className="text-2xl font-bold">Mídia ainda não foi processada</DialogTitle>
          <DialogDescription>Esta mídia ainda não foi processada. Clique no botão abaixo para iniciar o processamento.</DialogDescription>
        </DialogHeader>
        <div className="text-center">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}