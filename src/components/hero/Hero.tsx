import { ArrowRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import ActionButton from "../common/ActionButton";
import graduationStudents from "@/assets/graduation-hero-optimized.webp";
import graduateFemale from "@/assets/graduate-female-optimized.webp";
import graduateMale from "@/assets/graduate-male-optimized.webp";

interface HeroProps {
  onCheckEligibility: () => void;
}

const Hero = ({ onCheckEligibility }: HeroProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard/profile");
    } else {
      navigate("/auth");
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left side - Phone mockups */}
          <div className="relative flex justify-center lg:justify-start">
            <div className="relative w-full max-w-lg">
              <div className="relative z-30 mx-auto w-64 h-[500px] bg-black rounded-[2.5rem] p-2 shadow-2xl animate-float">
                <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
                  <div className="h-full relative">
                    <img src={graduationStudents} alt="African students in graduation caps celebrating" className="w-full h-full object-cover" loading="eager" decoding="async" />
                  </div>
                </div>
              </div>

              <div className="absolute -left-8 top-16 z-20 w-48 h-80 bg-black rounded-[2rem] p-2 shadow-xl transform rotate-[-15deg] animate-float-delayed">
                <div className="w-full h-full bg-white rounded-[1.5rem] overflow-hidden">
                  <div className="h-full relative">
                    <img src={graduateFemale} alt="Female graduate" className="w-full h-full object-cover" loading="eager" decoding="async" />
                  </div>
                </div>
              </div>

              <div className="absolute -right-8 top-24 z-10 w-48 h-80 bg-black rounded-[2rem] p-2 shadow-xl transform rotate-[15deg] animate-float-slow">
                <div className="w-full h-full bg-white rounded-[1.5rem] overflow-hidden">
                  <div className="h-full relative">
                    <img src={graduateMale} alt="Male graduate" className="w-full h-full object-cover" loading="eager" decoding="async" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                AI Agents for Student Funding
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
                AI agents that find &amp; apply to bursaries{" "}
                <span className="text-white">for you</span>
              </h1>
              <p className="max-w-lg mx-auto lg:mx-0 text-lg md:text-xl text-gray-300 leading-relaxed">
                Stop searching. Our AI agents automatically discover, match, and apply to bursaries across all South African universities — so you can focus on your studies.
              </p>
            </div>

          </div>
        </div>

        <div className="flex justify-center mt-16">
          <button
            onClick={onCheckEligibility}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 transition-all duration-300 text-white/80 font-medium"
          >
            <ChevronDown className="w-4 h-4 animate-bounce" />
            Get started
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
