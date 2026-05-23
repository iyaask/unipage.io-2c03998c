import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import agentAvatar from "@/assets/agent-avatar.png";

interface AgentNameModalProps {
  open: boolean;
  onSubmit: (name: string) => void;
}

const AgentNameModal = ({ open, onSubmit }: AgentNameModalProps) => {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    const finalName = name.trim() || "Bursary Agent";
    onSubmit(finalName);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary/30 mx-auto mb-5"
            >
              <img src={agentAvatar} alt="Agent" className="w-full h-full object-cover" />
            </motion.div>

            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wide">Your AI Agent</span>
            </div>

            <h2 className="text-xl font-bold text-foreground mb-2">Name your agent</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Give your bursary assistant a personal name. You can always change it later!
            </p>

            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sipho, Bursary Buddy, Thandi..."
              className="text-center h-12 rounded-xl border-2 text-base mb-4"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />

            <div className="flex flex-col gap-2">
              <Button onClick={handleSubmit} className="rounded-full h-11 text-sm font-semibold w-full">
                {name.trim() ? `Let's go, ${name.trim()}! 🚀` : "Use default name"}
              </Button>
              <button
                onClick={() => onSubmit("Bursary Agent")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip — keep as "Bursary Agent"
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgentNameModal;
