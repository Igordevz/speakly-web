"use client";

import DashboardHeader from "@/components/dashboard/dashboard-header";
import { useContext } from "react";
import { contextApi, ApiMediaFile } from "@/context/auth";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, FileAudio, Sparkles } from "lucide-react";
import { useMemo } from "react";
import MediaDashboard from "@/components/dashboard/media-dashboard";

export default function DashboardPage() {
  const { user } = useContext(contextApi);

  const stats = useMemo(() => {
    if (!user?.Media || !Array.isArray(user.Media)) {
      return { total: 0, processed: 0, pending: 0 };
    }

    const total = user.Media.length;
    const processed = user.Media.filter(
      (file: ApiMediaFile) => file.text_brute || file.resume
    ).length;
    const pending = total - processed;

    return { total, processed, pending };
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
        <div className="space-y-6 sm:space-y-8">
          {/* Header Section - Minimalista e Moderno */}
          <div className="text-center space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">IA Avançada</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Speakly
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transforme seus áudios em texto com inteligência artificial
            </p>
          </div>

          {/* Stats Cards - Responsivo e Minimalista */}
          {stats.total > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total</p>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                        {stats.total}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FileAudio className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Processados</p>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                        {stats.processed}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10">
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                        {stats.pending}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-500/10">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Dashboard Content */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <MediaDashboard/>
          </div>
        </div>
      </main>
    </div>
  );
}
