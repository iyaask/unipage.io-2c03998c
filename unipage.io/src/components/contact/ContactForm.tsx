
import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ActionButton from "../common/ActionButton";

const ContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      const { data, error } = await supabase.functions.invoke('contact-webhook', {
        body: {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
      });

      if (error) {
        console.error('Error submitting contact form:', error);
        toast({
          title: "Error",
          description: "There was an issue sending your message. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Show success with response from n8n
      const responseMessage = data?.message || "We'll get back to you as soon as possible!";
      toast({
        title: "Thank you for your feedback",
        description: responseMessage,
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Error",
        description: "There was an issue sending your message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
              Message
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
              required
            />
          </div>

          <ActionButton type="submit" className="w-full bg-primary hover:bg-primary/90">
            Send Message
            <Send className="ml-2 h-5 w-5" />
          </ActionButton>
        </form>
  );
};

export default ContactForm;
