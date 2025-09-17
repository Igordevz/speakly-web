import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileAudio, ArrowLeft } from "lucide-react";

export default function AudioDetailNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
          <FileAudio className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Áudio não encontrado</h2>
          <p className="text-muted-foreground text-lg">O áudio solicitado não foi encontrado ou não existe.</p>
        </div>
        <Button onClick={() => router.push("/")} size="lg" className="mt-6 cursor-pointer">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  );
}