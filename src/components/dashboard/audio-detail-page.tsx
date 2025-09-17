"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { instance } from "@/lib/axios";
import AudioDetailLoadingState from "./audio-detail-loading-state";
import AudioDetailNotFound from "./audio-detail-not-found";
import AudioDetailProcessingPrompt from "./audio-detail-processing-prompt";
import AudioDetailHeader from "./audio-detail-header";
import AudioSummaryCard from "./audio-summary-card";
import AudioChatAssistant from "./audio-chat-assistant";
import AudioTranscriptionCard from "./audio-transcription-card";
import AudioInfoCard from "./audio-info-card";
import AudioActionsCard from "./audio-actions-card";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface ApiAudio {
  id: string;
  name: string;
  duration: string | null;
  createdAt: string;
  file_size: number;
  text_brute: string | null;
  resume: string | null;
}

interface AudioData {
  id: string;
  filename: string;
  duration: string;
  uploadDate: string;
  fileSize: string;
  status: "completed" | "processing" | "error";
  transcription: string;
  summary: string;
}

interface AudioDetailProps {
  audioId: string;
}

export default function AudioDetailPage({ audioId }: AudioDetailProps) {
  const router = useRouter();
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState(320); // Initial width for w-80
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    setIsResizing(true);
    mouseDownEvent.preventDefault();
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing && sidebarRef.current) {
        const newWidth = window.innerWidth - mouseMoveEvent.clientX;
        // Limit resizing to a reasonable range, e.g., min 200px, max 800px
        setSidebarWidth(Math.max(200, Math.min(800, newWidth)));
      }
    },
    [isResizing]
  );

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // Tailwind's 'lg' breakpoint
    };

    checkScreenSize(); // Check on mount
    window.addEventListener('resize', checkScreenSize); // Check on resize

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  async function handleProcessAudio() {
    try {
      setIsProcessing(true);

      const response = await instance.get(`/audio/process-uploaded/${audioId}`);

      const { audio } = response.data;

      setAudioData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          transcription: audio.text_brute,
          summary: audio.resume,
        };
      });

      toast.success("Audio processed successfully!");
      setIsProcessed(true);
    } catch {
      toast.error("Error processing audio.");
    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    const fetchAudioData = async () => {
      setLoading(true);
      try {
        const response = await instance.get("/user");
        const user = response.data.user;
        if (user && user.Audio) {
          const audio = user.Audio.find((a: ApiAudio) => a.id === audioId);
          if (audio) {
            setAudioData({
              id: audio.id,
              filename: audio.name,
              duration: audio.duration || "N/A",
              uploadDate: new Date(audio.createdAt).toLocaleDateString(),
              fileSize: audio.file_size
                ? `${(audio.file_size / 1024 / 1024).toFixed(2)} MB`
                : "N/A",
              status: "completed",
              transcription: audio.text_brute || "",
              summary: audio.resume || "",
            });
            setIsProcessed(!!audio.text_brute && !!audio.resume);
          }
        }
      } catch (error) {
        console.error("Failed to fetch audio data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioData();
  }, [audioId]);
  return (
    <>
      {loading && <AudioDetailLoadingState />}

      {!loading && !audioData && <AudioDetailNotFound />}

      {!loading && audioData && !isProcessed && (
        <AudioDetailProcessingPrompt
          handleProcessAudio={handleProcessAudio}
          isProcessing={isProcessing}
        />
      )}

      {!loading && audioData && isProcessed && (
        <div className="min-h-screen bg-background ">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <AudioDetailHeader
              filename={audioData.filename}
              uploadDate={audioData.uploadDate}
            />

            <div className="flex flex-col lg:flex-row">
              <div className="flex-1" style={isLargeScreen ? { marginRight: sidebarWidth + 'px' } : {}}>
                <div className="grid gap-8 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-8">
                    <AudioSummaryCard summary={audioData.summary} />
                    <AudioTranscriptionCard
                      transcription={audioData.transcription}
                      filename={audioData.filename}
                    />
                  </div>

                  <div className="space-y-6">
                    <AudioInfoCard
                      filename={audioData.filename}
                      duration={audioData.duration}
                      fileSize={audioData.fileSize}
                      uploadDate={audioData.uploadDate}
                    />
                    <AudioActionsCard
                      downloadTranscription={() => {
                        const element = document.createElement("a");
                        const file = new Blob([audioData.transcription], {
                          type: "text/plain",
                        });
                        element.href = URL.createObjectURL(file);
                        element.download = `transcricao-${audioData.filename.replace(
                          /\.[^/.]+$/, ""
                        )}.txt`;
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}
                      handleProcessAudio={handleProcessAudio}
                      isProcessing={isProcessing}
                    />
                  </div>
                </div>
              </div>

              {/* Fixed sidebar for large screens */}
              <div
                ref={sidebarRef}
                className="hidden lg:flex lg:fixed lg:right-0 lg:top-16 lg:bottom-0 lg:bg-card lg:border-l lg:border-border/50 lg:p-4 lg:shadow-lg lg:z-50 flex-col"
                style={{ width: sidebarWidth + 'px' }}
              >
                <div
                  className="absolute left-0 top-0 h-full w-2 cursor-ew-resize z-50"
                  onMouseDown={startResizing}
                ></div>
                <AudioChatAssistant audioData={audioData} />
              </div>

              {/* Mobile menu button and Sheet for small screens */}
              <div className="lg:hidden fixed bottom-4 right-4 z-50">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button size="icon" className="rounded-full shadow-lg">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-md flex flex-col h-full max-h-screen">
                    <SheetHeader>
                      <SheetTitle>Assistente de Áudio com IA</SheetTitle>
                      <SheetDescription>
                        Faça perguntas sobre o conteúdo do áudio.
                      </SheetDescription>
                    </SheetHeader>
                    <AudioChatAssistant audioData={audioData} />
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
