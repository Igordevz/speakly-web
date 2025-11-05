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
    } catch (error) {
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
          <div className="text-center text-muted-foreground py-12">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium mb-2">
              Faça uma pergunta sobre o áudio
            </p>
            <p className="text-sm">
              Ex: &quot;No áudio fala algo sobre Igor?&quot;
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-3 max-w-[85%] ${
                    message.type === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      message.type === "user" ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div
                    className={`p-4 rounded-xl ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 border border-border/50"
                    }`}
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
      <div className="grid grid-cols-[1fr_auto] gap-3 py-2">
        <Input
          placeholder="Ex: No áudio fala algo sobre Igor?"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={isAiTyping}
          className="w-full"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!chatInput.trim() || isAiTyping}
          size="default"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
