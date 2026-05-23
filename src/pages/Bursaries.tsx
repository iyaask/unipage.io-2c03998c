import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Sparkles, SkipForward, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import AgentChatBubble from "@/components/bursaries/AgentChatBubble";
import UserChatBubble from "@/components/bursaries/UserChatBubble";
import AgentOptionChips from "@/components/bursaries/AgentOptionChips";
import AgentTextInput from "@/components/bursaries/AgentTextInput";
import AgentNameModal from "@/components/bursaries/AgentNameModal";
import { BURSARY_QUESTIONS } from "@/components/bursaries/bursaryQuestions";
import agentAvatar from "@/assets/agent-avatar.png";

const AGENT_NAME_KEY = "bursary_agent_name";

interface ChatMessage {
  type: "agent" | "user";
  text: string;
}

const Bursaries = () => {
  const { user } = useAuth();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [bursaryResults, setBursaryResults] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showInput, setShowInput] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [agentName, setAgentName] = useState(() => localStorage.getItem(AGENT_NAME_KEY) || "");
  const [showNameModal, setShowNameModal] = useState(() => !localStorage.getItem(AGENT_NAME_KEY));
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const question = BURSARY_QUESTIONS[currentQ];
  const progress = ((currentQ) / BURSARY_QUESTIONS.length) * 100;
  const isLastQuestion = currentQ === BURSARY_QUESTIONS.length - 1;
  const showWhatsappInput = question?.id === "deliveryMethod" && answers.deliveryMethod === "Send to my WhatsApp";

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, showInput, isTyping]);

  // Add first agent message on mount
  useEffect(() => {
    if (chatHistory.length === 0 && question) {
      setChatHistory([{ type: "agent", text: question.agentMessage }]);
    }
  }, []);

  const handleNameSubmit = (name: string) => {
    setAgentName(name);
    localStorage.setItem(AGENT_NAME_KEY, name);
    setShowNameModal(false);
  };

  const handleNameEdit = () => {
    setEditNameValue(agentName);
    setIsEditingName(true);
  };

  const handleNameEditSave = () => {
    const newName = editNameValue.trim() || "Bursary Agent";
    setAgentName(newName);
    localStorage.setItem(AGENT_NAME_KEY, newName);
    setIsEditingName(false);
  };

  const advanceToNext = (answerText: string) => {
    setShowInput(false);

    // Add user bubble
    setChatHistory((prev) => [...prev, { type: "user", text: answerText }]);

    if (isLastQuestion) {
      // Submit after short delay
      setTimeout(() => handleSubmit(), 600);
      return;
    }

    // Show typing indicator then next question
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const nextQ = currentQ + 1;
        setCurrentQ(nextQ);
        setChatHistory((prev) => [
          ...prev,
          { type: "agent", text: BURSARY_QUESTIONS[nextQ].agentMessage },
        ]);
        setShowInput(true);
      }, 800);
    }, 300);
  };

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    advanceToNext(value);
  };

  const handleTextSubmit = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    advanceToNext(value);
  };

  const handleSkip = () => {
    advanceToNext("Skipped ⏭️");
  };

  const handleWhatsappSubmit = () => {
    if (whatsappNumber.trim()) {
      advanceToNext(`Send to my WhatsApp: ${whatsappNumber}`);
    }
  };

  const handleSubmit = async () => {
    if (!answers.fieldOfStudy?.trim()) {
      toast({
        title: "Missing information",
        description: "Please go back and tell us what you want to study.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setBursaryResults("");
    localStorage.setItem("bursaryAgentSearching", "true");

    const profile = {
      field_of_study: answers.fieldOfStudy,
      study_level: answers.studyYear || "Undergraduate",
      province: answers.homeProvince || "Gauteng",
      income_band: answers.otherFunding || "No current funding",
      nationality: answers.nationality || "SA Citizen",
      institution: answers.institutionType || "University",
      academicPerformance: answers.academicPerformance || "",
      race: answers.race || "",
      gender: answers.gender || "",
      disabilityStatus: answers.disabilityStatus || "",
      ruralUrban: answers.ruralUrban || "",
      workCommitment: answers.workCommitment || "",
      extracurriculars: answers.extracurriculars || "",
      deliveryMethod: answers.deliveryMethod || "View here in the app",
      whatsappNumber: answers.deliveryMethod === "Send to my WhatsApp" ? whatsappNumber : "",
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const webhookUrl = "https://primary-production-4a757.up.railway.app/webhook-test/bursary-search";
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ profile }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const responseText = await response.text();
      let resultText = responseText;

      try {
        const data = JSON.parse(responseText);
        if (data.results) {
          resultText = typeof data.results === "string" ? data.results : JSON.stringify(data.results, null, 2);
        }
        if (user) {
          await supabase.from("given_bursary_info").insert({
            user_id: user.id,
            payload: profile as unknown as import("@/integrations/supabase/types").Json,
            summary: typeof resultText === "string" ? resultText.slice(0, 2000) : null,
          });
        }
      } catch {
        // Plain text response — use as-is
      }

      setChatHistory((prev) => [
        ...prev,
        { type: "agent", text: `✨ Here are your bursary matches:\n\n${resultText}` },
      ]);
      setBursaryResults(resultText);

      // Only cache in localStorage for unauthenticated users; authenticated users read from Supabase
      if (!user) {
        localStorage.setItem("bursaryMatches", resultText);
      }

      toast({ title: "Success!", description: "Your bursary matches have been found and saved to My Matches." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch bursary matches. Please try again.", variant: "destructive" });
      setBursaryResults("Error: Failed to fetch bursary matches. Please try again later.");
    } finally {
      setIsLoading(false);
      localStorage.setItem("bursaryAgentSearching", "false");
    }
  };

  const resetQuiz = () => {
    setBursaryResults("");
    setCurrentQ(0);
    setAnswers({});
    setWhatsappNumber("");
    setChatHistory([{ type: "agent", text: BURSARY_QUESTIONS[0].agentMessage }]);
    setShowInput(true);
    setIsTyping(false);
  };

  // No separate results page — results show inline in chat

  return (
    <>
      <AgentNameModal open={showNameModal} onSubmit={handleNameSubmit} />
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30">
          <img src={agentAvatar} alt="Agent" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={editNameValue}
                onChange={(e) => setEditNameValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNameEditSave()}
                onBlur={handleNameEditSave}
                className="h-7 text-sm font-semibold w-40"
                autoFocus
              />
            </div>
          ) : (
            <button onClick={handleNameEdit} className="flex items-center gap-1.5 group">
              <h2 className="text-sm font-semibold text-foreground">{agentName || "Bursary Agent"}</h2>
              <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Actively working for you</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground">{Math.round(progress)}% complete</span>
          <Progress value={progress} className="h-1.5 w-24 mt-1" />
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1 scrollbar-thin">
        {chatHistory.map((msg, i) =>
          msg.type === "agent" ? (
            <AgentChatBubble
              key={i}
              message={msg.text}
              isLatest={i === chatHistory.length - 1}
            />
          ) : (
            <UserChatBubble key={i} message={msg.text} />
          )
        )}

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex-shrink-0 border-2 border-primary/20">
              <img src={agentAvatar} alt="Agent" className="w-full h-full object-cover" />
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex-shrink-0 border-2 border-primary/20">
              <img src={agentAvatar} alt="Agent" className="w-full h-full object-cover" />
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                  <Sparkles className="w-4 h-4 text-primary" />
                </motion.div>
                <p className="text-sm text-muted-foreground">Searching for your bursary matches...</p>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      {showInput && question && !isLoading && !bursaryResults && (
        <div className="border-t border-border pt-4 space-y-3">
          {/* WhatsApp sub-input */}
          {showWhatsappInput ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ml-[52px] flex gap-2 items-end">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs text-muted-foreground">Your WhatsApp number</Label>
                <Input
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="e.g., 0712345678"
                  type="tel"
                  className="h-11 rounded-xl border-2"
                  onKeyDown={(e) => e.key === "Enter" && handleWhatsappSubmit()}
                />
              </div>
              <Button onClick={handleWhatsappSubmit} disabled={!whatsappNumber.trim()} className="rounded-full h-11 px-6">
                Find My Bursaries 🎉
              </Button>
            </motion.div>
          ) : question.type === "single" ? (
            <AgentOptionChips options={question.options!} onSelect={handleSelect} />
          ) : (
            <AgentTextInput type={question.type} placeholder={question.placeholder} onSubmit={handleTextSubmit} />
          )}

          {/* Skip button */}
          {question.skippable && !showWhatsappInput && (
            <button
              onClick={handleSkip}
              className="ml-[52px] flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipForward className="w-3 h-3" />
              Skip this question
            </button>
          )}
        </div>
      )}

      {/* Start over after results */}
      {bursaryResults && !isLoading && (
        <div className="border-t border-border pt-4 flex justify-center">
          <Button variant="outline" onClick={resetQuiz} className="rounded-full px-6">
            Start Over
          </Button>
        </div>
      )}
    </div>
    </>
  );
};

export default Bursaries;
