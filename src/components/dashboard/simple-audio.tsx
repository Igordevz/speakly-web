"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, FileAudio, Play, Trash2, Clock, CheckCircle, HardDrive, TrendingUp } from "lucide-react"
import { z } from "zod"
import Link from "next/link"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { instance as api } from "@/lib/axios"
import axios from "axios"

interface AudioFile {
  id: string
  name: string
  size: number
  uploadProgress: number
  isUploading: boolean
  transcribed: boolean
  uploadedAt?: Date
  error?: boolean
}

export default function SimpleAudioDashboard() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])

  useEffect(() => {
    const savedFiles = localStorage.getItem("audioHistory")
    if (savedFiles) {
      const parsedFiles = JSON.parse(savedFiles).map((file: any) => ({
        ...file,
        uploadedAt: file.uploadedAt ? new Date(file.uploadedAt) : undefined,
      }))
      setAudioFiles(parsedFiles)
    }
  }, [])

  useEffect(() => {
    const filesToSave = audioFiles.filter(file => !file.isUploading);
    if (filesToSave.length > 0) {
      localStorage.setItem("audioHistory", JSON.stringify(filesToSave));
    } else {
      localStorage.removeItem("audioHistory");
    }
  }, [audioFiles]);


  const handleUpload = async (file: File) => {
    const tempId = Math.random().toString(36).substr(2, 9)
    const newFile: AudioFile = {
      id: tempId,
      name: file.name,
      size: file.size,
      uploadProgress: 0,
      isUploading: true,
      transcribed: false,
    }

    setAudioFiles((prev) => [newFile, ...prev])

    try {
      // --- START: Definitive Filename Fix v2 ---

      // 1. Get the original filename and extension
      const originalFileName = file.name;
      const parts = originalFileName.split('.');
      let extension = parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
      const nameWithoutExt = parts.join('.');

      // 2. Clean the extension itself. Remove "x-" prefix.
      if (extension.startsWith('x-')) {
        extension = extension.substring(2);
      }
      
      // 3. The backend wants a name without extension.
      const nameForBackend = nameWithoutExt;

      // 4. Construct the perfect contentType with the CLEANED extension.
      const contentTypeForBackend = `audio/${extension}`;

      const response = await api.post("/audio/upload-url", {
        name: nameForBackend,
        contentType: contentTypeForBackend,
      })
      
      // --- END: Definitive Filename Fix v2 ---

      const { uploadUrl, audioId } = response.data

      // Update file with the real ID from the backend
      setAudioFiles((prev) =>
        prev.map((f) => (f.id === tempId ? { ...f, id: audioId } : f)),
      )

      // 2. Upload file to the signed URL (e.g., R2)
      // IMPORTANT: The Content-Type header here MUST MATCH the one used to generate the signed URL.
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": contentTypeForBackend,
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 1))
          setAudioFiles((prev) =>
            prev.map((f) =>
              f.id === audioId ? { ...f, uploadProgress: progress } : f,
            ),
          )
        },
      })

      // 3. Finalize upload state
      setAudioFiles((prev) =>
        prev.map((f) =>
          f.id === audioId
            ? { ...f, isUploading: false, transcribed: true, uploadedAt: new Date() } // Assuming transcription is done, adjust if needed
            : f,
        ),
      )
    } catch (error) {
      console.error("Upload failed:", error)
      // Mark file as errored and stop uploading
      setAudioFiles((prev) =>
        prev.map((f) => (f.id === tempId ? { ...f, isUploading: false, error: true } : f)),
      )
      // Optionally remove the file after a delay
      setTimeout(() => {
        removeFile(tempId)
        alert(`Falha no upload do arquivo: ${file.name}`)
      }, 5000)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      try {
        const audioSchema = z.object({
          file: z
            .instanceof(File)
            .refine((file) => file.type.startsWith("audio/"), "Arquivo deve ser um áudio")
            .refine((file) => file.size <= 50 * 1024 * 1024, "Arquivo deve ter no máximo 50MB"),
        })

        audioSchema.parse({ file })
        handleUpload(file)
      } catch (error) {
        console.error("Erro na validação:", error)
        // You might want to show a toast or notification here
      }
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".ogg"],
    },
    multiple: true,
  })

  const removeFile = (id: string) => {
    setAudioFiles((prev) => {
      const newFiles = prev.filter((f) => f.id !== id)
      if (newFiles.length === 0) {
        localStorage.removeItem("audioHistory")
      } else {
        localStorage.setItem("audioHistory", JSON.stringify(newFiles))
      }
      return newFiles
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const usageLimit = 1000 // MB
  const currentUsage = audioFiles.reduce((total, file) => total + file.size, 0) / (1024 * 1024) // Convert to MB
  const usagePercentage = (currentUsage / usageLimit) * 100

  // Dados simulados para o gráfico de área (últimos 7 dias)
  const usageData = [
    { day: "Seg", usage: 120 },
    { day: "Ter", usage: 180 },
    { day: "Qua", usage: 250 },
    { day: "Qui", usage: 320 },
    { day: "Sex", usage: 420 },
    { day: "Sáb", usage: 380 },
    { day: "Dom", usage: Math.round(currentUsage) },
  ]

  const uploadingFiles = audioFiles.filter((f) => f.isUploading)
  const transcribedFiles = audioFiles.filter((f) => f.transcribed)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Limite de Upload */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Limite de Upload</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{Math.round(currentUsage)} MB</span>
                <span className="text-sm text-muted-foreground">de {usageLimit} MB</span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">{Math.round(usageLimit - currentUsage)} MB restantes</p>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Uso */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso Semanal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ChartContainer
                config={{
                  usage: {
                    label: "Uso (MB)",
                    color: "hsl(var(--foreground))",
                  },
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={usageData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      width={40}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="usage"
                      stroke="hsl(var(--foreground))"
                      fill="hsl(var(--muted))"
                      strokeWidth={2}
                      fillOpacity={0.3}
                      dot={{ fill: "hsl(var(--foreground))", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "hsl(var(--foreground))", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de Áudio</CardTitle>
          <CardDescription>Faça upload dos seus arquivos de áudio para transcrição</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg">Solte os arquivos aqui...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Arraste arquivos de áudio aqui</p>
                <p className="text-sm text-muted-foreground mb-4">ou clique para selecionar</p>
                <Button>Selecionar Arquivos</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {uploadingFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Processando
            </CardTitle>
            <CardDescription>
              {uploadingFiles.length} arquivo{uploadingFiles.length !== 1 ? "s" : ""} sendo processado
              {uploadingFiles.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadingFiles.map((file) => (
                <div key={file.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <FileAudio className="h-8 w-8 text-muted-foreground" />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>

                    <div className="mt-2">
                      <Progress value={file.uploadProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{file.uploadProgress}% processado</p>
                    </div>
                  </div>

                  <Button size="sm" variant="ghost" onClick={() => removeFile(file.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {transcribedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Áudios Transcritos
            </CardTitle>
            <CardDescription>
              {transcribedFiles.length} arquivo{transcribedFiles.length !== 1 ? "s" : ""} transcrito
              {transcribedFiles.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transcribedFiles.map((file) => (
                <div key={file.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <FileAudio className="h-8 w-8 text-muted-foreground" />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      {file.uploadedAt && <span>Transcrito em {file.uploadedAt.toLocaleDateString()}</span>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link href={`/audio/${file.id}`}>
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-2" />
                        Ver Transcrição
                      </Button>
                    </Link>

                    <Button size="sm" variant="ghost" onClick={() => removeFile(file.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>.
        </Card>
      )}
    </div>
  )
}