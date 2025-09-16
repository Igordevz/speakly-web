import DashboardHeader from "@/components/dashboard/dashboard-header";
import SimpleAudioDashboard from "@/components/dashboard/simple-audio";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="space-y-8">
          <div className="text-center space-y-4 py-8">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Dashboard de Áudio
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transforme seus áudios em texto com inteligência artificial avançada
            </p>
          </div>
          <SimpleAudioDashboard />
        </div>
      </main>
    </div>
  )
}
