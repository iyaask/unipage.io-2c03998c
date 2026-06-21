import { Mail } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const Settings = () => {
  const { user } = useAuth();

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
      </div>
    </div>
  );
};

export default Settings;

