import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, AudioLines } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface MediaChatAssistantProps {
  mediaData?: {
    transcription?: string;
    summary?: string;
  };
}

export default function MediaChatAssistant({
  mediaData,
}: MediaChatAssistantProps) {
  const { theme, setTheme } = useTheme();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [chatMessages, isAiTyping, isStreaming]);

  // Detect if question is about audio or general
  const isAudioRelated = (question: string): boolean => {
    const audioKeywords = [
      "áudio",
      "audio",
      "transcrição",
      "transcricao",
      "resumo",
      "fala",
      "diz",
      "menciona",
      "comenta",
      "discute",
      "falar",
      "falou",
      "disse",
      "transcrito",
      "gravado",
      "gravação",
      "gravaçao",
      "no áudio",
      "no audio",
      "no texto",
      "na transcrição",
      "vídeo",
      "video",
      "no vídeo",
      "no video",
      "cena",
      "imagens",
    ];
    const lowerQuestion = question.toLowerCase();
    return audioKeywords.some((keyword) => lowerQuestion.includes(keyword));
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    const question = chatInput.trim();
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsAiTyping(true);
    setIsStreaming(true);

    try {
      let prompt = "";

      // Smart prompt: if question is about media, use context. Otherwise, be a general assistant
      if (
        mediaData &&
        (mediaData.transcription || mediaData.summary) &&
        isAudioRelated(question)
      ) {
        prompt = `Você é um assistente inteligente. Responda em português brasileiro usando formatação Markdown (títulos com #, negrito com **, listas com - ou números, etc.) para tornar a resposta mais clara e organizada.

Contexto da mídia disponível:

Transcrição:
"""
${mediaData.transcription || "Não disponível"}
"""

Resumo:
"""
${mediaData.summary || "Não disponível"}
"""

Responda a seguinte pergunta baseando-se PRINCIPALMENTE no contexto fornecido. Se a informação não estiver disponível no contexto, você pode usar seu conhecimento geral, mas mencione isso claramente. Use formatação Markdown para organizar sua resposta com títulos, negrito, listas, etc.

Pergunta: ${question}`;
      } else {
        // General assistant mode
        prompt = `Você é um assistente de IA inteligente e prestativo. Responda sempre em português brasileiro de forma clara, concisa e útil. Use formatação Markdown (títulos com #, negrito com **, listas com - ou números, etc.) para tornar suas respostas mais organizadas e fáceis de ler.

${
  mediaData && (mediaData.transcription || mediaData.summary)
    ? `Contexto adicional disponível (use apenas se relevante):
Transcrição: ${mediaData.transcription || "Não disponível"}
Resumo: ${mediaData.summary || "Não disponível"}`
    : ""
}

Pergunta: ${question}`;
      }

      const result = await model.generateContentStream(prompt);

      let aiResponseContent = "";
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };
      setChatMessages((prev) => [...prev, aiResponse]);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        aiResponseContent += chunkText;
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiResponse.id
              ? { ...msg, content: aiResponseContent, isStreaming: true }
              : msg
          )
        );
      }

      // Mark streaming as complete
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiResponse.id ? { ...msg, isStreaming: false } : msg
        )
      );
    } catch (error) {
      console.error("Chat error:", error);
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "Desculpe, não consegui gerar uma resposta no momento. Por favor, verifique sua conexão e tente novamente.",
        timestamp: new Date(),
        isStreaming: false,
      };
      setChatMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsAiTyping(false);
      setIsStreaming(false);
    }
  };

  // Component for AI message with markdown formatting
  const AIMessage = ({
    content,
    isStreaming,
  }: {
    content: string;
    isStreaming: boolean;
  }) => (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-bold mt-4 mb-2 text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold mt-3 mb-2 text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold mt-2 mb-1 text-foreground">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm leading-relaxed mb-2 text-foreground">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 space-y-1 text-sm text-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 space-y-1 text-sm text-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="ml-4 text-foreground">{children}</li>
          ),
          code: ({ children, className }) => (
            <code
              className={`${
                className || ""
              } bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground`}
            >
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-muted p-3 rounded-lg overflow-x-auto mb-2 text-xs font-mono text-foreground">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-0.5 h-4 bg-primary ml-1 animate-pulse align-middle" />
      )}
    </div>
  );

  // Component for user message
  const UserMessage = ({ content }: { content: string }) => (
    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">
      {content}
    </p>
  );

  return (
    <div className="h-full flex flex-col bg-transparent">


      {/* Messages Area */}
      <ScrollArea className="flex-1 w-full mb-4 min-h-0">
        <div className="pr-4">
          {chatMessages.length === 0 ? (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 bg-gradient-to-br from-card/30 to-card/10 p-12 text-center backdrop-blur-sm animate-in fade-in duration-500">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm animate-in zoom-in duration-500 delay-150">
                <AudioLines className="h-10 w-10 text-primary animate-pulse" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
                Como posso ajudar?
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-500 delay-500">
                Faça perguntas sobre a mídia ou qualquer outra coisa. Estou aqui
                para ajudar!
              </p>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {chatMessages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 group animate-in fade-in slide-in-from-bottom-3 duration-500 ${
                    message.type === "user"
                      ? "justify-end flex-row-reverse"
                      : "justify-start"
                  }`}
                  style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                >
                  {/* Avatar with animation */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-110"
                        : "bg-gradient-to-br from-primary/10 to-primary/5 text-primary border border-primary/20 group-hover:scale-110"
                    }`}
                  >
                    {message.type === "ai" ? (
                      <AudioLines className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>

                  {/* Message Bubble with smooth animations */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm transition-all duration-300 ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:shadow-xl ml-auto"
                        : "bg-card border border-border/50 text-foreground group-hover:border-primary/30"
                    }`}
                  >
                    {message.type === "ai" ? (
                      <AIMessage
                        content={message.content}
                        isStreaming={message.isStreaming || false}
                      />
                    ) : (
                      <UserMessage content={message.content} />
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator - GPT style */}
              {isAiTyping && !isStreaming && (
                <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary border border-primary/20 animate-pulse">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="rounded-2xl bg-card border border-border/50 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area - GPT Style */}
      <div className="relative mt-auto pt-4 border-t border-border/40">
        <div className="relative flex items-center">
          <Input
            placeholder="Mensagem..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isAiTyping || isStreaming}
            className="w-full rounded-2xl py-5 pl-5 pr-14 bg-card/80 border-border/50 backdrop-blur-sm focus:bg-card transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/50 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!chatInput.trim() || isAiTyping || isStreaming}
            size="icon"
            className="absolute right-2 h-9 w-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95 disabled:hover:scale-100"
          >
            {isAiTyping || isStreaming ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 px-1 text-center">
          {isAiTyping || isStreaming
            ? "IA está digitando..."
            : "Pressione Enter para enviar"}
        </p>
      </div>
    </div>
  );
}
