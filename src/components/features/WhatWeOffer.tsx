import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import featureDiscover from "@/assets/feature-discover-v2.jpg";
import featureMatch from "@/assets/feature-match.webp";
import featureAlerts from "@/assets/feature-alerts-v2.jpg";
import featureApply from "@/assets/feature-apply-v2.jpg";

const steps = [
{
  number: "01",
  label: "Discover",
  title: "Auto-discover every bursary",
  description:
  "Our AI agents continuously scrape and index bursary opportunities from all 26 SA universities, government portals, and private funders — so you never miss a deadline.",
  image: featureDiscover
},
{
  number: "02",
  label: "Match",
  title: "Smart-match to your profile",
  description:
  "The agent analyzes your grades, financial background, and demographics to instantly match you with every bursary you qualify for — with a 94% accuracy rate.",
  image: featureMatch
},
{
  number: "03",
  label: "Alert",
  title: "Real-time deadline alerts",
  description:
  "Get instant notifications when new bursaries match your profile, deadlines approach, or application status changes. Your AI agent watches so you don't have to.",
  image: featureAlerts
},
{
  number: "04",
  label: "Apply",
  title: "Auto-apply on your behalf",
  description:
  "Our agents will soon auto-fill and submit bursary applications for you — you review, approve, and let the AI handle the paperwork.",
  image: featureApply,
  comingSoon: true
}];


const StepCard = ({
  step,
  index



}: {step: (typeof steps)[0];index: number;}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [80, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.92, 1]);
  const imageX = useTransform(
    scrollYProgress,
    [0, 0.6],
    [index % 2 === 0 ? -60 : 60, 0]
  );
  const imageOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y, scale }}
      className={`flex flex-col ${
      isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8 md:gap-16 py-12 md:py-20`
      }>
      
      {/* Image side */}
      <motion.div
        style={{ x: imageX, opacity: imageOpacity }}
        className="w-full md:w-1/2">
        
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative overflow-hidden rounded-2xl bg-[hsl(240,10%,12%)] border border-white/5">
            <img
              src={step.image}
              alt={step.title}
              className="w-full h-[260px] md:h-[360px] object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy" />
            
            {/* Floating chat bubble overlay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10">
              
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/80 text-xs font-medium">
                  {step.comingSoon ? "Coming soon — agent in development" : "Agent actively working"}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Text side */}
      <div className="w-full md:w-1/2 space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-5xl md:text-7xl font-black text-white/[0.06] select-none leading-none">
            {step.number}
          </span>
          <div className="flex items-center gap-2">
            {step.comingSoon &&
            <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/20 text-primary px-2.5 py-1 rounded-full">
                Soon
              </span>
            }
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {step.label}
            </span>
          </div>
        </div>

        <h3 className="text-2xl md:text-4xl font-bold text-white leading-tight">
          {step.title}
        </h3>

        <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-md">
          {step.description}
        </p>
      </div>
    </motion.div>);

};

const WhatWeOffer = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-32 overflow-hidden"
      style={{ backgroundColor: "hsl(240, 10%, 6%)" }}>
      
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
          "linear-gradient(hsl(0,0%,100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0,0%,100%) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
      

      {/* Gradient glow orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto text-center mb-16 md:mb-24">
          
          

          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            <span className="text-white/40">Your bursary search evolves.</span>
            <br />
            Your AI agent handles it all.
          </h2>
          <p className="mt-5 text-white/50 text-base md:text-lg max-w-xl mx-auto">
            From discovery to application — our agents work around the clock so you can focus on studying.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-6xl mx-auto">
          {steps.map((step, i) =>
          <StepCard key={step.number} step={step} index={i} />
          )}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-12 md:mt-20">
          
          <button
            onClick={() => navigate("/dashboard")}
            className="group inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:shadow-[0_0_40px_hsl(270,80%,57%,0.4)]">
            
            Get started free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>);

};

export default WhatWeOffer;