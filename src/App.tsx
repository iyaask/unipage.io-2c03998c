
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
const isSupabaseConfigured = Boolean(supabase);
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Courses from "./pages/Courses";
import DashboardHome from "./pages/DashboardHome";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Onboarding from "./pages/Onboarding";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {!isSupabaseConfigured && (
              <div className="fixed inset-x-0 top-0 z-50 bg-red-600 text-white p-3 text-sm text-center">
                Missing Supabase env vars. Copy <code>.env.example</code> to <code>.env</code>, set
                <code className="mx-1">VITE_SUPABASE_URL</code> and <code className="mx-1">VITE_SUPABASE_PUBLISHABLE_KEY</code>,
                then restart the development server.
              </div>
            )}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
