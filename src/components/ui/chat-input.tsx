
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface ChatInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, ...props }, ref) => {
    // Auto resize the textarea based on content
    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      const target = e.currentTarget;
      target.style.height = "auto";
      target.style.height = `${target.scrollHeight}px`;
    };

    return (
      <Textarea
        ref={ref}
        onInput={handleInput}
        rows={1}
        className={cn(
          "resize-none min-h-[40px] max-h-[200px] overflow-y-auto",
          className
        )}
        {...props}
      />
    );
  }
);
ChatInput.displayName = "ChatInput";

export { ChatInput };
