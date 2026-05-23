
import React from "react";
import { cn } from "@/lib/utils";

type ChatBubbleVariant = "sent" | "received";

interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ChatBubbleVariant;
}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ className, variant = "received", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-start gap-2.5 py-2",
          variant === "sent" ? "justify-end" : "justify-start",
          className
        )}
        {...props}
      />
    );
  }
);
ChatBubble.displayName = "ChatBubble";

interface ChatBubbleAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  fallback: string;
}

const ChatBubbleAvatar = React.forwardRef<
  HTMLDivElement,
  ChatBubbleAvatarProps
>(({ className, src, fallback, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={fallback}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-medium">
          {fallback.slice(0, 2)}
        </div>
      )}
    </div>
  );
});
ChatBubbleAvatar.displayName = "ChatBubbleAvatar";

interface ChatBubbleMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ChatBubbleVariant;
  isLoading?: boolean;
}

const ChatBubbleMessage = React.forwardRef<
  HTMLDivElement,
  ChatBubbleMessageProps
>(({ className, variant = "received", isLoading, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg px-4 py-2 text-sm",
        variant === "sent"
          ? "ml-auto bg-primary text-primary-foreground"
          : "bg-muted",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="flex space-x-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-current"></div>
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-current"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-current"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      ) : (
        children
      )}
    </div>
  );
});
ChatBubbleMessage.displayName = "ChatBubbleMessage";

export { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage };
