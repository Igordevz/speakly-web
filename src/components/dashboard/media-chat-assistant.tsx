import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, AudioLines, Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cn } from "@/lib/utils";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
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

// Helper component for the copy button
const CopyButton = ({ text }: { text: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:bg-muted-foreground/10"
      onClick={handleCopy}
    >
      {isCopied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
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
          <h1 className="text-xl font-bold mt-4 mb-2 text-foreground">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-semibold mt-3 mb-2 text-foreground">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold mt-2 mb-1 text-foreground">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="text-sm leading-relaxed mb-2 text-foreground">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
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
        pre: ({ children, ...props }) => {
          const codeText =
            children &&
            typeof children[0] === "object" &&
            "props" in children[0]
              ? (children[0].props as any).children
              : "";
          return (
            <div className="relative">
              <pre
                {...props}
                className="bg-muted/50 p-3 rounded-lg overflow-x-auto mb-2 text-xs font-mono text-foreground"
              >
                {children}
              </pre>
              <CopyButton text={codeText} />
            </div>
          );
        },
        code: ({ children, className, ...props }) => (
          <code
            {...props}
            className={cn(
              "bg-muted/50 px-1.5 py-0.5 rounded text-xs font-mono text-foreground",
              className,
            )}
          >
            {children}
          </code>
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

export default function MediaChatAssistant({
  mediaData,
}: MediaChatAssistantProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiTyping, isStreaming]);

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
    return audioKeywords.some((keyword) =>
      question.toLowerCase().includes(keyword),
    );
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
      const prompt =
        mediaData &&
        (mediaData.transcription || mediaData.summary) &&
        isAudioRelated(question)
          ? `Você é um assistente inteligente. Responda em português brasileiro usando formatação Markdown (títulos com #, negrito com **, listas com - ou números, etc.) para tornar a resposta mais clara e organizada.

Contexto da mídia disponível:
Transcrição: """${mediaData.transcription || "Não disponível"}"""
Resumo: """${mediaData.summary || "Não disponível"}"""

Responda a seguinte pergunta baseando-se PRINCIPALMENTE no contexto fornecido. Se a informação não estiver disponível no contexto, você pode usar seu conhecimento geral, mas mencione isso claramente.

Pergunta: ${question}`
          : `Você é um assistente de IA inteligente e prestativo. Responda sempre em português brasileiro de forma clara, concisa e útil. Use formatação Markdown para tornar suas respostas mais organizadas e fáceis de ler.
${mediaData && (mediaData.transcription || mediaData.summary) ? `\nContexto adicional disponível (use apenas se relevante): Transcrição: ${mediaData.transcription || "Não disponível"}, Resumo: ${mediaData.summary || "Não disponível"}` : ""}

Pergunta: ${question}`;

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
        aiResponseContent += chunk.text();
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiResponse.id
              ? { ...msg, content: aiResponseContent, isStreaming: true }
              : msg,
          ),
        );
      }

      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiResponse.id ? { ...msg, isStreaming: false } : msg,
        ),
      );
    } catch (error) {
      console.error("Chat error:", error);
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "Desculpe, não consegui gerar uma resposta. Tente novamente.",
        timestamp: new Date(),
        isStreaming: false,
      };
      setChatMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsAiTyping(false);
      setIsStreaming(false);
    }
  };

  return (
    <div className="w-full mx-auto h-full flex flex-col bg-card/50 rounded-xl p-6 shadow-lg border border-border/50">
      <ScrollArea className="flex-1 w-full min-h-0 rounded-lg">
        <div className="p-4">
          {chatMessages.length === 0 ? (
            <div className="flex h-full min-h-[calc(100vh-300px)] md:min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/40  text-center backdrop-blur-sm animate-in fade-in duration-500">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 animate-in zoom-in duration-500 delay-150">
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
                  className={cn(
                    "flex items-start gap-3 group animate-in fade-in slide-in-from-bottom-3 duration-500",
                    message.type === "user" && "justify-end flex-row-reverse",
                  )}
                  style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110",
                      message.type === "user"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "bg-card text-primary border border-border/20",
                    )}
                  >
                    {message.type === "ai" ? (
                      <Bot className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>

                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm transition-all duration-300",
                      message.type === "user"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:shadow-xl ml-auto"
                        : "bg-card border border-border/50 text-foreground group-hover:border-primary/30",
                    )}
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

              {isAiTyping && !isStreaming && (
                <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card text-primary border border-border/20 animate-pulse">
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
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="relative p-4 rounded-lg">
        <div className="relative flex items-center">
          <Input
            placeholder="Pergunte algo sobre a mídia..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isAiTyping || isStreaming}
            className="w-full rounded-full py-6 pl-6 pr-16 bg-card/80 border-2 border-border/50 backdrop-blur-sm focus:bg-card transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!chatInput.trim() || isAiTyping || isStreaming}
            size="icon"
            className="absolute right-2.5 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95 disabled:hover:scale-100"
          >
            {isAiTyping || isStreaming ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 px-1 text-center">
          Pressione Enter para enviar ou Shift+Enter para nova linha.
        </p>
      </div>
    </div>
  );
}
