import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  size?: "default" | "lg";
  children: React.ReactNode;
}

const ActionButton = ({
  variant = "default",
  size = "default",
  className,
  children,
  ...props
}: ActionButtonProps) => {
  return (
    <Button variant={variant} size={size} className={cn(className)} {...props}>
      {children}
    </Button>
  );
};

export default ActionButton;
