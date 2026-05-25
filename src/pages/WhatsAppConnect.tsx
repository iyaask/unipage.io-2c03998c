import { MessageCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WhatsAppConnect = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">WhatsApp Connect</h1>
        <p className="text-muted-foreground mt-1">
          Get your bursary matches and updates delivered straight to WhatsApp.
        </p>
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
            <MessageCircle className="w-10 h-10 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">We're working hard to bring this feature to you</span>
          </div>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Soon you'll be able to receive personalised bursary recommendations, deadline reminders, and application tips directly on WhatsApp.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppConnect;
