import { useState } from "react";
import { motion } from "motion/react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface AgentTextInputProps {
  type: "text" | "textarea";
  placeholder?: string;
  onSubmit: (value: string) => void;
}

const AgentTextInput = ({ type, placeholder, onSubmit }: AgentTextInputProps) => {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="ml-[52px] flex gap-2 items-end"
    >
      {type === "textarea" ? (
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={3}
          className="flex-1 rounded-xl border-2 border-border focus-visible:ring-primary text-sm"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 h-11 rounded-xl border-2 border-border focus-visible:ring-primary text-sm"
        />
      )}
      <Button
        onClick={handleSubmit}
        disabled={!value.trim()}
        size="icon"
        className="rounded-full h-11 w-11 flex-shrink-0"
      >
        <Send className="w-4 h-4" />
      </Button>
    </motion.div>
  );
};

export default AgentTextInput;
