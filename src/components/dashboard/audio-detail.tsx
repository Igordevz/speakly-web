"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, FileAudio, Download, Copy, CheckCircle, Send, Bot, User, Clock, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

interface ChatMessage {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

interface AudioData {
  id: string
  filename: string
  duration: string
  uploadDate: string
  fileSize: string
  status: "completed" | "processing" | "error"
  transcription: string
  summary: string
}

interface AudioDetailProps {
  audioId: string
}

const loadingMessages = [
  "Transcrevendo seu áudio...",
  "Analisando conteúdo...",
  "Falta mais um pouco...",
  "Processando com IA...",
  "Quase pronto...",
]

export default function AudioDetail({ audioId }: AudioDetailProps) {
  const router = useRouter()
  const [audioData, setAudioData] = useState<AudioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<"transcription" | "summary" | null>(null)

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isAiTyping, setIsAiTyping] = useState(false)

  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(0)

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setCurrentLoadingMessage((prev) => (prev + 1) % loadingMessages.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [loading])

  useEffect(() => {
    const fetchAudioData = async () => {
      setLoading(true)

      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const mockData: AudioData = {
        id: audioId,
        filename: "reuniao-projeto-2024.mp3",
        duration: "15:32",
        uploadDate: "2024-01-15",
        fileSize: "12.5 MB",
        status: "completed",
        transcription: `Esta é a transcrição completa do áudio enviado. O conteúdo foi processado automaticamente pela nossa IA de transcrição.

Durante esta reunião, discutimos os principais pontos do projeto, incluindo:

1. Definição dos objetivos principais
2. Cronograma de desenvolvimento  
3. Recursos necessários
4. Responsabilidades da equipe
5. Próximos passos

A equipe demonstrou grande engajamento e todas as questões levantadas foram devidamente endereçadas. Foi estabelecido que as próximas reuniões acontecerão semanalmente para acompanhamento do progresso.

Igor mencionou que será responsável pela parte técnica do backend, enquanto Maria ficará com o frontend. O prazo final para entrega da primeira versão será no final do mês, com revisões intermediárias programadas para os dias 20 e 25.

A documentação técnica será preparada em paralelo ao desenvolvimento, garantindo que todos os processos estejam devidamente registrados.`,
        summary: `Resumo da Reunião de Projeto:

• Objetivos: Definidos os principais marcos do projeto
• Cronograma: Primeira versão até final do mês
• Equipe: Alta participação e engajamento (Igor - backend, Maria - frontend)
• Próximos passos: Reuniões semanais de acompanhamento
• Documentação: Será desenvolvida em paralelo

Pontos de atenção: Revisões intermediárias nos dias 20 e 25 para garantir qualidade e aderência ao cronograma estabelecido.`,
      }

      setAudioData(mockData)
      setLoading(false)
    }

    fetchAudioData()
  }, [audioId])

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !audioData) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setChatInput("")
    setIsAiTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateAiResponse(chatInput, audioData),
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, aiResponse])
      setIsAiTyping(false)
    }, 2000)
  }

  const generateAiResponse = (question: string, audio: AudioData): string => {
    const lowerQuestion = question.toLowerCase()

    if (lowerQuestion.includes("igor")) {
      return "Sim! No áudio, Igor é mencionado como responsável pela parte técnica do backend do projeto. Ele faz parte da equipe e tem um papel importante no desenvolvimento."
    }

    if (lowerQuestion.includes("maria")) {
      return "Maria é mencionada no áudio como responsável pelo frontend do projeto. Ela trabalha em conjunto com Igor para o desenvolvimento da aplicação."
    }

    if (lowerQuestion.includes("prazo") || lowerQuestion.includes("cronograma")) {
      return "Segundo o áudio, o prazo final para entrega da primeira versão será no final do mês, com revisões intermediárias programadas para os dias 20 e 25."
    }

    if (lowerQuestion.includes("reunião") || lowerQuestion.includes("reuniões")) {
      return "O áudio menciona que as próximas reuniões acontecerão semanalmente para acompanhamento do progresso do projeto."
    }

    return "Com base no conteúdo do áudio, posso ajudar você a encontrar informações específicas. Tente perguntar sobre pessoas mencionadas, prazos, responsabilidades ou tópicos discutidos na reunião."
  }

  const copyToClipboard = async (text: string, type: "transcription" | "summary") => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Erro ao copiar:", err)
    }
  }

  const downloadTranscription = () => {
    if (!audioData) return

    const element = document.createElement("a")
    const file = new Blob([audioData.transcription], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `transcricao-${audioData.filename.replace(/\.[^/.]+$/, "")}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center space-x-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>

          <div className="text-center py-16">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border-4 border-primary/20 rounded-full animate-pulse"></div>
              </div>
              <FileAudio className="h-16 w-16 mx-auto text-primary mb-6 relative z-10" />
            </div>
            <h2 className="text-2xl font-semibold mb-4 animate-pulse text-primary">
              {loadingMessages[currentLoadingMessage]}
            </h2>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!audioData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
            <FileAudio className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Áudio não encontrado</h2>
            <p className="text-muted-foreground text-lg">O áudio solicitado não foi encontrado ou não existe.</p>
          </div>
          <Button onClick={() => router.push("/dashboard")} size="lg" className="mt-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header melhorado */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/50">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="hover:bg-muted">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">{audioData.filename}</h1>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-muted-foreground flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Processado em {audioData.uploadDate}
                </p>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Concluído
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - melhor organização */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary Card melhorado */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">Resumo Inteligente</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(audioData.summary, "summary")}>
                    {copied === "summary" ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copied === "summary" ? "Copiado!" : "Copiar"}
                  </Button>
                </div>
                <CardDescription>Principais pontos extraídos pela IA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-6">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                    {audioData.summary}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Chat IA melhorado */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">Assistente IA</CardTitle>
                </div>
                <CardDescription>Faça perguntas específicas sobre o conteúdo do áudio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ScrollArea className="h-80 w-full border border-border/50 rounded-lg p-4 bg-card/50">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-12">
                        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                          <Bot className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-lg font-medium mb-2">Faça uma pergunta sobre o áudio</p>
                        <p className="text-sm">Ex: "No áudio fala algo sobre Igor?"</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`flex items-start space-x-3 max-w-[85%] ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                            >
                              <div
                                className={`p-2 rounded-full ${message.type === "user" ? "bg-primary" : "bg-muted"}`}
                              >
                                {message.type === "user" ? (
                                  <User className="h-4 w-4 text-primary-foreground" />
                                ) : (
                                  <Bot className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div
                                className={`p-4 rounded-xl ${message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50 border border-border/50"}`}
                              >
                                <p className="text-sm leading-relaxed">{message.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {isAiTyping && (
                          <div className="flex justify-start">
                            <div className="flex items-start space-x-3">
                              <div className="p-2 rounded-full bg-muted">
                                <Bot className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                                <div className="flex space-x-1">
                                  <div
                                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                    style={{ animationDelay: "0ms" }}
                                  ></div>
                                  <div
                                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                    style={{ animationDelay: "150ms" }}
                                  ></div>
                                  <div
                                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                    style={{ animationDelay: "300ms" }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                  <div className="flex space-x-3">
                    <Input
                      placeholder="Ex: No áudio fala algo sobre Igor?"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      disabled={isAiTyping}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!chatInput.trim() || isAiTyping} size="default">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transcrição completa melhorada */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Transcrição Completa</CardTitle>
                    <CardDescription>Texto completo extraído do áudio</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(audioData.transcription, "transcription")}
                    >
                      {copied === "transcription" ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      {copied === "transcription" ? "Copiado!" : "Copiar"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadTranscription}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-6 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                    {audioData.transcription}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar melhorada */}
          <div className="space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileAudio className="h-5 w-5 mr-2 text-primary" />
                  Informações do Arquivo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileAudio className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{audioData.filename}</p>
                      <p className="text-xs text-muted-foreground">Arquivo de áudio</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Duração:</span>
                    <Badge variant="outline">{audioData.duration}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tamanho:</span>
                    <Badge variant="outline">{audioData.fileSize}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Upload:</span>
                    <Badge variant="outline">{audioData.uploadDate}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={downloadTranscription}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Transcrição
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <FileAudio className="h-4 w-4 mr-2" />
                  Reprocessar Áudio
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
