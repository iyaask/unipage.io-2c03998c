import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import papaAiAvatar from "@/assets/papa-ai-avatar.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface Message {
  id: number;
  content: string;
  sender: "ai" | "user";
}

export default function PapaAIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hello! How can I help you today?",
      sender: "ai",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .substring(0, 1000);
  };

  const validateInput = (input: string): boolean => {
    if (!input || input.length === 0) return false;
    if (input.length > 1000) return false;
    const suspiciousPatterns = [
      /eval\s*\(/gi,
      /function\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ];
    return !suspiciousPatterns.some(pattern => pattern.test(input));
  };

  const handleSubmit = async (e?: any) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const sanitizedInput = sanitizeInput(input);
    
    if (!validateInput(sanitizedInput)) {
      showToast("Invalid input detected. Please try a different message.", 'error');
      return;
    }

    const userInput = sanitizedInput;
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        content: userInput,
        sender: "user",
      },
    ]);
    
    setInput("");
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const webhookUrl = "https://primary-production-4a757.up.railway.app/webhook/papa";
      const webhookPayload = {
        message: userInput,
        userId: user?.id ?? "anonymous",
        timestamp: new Date().toISOString(),
        source: 'papa-ai-chat',
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(webhookPayload),
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed with status: ${response.status}`);
      }

      const responseText = await response.text();
      let aiResponse = "I'm here to help you with course and bursary information!";

      if (responseText && responseText.trim()) {
        try {
          const responseData = JSON.parse(responseText);
          aiResponse = responseData.response || responseData.message || responseData.reply || responseData.text || aiResponse;
        } catch {
          aiResponse = responseText.trim();
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: aiResponse,
          sender: "ai",
        },
      ]);

      showToast("Message sent successfully!", 'success');
      
    } catch (error) {
      console.error("Error with Papa AI webhook:", error);
      
      const errorResponse = "I'm having trouble connecting to the server right now. Please try again in a moment.";
      
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: errorResponse,
          sender: "ai",
        },
      ]);
      
      showToast("Failed to connect to Papa AI. Please try again.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black border border-gray-800 text-white overflow-hidden max-w-4xl mx-auto rounded-lg">
      <div className="h-[500px] sm:h-[600px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${
                  message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}>
                  {message.sender === "user" ? (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-violet-700 text-white text-sm font-medium flex-shrink-0">
                      U
                    </div>
                  ) : (
                    <img src={papaAiAvatar} alt="Papa AI" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 object-cover" />
                  )}
                  <div className={`rounded-lg p-3 text-sm sm:text-base ${
                    message.sender === "user" 
                      ? "bg-violet-700 text-white" 
                      : "bg-gray-800 text-white"
                  }`}>
                    {message.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[80%]">
                  <img src={papaAiAvatar} alt="Papa AI" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 object-cover" />
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="p-3 sm:p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-gray-900 border border-gray-700 text-white placeholder:text-gray-400 text-sm sm:text-base rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              disabled={isLoading}
            />
            <button 
              onClick={handleSubmit}
              className="bg-violet-700 hover:bg-violet-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white h-10 w-10 sm:h-12 sm:w-12 rounded-md flex items-center justify-center transition-colors"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
