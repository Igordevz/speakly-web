import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, CheckCircle } from "lucide-react";

interface MediaTranscriptionCardProps {
  transcription: string;
  filename: string;
  mediaUrl?: string;
  mediaDuration?: number;
  isPlaying?: boolean;
  currentTime?: number;
}

export default function MediaTranscriptionCard({
  transcription,
  filename,
  mediaUrl,
  mediaDuration,
  isPlaying = false,
  currentTime = 0,
}: MediaTranscriptionCardProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [words, setWords] = useState<
    Array<{ word: string; startTime: number; endTime: number }>
  >([]);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);
  const transcriptionRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  const downloadTranscription = () => {
    const element = document.createElement("a");
    const file = new Blob([transcription], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `transcricao-${filename.replace(/\.[^/.]+$/, "")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Parse transcription into words with estimated timings
  useEffect(() => {
    if (!transcription) return;

    const wordArray = transcription.split(/\s+/).filter((w) => w.length > 0);

    if (wordArray.length === 0) return;

    const duration = mediaDuration || 0;
    const totalWords = wordArray.length;
    const timePerWord = duration > 0 ? duration / totalWords : 0;

    const wordsWithTiming = wordArray.map((word, index) => ({
      word: word,
      startTime: index * timePerWord,
      endTime: (index + 1) * timePerWord,
    }));

    setWords(wordsWithTiming);
  }, [transcription, mediaDuration]);

  // Update highlighted word based on current time
  useEffect(() => {
    if (!isPlaying || words.length === 0) {
      setHighlightedWordIndex(-1);
      return;
    }

    const currentWordIndex = words.findIndex(
      (w) => currentTime >= w.startTime && currentTime < w.endTime,
    );

    if (currentWordIndex !== -1 && currentWordIndex !== highlightedWordIndex) {
      setHighlightedWordIndex(currentWordIndex);

      // Scroll to highlighted word
      if (transcriptionRef.current) {
        const wordElement = transcriptionRef.current.querySelector(
          `[data-word-index="${currentWordIndex}"]`,
        );
        if (wordElement) {
          wordElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    }
  }, [currentTime, isPlaying, words, highlightedWordIndex]);

  return (
    <Card className="border-border/50 shadow-sm flex flex-col flex-1">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Transcrição Completa</CardTitle>
            <CardDescription>Texto completo extraído da mídia</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(transcription)}
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? "Copiado!" : "Copiar"}
            </Button>
            <Button variant="outline" size="sm" onClick={downloadTranscription}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="bg-muted/30 rounded-lg p-6 h-full overflow-y-auto">
          {words.length > 0 && mediaUrl ? (
            <div
              ref={transcriptionRef}
              className="text-sm leading-relaxed text-foreground"
            >
              {words.map((wordData, index) => {
                const isHighlighted = index === highlightedWordIndex;
                const isPast = index < highlightedWordIndex;

                return (
                  <span
                    key={index}
                    data-word-index={index}
                    className={`inline-block transition-all duration-200 mr-1 ${
                      isHighlighted
                        ? "bg-primary/30 text-primary font-bold px-2 py-1 rounded-md scale-110 shadow-lg shadow-primary/20 z-10 relative"
                        : isPast
                          ? "text-muted-foreground/50"
                          : "text-foreground"
                    }`}
                  >
                    {wordData.word}
                  </span>
                );
              })}
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
              {transcription}
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
