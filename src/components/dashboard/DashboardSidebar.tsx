
import { User, Settings, Award, LogOut, BarChart3, MessageCircle, Home, Sparkles } from "lucide-react";
import papaAiAvatar from "@/assets/papa-ai-avatar.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const profileItems = [
  {
    title: "My Profile",
    icon: User,
    path: "/dashboard/profile",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/dashboard/settings",
  },
];

const papaAiItems = [
  {
    title: "Papa AI",
    icon: null,
    customIcon: papaAiAvatar,
    path: "/dashboard/papa-ai",
  },
];

const bursaryItems = [
  {
    title: "Bursaries Agent",
    icon: Award,
    path: "/dashboard/bursaries",
  },
  {
    title: "My Matches",
    icon: BarChart3,
    path: "/dashboard/bursary-matches",
  },
  {
    title: "AI Apply",
    icon: Sparkles,
    path: "/dashboard/ai-apply",
  },
  {
    title: "WhatsApp Connect",
    icon: MessageCircle,
    path: "/dashboard/whatsapp",
  },
];

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

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const renderItem = (item: { title: string; icon: any; path: string; customIcon?: string }) => {
    const isActive = location.pathname === item.path;
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          onClick={() => navigate(item.path)}
          tooltip={item.title}
          className={`rounded-md py-2 px-3 transition-all duration-150 text-[13px] ${
            isActive
              ? "bg-primary/8 text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {item.customIcon ? (
            <img src={item.customIcon} alt={item.title} className="w-4 h-4 mr-2.5 shrink-0 rounded-full" />
          ) : (
            <item.icon className={`w-4 h-4 mr-2.5 shrink-0 ${isActive ? "text-primary" : ""}`} />
          )}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-background">
      <SidebarContent className="bg-background text-foreground h-full flex flex-col">
        {/* User name header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-semibold text-foreground italic">{displayName}</span>
          </div>
        </div>

        {/* Profile group */}
        <SidebarGroup className="px-2 py-1">
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground px-3 mb-0.5">
            Profile
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {profileItems.map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Papa AI group - now before Bursary Agent */}
        <SidebarGroup className="px-2 py-1">
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground px-3 mb-0.5">
            Papa AI
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {papaAiItems.map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bursary Agent group */}
        <SidebarGroup className="px-2 py-1">
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground px-3 mb-0.5">
            Bursary Agent
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bursaryItems.map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom section */}
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
