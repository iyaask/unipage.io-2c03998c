
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
}

const BackButton = ({
  fallbackPath = "/dashboard",
  className = ""
}: BackButtonProps) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    // If there's history to go back to, use it
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Otherwise go to the fallback path
      navigate(fallbackPath);
    }
  };
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className={`flex items-center gap-1 ${className}`}
      onClick={handleBack}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Back</span>
    </Button>
  );
};

export default BackButton;
