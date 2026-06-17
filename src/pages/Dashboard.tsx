import { useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import Settings from "./Settings";
import { useAuth } from "@/components/auth/AuthProvider";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

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

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <main className="flex-1 transition-all duration-200 w-full">
          <div className="sticky top-0 z-20 h-12 px-4 bg-background border-b flex items-center">
            <SidebarTrigger />
          </div>
          <div className="p-6 md:p-10">
            <Routes>
              <Route path="settings" element={<Settings />} />
              <Route index element={<div />} />
            </Routes>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
