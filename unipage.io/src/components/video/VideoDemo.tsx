import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play } from "lucide-react";
import { useState } from "react";

const VideoDemo = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.9, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-32 overflow-hidden bg-background"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto text-center mb-12 md:mb-16"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-primary mb-4">
            See it in action
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight leading-[1.1]">
            Watch how our AI agents work
          </h2>
          <p className="mt-5 text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            A quick walkthrough of how our platform finds and matches bursaries for you automatically.
          </p>
        </motion.div>

        {/* Video container */}
        <motion.div
          style={{ opacity, scale }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl bg-card aspect-video">
            {!isPlaying ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                {/* Decorative elements */}
                <div className="absolute inset-0">
                  <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
                  <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/5 rounded-full blur-[80px]" />
                </div>

                {/* Placeholder content */}
                <div className="relative z-10 text-center space-y-6">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsPlaying(true)}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary flex items-center justify-center shadow-[0_0_60px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_80px_hsl(var(--primary)/0.6)] transition-shadow duration-300"
                  >
                    <Play className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground ml-1" />
                  </motion.button>
                  <p className="text-muted-foreground text-sm font-medium">Click to play demo</p>
                </div>

                {/* Mock UI elements for visual interest */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3">
                  <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-primary rounded-full" />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">2:34</span>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto animate-pulse">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-white/60 text-sm">Demo video coming soon</p>
                  <button
                    onClick={() => setIsPlaying(false)}
                    className="text-xs text-primary hover:underline"
                  >
                    Go back
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Feature highlights below video */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              { title: "2 min setup", desc: "Enter your details and let the AI work" },
              { title: "Real-time matching", desc: "Instant bursary results tailored to you" },
              { title: "Always watching", desc: "New bursaries found automatically" },
            ].map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center p-4 rounded-xl bg-muted/50 border border-border/50"
              >
                <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                <p className="text-muted-foreground text-xs mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoDemo;
