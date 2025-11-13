"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { instance } from "@/lib/axios";

import MediaDetailLoadingState from "./media-detail-loading-state";
import MediaDetailNotFound from "./media-detail-not-found";
import MediaDetailProcessingPrompt from "./media-detail-processing-prompt";
import MediaDetailHeader from "./media-detail-header";
import MediaSummaryCard from "./media-summary-card";
import MediaChatAssistant from "./media-chat-assistant";
import MediaTranscriptionCard from "./media-transcription-card";
import MediaInfoCard from "./media-info-card";
import MediaActionsCard from "./media-actions-card";
import ModernMediaPlayer from "./modern-media-player"; // Import the new player

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

interface ApiMedia {
  id: string;
  name: string;
  duration: string | null;
  createdAt: string;
  file_size: number;
  text_brute: string | null;
  resume: string | null;
  reference?: string;
}

interface MediaData {
  id: string;
  filename: string;
  duration: string;
  uploadDate: string;
  fileSize: string;
  status: "completed" | "processing" | "error";
  transcription: string;
  summary: string;
  audioUrl?: string;
  audioDurationSeconds?: number;
  fileType?: "audio" | "video";
}

interface MediaDetailProps {
  mediaId: string;
}

export default function MediaDetailPage({ mediaId }: MediaDetailProps) {
  const [mediaData, setMediaData] = useState<MediaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // State for transcription card interaction
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Sidebar Resize
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      setSidebarWidth(Math.max(240, Math.min(900, newWidth)));
    },
    [isResizing],
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // Screen size check
  useEffect(() => {
    const update = () => setIsLargeScreen(window.innerWidth >= 1024);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchMediaData = async () => {
      try {
        const response = await instance.get("/user");
        const user = response.data.user;
        const media = user.Media.find((m: ApiMedia) => m.id === mediaId);

        if (!media) return setMediaData(null);

        const base = process.env.NEXT_PUBLIC_R2;
        const mediaUrl = media.reference
          ? `${base}${encodeURI(media.reference.replace(/ /g, "%20"))}`
          : undefined;

        const fileType = /\.(mp4|mov|webm|avi|mkv)$/i.test(media.name)
          ? "video"
          : "audio";

        setMediaData({
          id: media.id,
          filename: media.name,
          duration: media.duration || "N/A",
          uploadDate: new Date(media.createdAt).toLocaleDateString(),
          fileSize: media.file_size
            ? `${(media.file_size / 1024 / 1024).toFixed(2)} MB`
            : "N/A",
          status: "completed",
          transcription: media.text_brute || "",
          summary: media.resume || "",
          audioUrl: mediaUrl,
          fileType,
        });

        setIsProcessed(!!media.text_brute && !!media.resume);
      } finally {
        setLoading(false);
      }
    };

    fetchMediaData();
  }, [mediaId]);

  async function handleProcessMedia() {
    try {
      setIsProcessing(true);
      const res = await instance.get(`/media/process-uploaded/${mediaId}`);
      const media = res.data.media;

      setMediaData(
        (prev) =>
          prev && {
            ...prev,
            transcription: media.text_brute,
            summary: media.resume,
          },
      );
      toast.success("Processado com sucesso!");
      setIsProcessed(true);
    } catch {
      toast.error("Erro ao processar.");
    } finally {
      setIsProcessing(false);
    }
  }

  // UI states
  if (loading) return <MediaDetailLoadingState />;
  if (!mediaData) return <MediaDetailNotFound />;
  if (!isProcessed)
    return (
      <MediaDetailProcessingPrompt
        isProcessing={isProcessing}
        handleProcessMedia={handleProcessMedia}
      />
    );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-10 max-w-[1920px]">
        <MediaDetailHeader
          filename={mediaData.filename}
          uploadDate={mediaData.uploadDate}
        />

        <div className="flex flex-col lg:flex-row gap-10">
          {/* MAIN CONTENT */}
          <div
            className="flex-1 min-w-0"
            style={isLargeScreen ? { marginRight: sidebarWidth } : {}}
          >
            <div className="grid gap-8 lg:grid-cols-5">
              {/* Left */}
              <div className="lg:col-span-3 flex flex-col space-y-6">
                {/* Modern Player */}
                {mediaData.audioUrl && mediaData.fileType && (
                  <ModernMediaPlayer
                    src={mediaData.audioUrl}
                    type={mediaData.fileType}
                    onTimeUpdate={setCurrentTime}
                    onPlayStateChange={setIsPlaying}
                  />
                )}

                <MediaSummaryCard summary={mediaData.summary} />

                <MediaTranscriptionCard
                  transcription={mediaData.transcription}
                  filename={mediaData.filename}
                  mediaUrl={mediaData.audioUrl}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                />
              </div>

              {/* Right */}
              <div className="lg:col-span-2 space-y-6">
                <MediaInfoCard {...mediaData} />
                <MediaActionsCard
                  downloadTranscription={() => {
                    const file = new Blob([mediaData.transcription], {
                      type: "text/plain",
                    });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(file);
                    link.download = `transcricao-${mediaData.filename}.txt`;
                    link.click();
                  }}
                  handleProcessMedia={handleProcessMedia}
                  isProcessing={isProcessing}
                />
              </div>
            </div>
          </div>

          {/* SIDEBAR (Desktop) */}
          {isLargeScreen && (
            <div
              ref={sidebarRef}
              className="fixed top-0 right-0 bottom-0 border-l bg-background/90 backdrop-blur-xl shadow-xl"
              style={{ width: sidebarWidth }}
            >
              <div
                className="absolute left-0 w-1 h-full cursor-ew-resize"
                onMouseDown={startResizing}
              />
              <MediaChatAssistant
                mediaData={mediaData}
                mediaUrl={mediaData.audioUrl}
              />
            </div>
          )}
        </div>

        {/* MOBILE ASSISTANT */}
        <div className="lg:hidden fixed bottom-6 right-6">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="icon" className="h-14 w-14 rounded-full shadow-xl">
                <Bot />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="max-w-md">
              <SheetHeader>
                <SheetTitle>Assistente IA</SheetTitle>
                <SheetDescription>
                  Pergunte sobre o conteúdo da mídia
                </SheetDescription>
              </SheetHeader>
              <div className="p-4">
                <MediaChatAssistant
                  mediaData={mediaData}
                  mediaUrl={mediaData.audioUrl}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
