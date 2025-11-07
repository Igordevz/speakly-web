import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Clock } from "lucide-react";

interface MediaDetailHeaderProps {
  filename: string;
  uploadDate: string;
}

export default function MediaDetailHeader({ filename, uploadDate }: MediaDetailHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-border/50">
      <div className="flex flex-col md:flex-row md:items-center items-start space-x-4  sm:mb-0">
        <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="hover:bg-muted cursor-pointer ">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        <Separator orientation="vertical" className="h-6 hidden sm:block" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground break-words">{filename}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1">
            <p className="text-muted-foreground flex items-center text-sm sm:text-base">
              <Clock className="h-4 w-4 mr-1" />
              Processado em {uploadDate}
            </p>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mt-2 sm:mt-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              Concluído
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}