"use client";

import { useState, useEffect, useCallback, useContext } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { z } from "zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileAudio,
  Play,
  Trash2,
} from "lucide-react";
import { instance as api } from "@/lib/axios";
import { contextApi } from "@/context/auth";

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

export default function AudioDashboard() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const { user } = useContext(contextApi);

  // 🔹 Pega os áudios já existentes do usuário
  useEffect(() => {
    if (user?.Audio && Array.isArray(user.Audio)) {
      const parsedFiles = user.Audio.map((file: { id: string; name: string; file_size: number; text_brute: string; resume: string; createdAt: string | number | Date; }) => ({
        id: file.id,
        name: file.name ?? "sem_nome",
        size: file.file_size ?? 0,
        uploadProgress: 100,
        isUploading: false,
        transcribed: Boolean(file.text_brute) || Boolean(file.resume),
        uploadedAt: file.createdAt ? new Date(file.createdAt) : undefined,
      }));
      setAudioFiles(parsedFiles);
    }
  }, [user]);

  // 🔹 Upload de novo arquivo
  const handleUpload = async (file: File) => {
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
      // Ajusta nome e extensão
      const originalFileName = file.name;
      const parts = originalFileName.split(".");
      let extension = parts.length > 1 ? parts.pop()?.toLowerCase() || "" : "";
      if (extension.startsWith("x-")) extension = extension.substring(2);
      const nameForBackend = parts.join(".");
      const contentTypeForBackend = `audio/${extension}`;

      const response = await api.post("/audio/upload-url", {
        name: nameForBackend,
        contentType: contentTypeForBackend,
        fileSize: String(file.size)
      });

      const { uploadUrl, audioId } = response.data;

      // Atualiza ID depois que o backend cria o recurso
      setAudioFiles((prev) =>
        prev.map((f) => (f.id === tempId ? { ...f, id: audioId } : f))
      );

      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": contentTypeForBackend },
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
    } catch (err) {
      console.error("Erro upload:", err);
      setAudioFiles((prev) =>
        prev.map((f) =>
          f.id === tempId ? { ...f, isUploading: false, error: true } : f
        )
      );
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      try {
        const schema = z.object({
          file: z
            .instanceof(File)
            .refine((f) => f.type.startsWith("audio/"), "Precisa ser áudio")
            .refine((f) => f.size <= 50 * 1024 * 1024, "Máx. 50MB"),
        });
        schema.parse({ file });
        handleUpload(file);
      } catch (err) {
        console.error("Validação falhou:", err);
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "audio/*": [".mp3", ".wav", ".m4a", ".ogg"] },
  });

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
      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de Áudio</CardTitle>
          <CardDescription>
            Faça upload dos seus arquivos de áudio para transcrição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg">Solte os arquivos aqui...</p>
            ) : (
              <>
                <p className="text-lg mb-2">Arraste arquivos de áudio aqui</p>
                <p className="text-sm text-muted-foreground mb-4">
                  ou clique para selecionar
                </p>
                <Button>Selecionar Arquivos</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="h-5 w-5" />
            Meus Áudios
          </CardTitle>
          <CardDescription>
            {audioFiles.length} arquivo
            {audioFiles.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {audioFiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum áudio enviado ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {audioFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  <FileAudio className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      {file.uploadedAt && (
                        <span>
                          {file.transcribed
                            ? `Transcrito em ${file.uploadedAt.toLocaleDateString()}`
                            : `Enviado em ${file.uploadedAt.toLocaleDateString()}`}
                        </span>
                      )}
                    </div>
                    {file.isUploading && (
                      <div className="mt-2">
                        <Progress value={file.uploadProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {file.uploadProgress}% enviado
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                      <Link href={`/audio/${file.id}`}>
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4 mr-2" />
                          Ver Transcrição
                        </Button>
                      </Link>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(file.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
