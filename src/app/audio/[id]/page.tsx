import AudioDetailPage from "@/components/dashboard/audio-detail-page"

interface AudioPageProps {
  params: {
    id: string
  }
}

export default function AudioPage({ params }: AudioPageProps) {
  return <AudioDetailPage audioId={params.id} />
}
