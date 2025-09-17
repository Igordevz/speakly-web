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
import { FileAudio } from "lucide-react";
import AudioCard from "./audio-card"; 

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

interface AudioListProps {
  filteredAudioFiles: AudioFile[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
  removeFile: (id: string) => void;
  formatFileSize: (bytes: number) => string;
}

export default function AudioList({
  filteredAudioFiles,
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  removeFile,
  formatFileSize,
}: AudioListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-300">
          <FileAudio className="h-5 w-5" />
          Meus uploads
        </CardTitle>
        <CardDescription className="text-blue-300">
          {filteredAudioFiles.length} arquivo
          {filteredAudioFiles.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input
            placeholder="Buscar áudios..."
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

        {filteredAudioFiles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum áudio encontrado.
          </p>
        ) : (
          <div className="space-y-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 items-center justify-center gap-2">
            {filteredAudioFiles.map((file) => (
              <AudioCard
                key={file.id}
                file={file}
                removeFile={removeFile}
                formatFileSize={formatFileSize}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}