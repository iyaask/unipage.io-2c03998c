import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface AgentOptionChipsProps {
  options: string[];
  onSelect: (option: string) => void;
}

const AgentOptionChips = ({ options, onSelect }: AgentOptionChipsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="flex flex-wrap gap-2 pl-13 ml-[52px]"
    >
      {options.map((option, i) => (
        <motion.button
          key={option}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.2 + i * 0.04 }}
          onClick={() => onSelect(option)}
          className={cn(
            "px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200",
            "bg-card text-foreground border-border",
            "hover:border-primary hover:bg-primary/5 hover:shadow-sm hover:scale-[1.03]",
            "active:scale-95"
          )}
        >
          {option}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default AgentOptionChips;
