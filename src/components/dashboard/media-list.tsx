import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileAudio, Play, Trash2, CheckCircle, Clock, Upload, Loader2, Sparkles, Video } from "lucide-react";
import Link from "next/link";
import { useState } from "react"; 

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

interface MediaListProps {
  filteredMediaFiles: MediaFile[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
  removeMedia: (id: string) => void;
  processMedia: (id: string) => Promise<void>;
  formatFileSize: (bytes: number) => string;
}

export default function MediaList({
  filteredMediaFiles,
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  removeMedia,
  processMedia,
  formatFileSize,
}: MediaListProps) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const handleProcessMedia = async (id: string) => {
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      await processMedia(id);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground text-xl">
              <FileAudio className="h-5 w-5 text-primary" />
              Meus Arquivos
            </CardTitle>
            <CardDescription className="mt-1.5">
              {filteredMediaFiles.length} arquivo
              {filteredMediaFiles.length !== 1 ? "s" : ""} encontrado
              {filteredMediaFiles.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input
            placeholder="Buscar arquivos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por data" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="yesterday">Ontem</SelectItem>
              <SelectItem value="last7days">Últimos 7 dias</SelectItem>
              <SelectItem value="last30days">Últimos 30 dias</SelectItem>
              <SelectItem value="thisMonth">Este mês</SelectItem>
              <SelectItem value="lastMonth">Mês passado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredMediaFiles.length === 0 ? (
          <div className="text-center py-12">
            <FileAudio className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Nenhum arquivo encontrado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Nome</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Tamanho</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Data</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredMediaFiles.map((file) => (
                  <tr
                    key={file.id}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          file.isUploading
                            ? "outline"
                            : file.transcribed
                            ? "default"
                            : "secondary"
                        }
                        className="flex items-center gap-1.5 w-fit"
                      >
                        {file.isUploading ? (
                          <>
                            <Upload className="h-3 w-3 animate-pulse" />
                            Enviando...
                          </>
                        ) : file.transcribed ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            Processado
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" />
                            Pendente
                          </>
                        )}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {file.fileType === "video" ? (
                          <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <FileAudio className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-foreground truncate max-w-[200px]">
                            {file.name}
                          </span>
                          {file.isUploading && (
                            <div className="mt-1 w-[200px]">
                              <Progress value={file.uploadProgress} className="h-1.5" />
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {file.uploadProgress}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {file.uploadedAt
                        ? file.uploadedAt.toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "N/A"}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {!file.isUploading && (
                          <>
                            {file.transcribed ? (
                              <Link href={`/media/${file.id}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="shrink-0"
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Ver
                                </Button>
                              </Link>
                            ) : (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleProcessMedia(file.id)}
                                disabled={processingIds.has(file.id)}
                                className="shrink-0"
                              >
                                {processingIds.has(file.id) ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processando...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Processar Mídia
                                  </>
                                )}
                              </Button>
                            )}
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeMedia(file.id)}
                          disabled={file.isUploading || processingIds.has(file.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}