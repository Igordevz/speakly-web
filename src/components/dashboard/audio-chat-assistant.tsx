import { useState } from "react";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send } from "lucide-react";
import { Button } from "../ui/button";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface AudioChatAssistantProps {
  audioData: {
    transcription: string;
    summary: string;
  };
}

export default function AudioChatAssistant({
  audioData,
}: AudioChatAssistantProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !audioData) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsAiTyping(true);

    try {
      const prompt = `Given the following audio transcription:
        response in portuguese Brazil

"""
${audioData.transcription}
"""

And the following summary:

"""
${audioData.summary}
"""

Answer the following question based ONLY on the provided transcription and summary. If the information is not available in the provided text, state that you cannot answer the question. Do not make up information.

Question: ${chatInput}`;

      const result = await model.generateContentStream(prompt);

      let aiResponseContent = "";
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiResponse]);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        aiResponseContent += chunkText;
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiResponse.id
              ? { ...msg, content: aiResponseContent }
              : msg,
          ),
        );
      }
    } catch {
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "Desculpe, não consegui gerar uma resposta no momento. Por favor, tente novamente.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsAiTyping(false);
    }
  };

  return (
    <div className="border-none shadow-sm h-full flex flex-col bg-background">
      <ScrollArea className="w-full flex-1 border border-border/50 rounded-lg p-4 bg-card/50">
                {chatMessages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed bg-card/50 p-8 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Comece a conversar</h2>
                    <p className="mt-2 text-muted-foreground">
                      Você pode fazer perguntas sobre a transcrição e o resumo do seu
                      áudio.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start gap-4 ${message.type === "user" ? "justify-end" : ""}`}>
                        {message.type === "ai" && (
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full bg-muted`}>
                            <Bot className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] rounded-xl p-4 shadow-sm ${message.type === "user"
                              ? "bg-primary text-primary-foreground"
                              : "border bg-muted/50"}`}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        {message.type === "user" && (
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full bg-primary`}>
                            <User className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
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
      <div className="relative mt-4">
        <Input
          placeholder="Ex: No áudio fala algo sobre Igor?"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={isAiTyping}
          className="w-full rounded-full py-6 pl-6 pr-20 shadow-sm"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!chatInput.trim() || isAiTyping}
          className="absolute inset-y-0 right-0 my-2 mr-2 flex h-10 w-10 items-center justify-center rounded-full"
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
