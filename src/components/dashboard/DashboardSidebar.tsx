import { Home, Settings, LogOut, User, ClipboardList, LayoutGrid, Search, Mail, MessageCircle, Check } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const whatsappNumber = "+1 (206) 796-7516";
  const waLink = `https://wa.me/12067967516?text=${encodeURIComponent("Hi, I'd like to apply for bursaries over WhatsApp.")}`;

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

        <div className="px-3 py-2 space-y-1">
          {[
            { path: "/dashboard", label: "Dashboard", icon: LayoutGrid, exact: true },
            { path: "/dashboard/browse-bursaries", label: "Browse bursaries", icon: Search },
            { path: "/dashboard/inbox", label: "Inbox", icon: Mail },
            { path: "/dashboard/tracker", label: "Tracker", icon: ClipboardList },
          ].map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? location.pathname === item.path
              : location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2.5 w-full text-left text-[13px] rounded-md p-2 transition-colors ${
                  active
                    ? "bg-primary/8 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setWhatsappOpen(true)}
            className="flex items-center gap-2.5 w-full text-left text-[13px] rounded-md p-2 transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>WhatsApp</span>
          </button>
        </div>

        <Dialog open={whatsappOpen} onOpenChange={setWhatsappOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <DialogTitle className="text-xl">Apply over WhatsApp</DialogTitle>
              </div>
              <DialogDescription className="pt-2">
                Same flow as iMessage, on WhatsApp.
              </DialogDescription>
            </DialogHeader>
            <ul className="space-y-2.5 py-2">
              {[
                "Daily matches delivered to your chat",
                "Reply yes to apply",
                "Works on any device with WhatsApp installed",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between rounded-md bg-muted px-4 py-3 text-sm">
              <span className="text-muted-foreground">Contact</span>
              <span className="font-medium">{whatsappNumber}</span>
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => setWhatsappOpen(false)} className="flex-1">
                Close
              </Button>
              <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                <a href={waLink} target="_blank" rel="noopener noreferrer">Open WhatsApp</a>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
