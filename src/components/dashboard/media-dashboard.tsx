"use client";

import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import axios from "axios";

import { instance as api } from "@/lib/axios";
import { contextApi, ApiMediaFile } from "@/context/auth";
import { toast } from "sonner";
import MediaList from "./media-list";
import MediaUpload from "./media-upload";


interface MediaFile {
  id: string;
  name: string;
  size: number;
  uploadProgress: number;
  isUploading: boolean;
  transcribed: boolean;
  uploadedAt?: Date;
  error?: boolean;
  fileType?: "audio" | "video";
}



export default function MediaDashboard() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
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
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
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

  const filteredMediaFiles = useMemo(() => {
    let filtered = mediaFiles;

    if (searchTerm) {
      filtered = filtered.filter((file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase()),
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
  }, [mediaFiles, searchTerm, filter]);

  useEffect(() => {
    if (user?.Media && Array.isArray(user.Media)) {
      const parsedFiles: MediaFile[] = user.Media.map((file: ApiMediaFile) => {
        const fileName = (file as unknown as ApiMediaFile).name ?? "sem_nome";
        const fileType = fileName.match(/\.(mp4|webm|mov|avi|mkv)$/i)
          ? "video"
          : "audio";
        return {
          id: (file as unknown as ApiMediaFile).id,
          name: fileName,
          size: (file as unknown as ApiMediaFile).file_size ?? 0,
          uploadProgress: 100,
          isUploading: false,
          transcribed:
            Boolean((file as unknown as ApiMediaFile).text_brute) ||
            Boolean((file as unknown as ApiMediaFile).resume),
          uploadedAt: (file as unknown as ApiMediaFile).createdAt
            ? new Date((file as unknown as ApiMediaFile).createdAt)
            : undefined,
          fileType: fileType,
        };
      });
      setMediaFiles(parsedFiles);
    }
  }, [user]);

  // 🔹 Upload de novo arquivo
  const handleUpload = useCallback(async (file: File) => {
    const tempId = Math.random().toString(36).substring(2, 9);
    const fileType = file.type.startsWith("video/") ? "video" : "audio";
    const newFile: MediaFile = {
      id: tempId,
      name: file.name,
      size: file.size,
      uploadProgress: 0,
      isUploading: true,
      transcribed: false,
      fileType: fileType,
    };

    setMediaFiles((prev) => [newFile, ...prev]);

    try {
      const response = await api.post("/media/upload-url", {
        name: file.name,
        contentType: file.type,
        fileSize: String(file.size),
      });

      const { uploadUrl, mediaId } = response.data;

      setMediaFiles((prev) =>
        prev.map((f) => (f.id === tempId ? { ...f, id: mediaId } : f)),
      );

      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
          );
          setMediaFiles((prev) =>
            prev.map((f) =>
              f.id === mediaId ? { ...f, uploadProgress: progress } : f,
            ),
          );
        },
      });

      setMediaFiles((prev) =>
        prev.map((f) =>
          f.id === mediaId
            ? {
                ...f,
                isUploading: false,
                uploadedAt: new Date(),
              }
            : f,
        ),
      );
      toast.success("Upload completed successfully!");
    } catch (err) {
      console.error("Erro upload:", err);
      setMediaFiles((prev) =>
        prev.map((f) =>
          f.id === tempId ? { ...f, isUploading: false, error: true } : f,
        ),
      );
      toast.error("Error uploading file.");
    }
  }, []);

  const removeMedia = async (id: string) => {
    try {
      const response = await api.delete(`/media/delete/${id}`);
      const data = response.data;

      console.log("Response completa:", response);
      console.log("Dados da API:", data);

      setMediaFiles((prev) => prev.filter((f) => f.id !== id));

      const message = data?.message || "Áudio excluído com sucesso!";
      toast.success(message);
    } catch (error: unknown) {
      console.error("Erro ao excluir áudio:", error);
      let errorMessage = "Erro ao excluir áudio. Tente novamente.";
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  const processMedia = async (id: string) => {
    try {
      const response = await api.get(`/media/process-uploaded/${id}`);
      const { media } = response.data;

      // Atualizar o estado do arquivo para processado
      setMediaFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                transcribed: Boolean(media.text_brute || media.resume),
              }
            : f,
        ),
      );

      toast.success("Áudio processado com sucesso!");

      // Recarregar dados do usuário para obter os dados atualizados
      if (user) {
        const userResponse = await api.get("/user");
        const updatedUser = userResponse.data.user;
        if (updatedUser?.Media && Array.isArray(updatedUser.Media)) {
          const parsedFiles: MediaFile[] = updatedUser.Media.map(
            (file: ApiMediaFile) => ({
              id: file.id,
              name: file.name ?? "sem_nome",
              size: file.file_size ?? 0,
              uploadProgress: 100,
              isUploading: false,
              transcribed: Boolean(file.text_brute) || Boolean(file.resume),
              uploadedAt: file.createdAt ? new Date(file.createdAt) : undefined,
            }),
          );
          setMediaFiles(parsedFiles);
        }
      }
    } catch (error: unknown) {
      console.error("Erro ao processar áudio:", error);
      let errorMessage = "Erro ao processar áudio. Tente novamente.";
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
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
      <MediaList
        filteredMediaFiles={filteredMediaFiles}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filter={filter}
        setFilter={setFilter}
        removeMedia={removeMedia}
        processMedia={processMedia}
        formatFileSize={formatFileSize}
      />
      <div className="grid grid-cols-1 gap-6">
        <MediaUpload handleUpload={handleUpload} />
      </div>
    </div>
  );
}
