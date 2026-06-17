import { Home, Settings, LogOut, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-background">
      <SidebarContent className="bg-background text-foreground h-full flex flex-col">
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-semibold text-foreground italic">
              {displayName}
            </span>
          </div>
        </div>

        <div className="mt-auto">
          <Separator />
          <div className="px-3 py-2 space-y-1">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5 w-full text-left text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-2 transition-colors"
            >
              <Home className="w-4 h-4 shrink-0" />
              <span>Back to Home</span>
            </button>
            <button
              onClick={() => navigate("/dashboard/profile")}
              className={`flex items-center gap-2.5 w-full text-left text-[13px] rounded-md p-2 transition-colors ${
                location.pathname === "/dashboard/profile"
                  ? "bg-primary/8 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => navigate("/dashboard/settings")}
              className={`flex items-center gap-2.5 w-full text-left text-[13px] rounded-md p-2 transition-colors ${
                location.pathname === "/dashboard/settings"
                  ? "bg-primary/8 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full text-left text-[13px] text-destructive hover:bg-destructive/10 rounded-md p-2 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
