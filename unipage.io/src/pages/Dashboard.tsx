
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Routes, Route } from "react-router-dom";
import Profile from "./Profile";
import Bursaries from "./Bursaries";
import BursaryMatches from "./BursaryMatches";
import Settings from "./Settings";
import PapaAI from "./PapaAI";
import WhatsAppConnect from "./WhatsAppConnect";
import DashboardHome from "./DashboardHome";
import { useAuth } from "@/components/auth/AuthProvider";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  // Don't redirect while auth state is still resolving (e.g. returning from Google OAuth)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <main className="flex-1 transition-all duration-200 w-full">
          {/* Top bar - minimal */}
          <div className="sticky top-0 z-20 h-12 px-4 bg-background border-b flex items-center">
            <SidebarTrigger />
          </div>
          <div className="p-6 md:p-10">
            <Routes>
              <Route path="profile" element={<Profile />} />
              <Route path="bursaries" element={<Bursaries />} />
              <Route path="bursary-matches" element={<BursaryMatches />} />
              <Route path="settings" element={<Settings />} />
              <Route path="papa-ai" element={<PapaAI />} />
              <Route path="whatsapp" element={<WhatsAppConnect />} />
              <Route index element={<Profile />} />
            </Routes>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
