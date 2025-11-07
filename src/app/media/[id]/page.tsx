import MediaDetailPage from "@/components/dashboard/media-detail-page"
import { Suspense } from "react"

interface MediaPageProps {
  params: {
    id: string
  }
}

function MediaPageContent({ mediaId }: { mediaId: string }) {
  return <MediaDetailPage mediaId={mediaId} />
}

export default function MediaPage({ params }: MediaPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        {/* Subtle gradient background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        {/* Main content with smooth transitions */}
        <div className="relative z-10">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Carregando mídia...</p>
                </div>
              </div>
            }
          >
            <MediaPageContent mediaId={params.id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
