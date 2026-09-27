import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { aiService } from "@/services/aiService";
import type { ChatMessage } from "@/types/ai";

const UNAVAILABLE_TEXT = "Desculpe, o assistente está indisponível no momento. Tente novamente em instantes.";
const GREETING: ChatMessage = {
  role: "assistant",
  content: "Oi! Posso ajudar a buscar produtos, comparar opções ou ver o status dos seus pedidos. O que procura?",
};

const AiChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const reply = await aiService.chat(nextMessages);
      setMessages((prev) => [...prev, reply]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: UNAVAILABLE_TEXT }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <Card className="w-[350px] h-[500px] flex flex-col bg-gradient-card border-border shadow-glow-primary overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2 font-semibold">
              <Bot className="h-5 w-5 text-primary" /> Assistente GamerZone
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 px-4">
            <div className="py-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                      m.role === "user" ? "bg-gradient-gamer text-white" : "bg-muted text-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-muted text-muted-foreground">
                    Digitando...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-border shrink-0">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre produtos ou pedidos..."
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} className="bg-gradient-gamer shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      )}

      <Button
        size="icon"
        onClick={() => setOpen((o) => !o)}
        className="h-14 w-14 rounded-full bg-gradient-gamer hover:opacity-90 shadow-glow-primary"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export default AiChatWidget;
