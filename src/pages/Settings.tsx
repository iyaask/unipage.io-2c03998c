
import { Button } from "@/components/ui/button";
import { LogOut, User, Mail } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log out",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

      <div className="bg-background border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Account</h2>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <Mail className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Email</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="px-6 py-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Actions</h2>
          <Button
            onClick={handleLogout}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
