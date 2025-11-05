"use client";

import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import axios from "axios";
import { instance as api } from "@/lib/axios";
import { contextApi } from "@/context/auth";
import { toast } from "sonner";
import AudioList from "./audio-list";
import AudioUpload from "./audio-upload";

interface AudioFile {
  id: string;
  name: string;
  size: number;
  uploadProgress: number;
  isUploading: boolean;
  transcribed: boolean;
  uploadedAt?: Date;
  error?: boolean;
}

interface ApiAudioFile {
  id: string;
  name: string;
  file_size: number;
  text_brute: string;
  resume: string;
  createdAt: string | number | Date;
}

export default function AudioDashboard() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");
  const { user } = useContext(contextApi);

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isYesterday = (date: Date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  };

  const isWithinLastDays = (date: Date, days: number) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  };

  const isThisMonth = (date: Date) => {
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    );
  };

  const isLastMonth = (date: Date) => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return (
      date.getMonth() === lastMonth.getMonth() &&
      date.getFullYear() === lastMonth.getFullYear()
    );
  };

  const filteredAudioFiles = useMemo(() => {
    let filtered = audioFiles;

    if (searchTerm) {
      filtered = filtered.filter((file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filter !== "all") {
      filtered = filtered.filter((file) => {
        if (!file.uploadedAt) return false;

        switch (filter) {
          case "today":
            return isToday(file.uploadedAt);
          case "yesterday":
            return isYesterday(file.uploadedAt);
          case "last7days":
            return isWithinLastDays(file.uploadedAt, 7);
          case "last30days":
            return isWithinLastDays(file.uploadedAt, 30);
          case "thisMonth":
            return isThisMonth(file.uploadedAt);
          case "lastMonth":
            return isLastMonth(file.uploadedAt);
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [audioFiles, searchTerm, filter]);

  useEffect(() => {
    if (user?.Audio && Array.isArray(user.Audio)) {
      const parsedFiles: AudioFile[] = user.Audio.map((file) => ({
        id: (file as unknown as ApiAudioFile).id,
        name: (file as unknown as ApiAudioFile).name ?? "sem_nome",
        size: (file as unknown as ApiAudioFile).file_size ?? 0,
        uploadProgress: 100,
        isUploading: false,
        transcribed:
          Boolean((file as unknown as ApiAudioFile).text_brute) ||
          Boolean((file as unknown as ApiAudioFile).resume),
        uploadedAt: (file as unknown as ApiAudioFile).createdAt
          ? new Date((file as unknown as ApiAudioFile).createdAt)
          : undefined,
      }));
      setAudioFiles(parsedFiles);
    }
  }, [user]);

  // 🔹 Upload de novo arquivo
  const handleUpload = useCallback(async (file: File) => {
    const tempId = Math.random().toString(36).substring(2, 9);
    const newFile: AudioFile = {
      id: tempId,
      name: file.name,
      size: file.size,
      uploadProgress: 0,
      isUploading: true,
      transcribed: false,
    };

    setAudioFiles((prev) => [newFile, ...prev]);

    try {
      const response = await api.post("/audio/upload-url", {
        name: file.name,
        contentType: file.type,
        fileSize: String(file.size),
      });

      const { uploadUrl, audioId } = response.data;

      setAudioFiles((prev) =>
        prev.map((f) => (f.id === tempId ? { ...f, id: audioId } : f))
      );

      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total ?? 1)
          );
          setAudioFiles((prev) =>
            prev.map((f) =>
              f.id === audioId ? { ...f, uploadProgress: progress } : f
            )
          );
        },
      });

      setAudioFiles((prev) =>
        prev.map((f) =>
          f.id === audioId
            ? {
                ...f,
                isUploading: false,
                uploadedAt: new Date(),
              }
            : f
        )
      );
      toast.success("Upload completed successfully!");
    } catch (err) {
      console.error("Erro upload:", err);
      setAudioFiles((prev) =>
        prev.map((f) =>
          f.id === tempId ? { ...f, isUploading: false, error: true } : f
        )
      );
      toast.error("Error uploading file.");
    }
  }, []);

  const removeFile = (id: string) => {
    setAudioFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <AudioList
        filteredAudioFiles={filteredAudioFiles}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filter={filter}
        setFilter={setFilter}
        removeFile={removeFile}
        formatFileSize={formatFileSize}
      />
      <AudioUpload handleUpload={handleUpload} />
    </div>
  );
}
