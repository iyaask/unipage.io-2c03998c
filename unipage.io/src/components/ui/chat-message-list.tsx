
import React from "react";
import { cn } from "@/lib/utils";

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col space-y-4 p-4", className)}
        {...props}
      />
    );
  }
);
ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };
