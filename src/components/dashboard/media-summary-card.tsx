import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Copy, CheckCircle } from "lucide-react";

interface MediaSummaryCardProps {
  summary: string;
}

export default function MediaSummaryCard({ summary }: MediaSummaryCardProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  return (
    <Card className="border-border/50 shadow-sm w-full flex flex-col flex-1">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Resumo Inteligente</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(summary)}
          >
            {copied ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copied ? "Copiado!" : "Copiar"}
          </Button>
        </div>
        <CardDescription>Principais pontos extraídos pela IA</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="bg-muted/30 rounded-lg p-6 h-full">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground h-full">
            {summary}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
