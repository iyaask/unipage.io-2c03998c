import { motion } from "motion/react";
import agentAvatar from "@/assets/agent-avatar.png";

interface AgentChatBubbleProps {
  message: string;
  isLatest?: boolean;
}

const AgentChatBubble = ({ message, isLatest = false }: AgentChatBubbleProps) => {
  return (
    <motion.div
      initial={isLatest ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-start gap-3"
    >
      <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex-shrink-0 border-2 border-primary/20">
        <img src={agentAvatar} alt="Bursary Agent" className="w-full h-full object-cover" />
      </div>
      <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{message}</p>
      </div>
    </motion.div>
  );
};

export default AgentChatBubble;
