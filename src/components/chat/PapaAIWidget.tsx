import { useState } from "react";
import { X } from "lucide-react";
import papaAiAvatar from "@/assets/papa-ai-avatar.png";
import PapaAIChat from "./PapaAIChat";
import { cn } from "@/lib/utils";

export default function PapaAIWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 print:hidden">
      {open && (
        <div className="mb-3 w-[92vw] max-w-md h-[70vh] sm:h-[600px] rounded-xl overflow-hidden shadow-2xl border border-border bg-background animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between px-4 py-2 bg-[#0f1d3a] text-white">
            <div className="flex items-center gap-2">
              <img src={papaAiAvatar} alt="Papa AI" className="w-7 h-7 rounded-full" />
              <span className="text-sm font-medium">Papa AI</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="h-[calc(100%-44px)]">
            <PapaAIChat />
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 pl-1.5 pr-5 py-1.5 rounded-full",
          "bg-[#0f1d3a] text-white shadow-lg hover:shadow-xl hover:bg-[#152648]",
          "transition-all duration-200"
        )}
        aria-label="Chat with Papa AI"
      >
        <img
          src={papaAiAvatar}
          alt="Papa AI"
          className="w-10 h-10 rounded-full ring-2 ring-white/90 bg-white object-cover"
        />
        <span className="text-sm font-medium">{open ? "Close chat" : "Chat with me"}</span>
      </button>
    </div>
  );
}
