import AudioDetail from "@/components/dashboard/audio-detail"

interface AudioPageProps {
  params: {
    id: string
  }
}

export default function AudioPage({ params }: AudioPageProps) {
  return <AudioDetail audioId={params.id} />
}
