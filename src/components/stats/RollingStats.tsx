import { useEffect, useState, useRef } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface CounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  label: string;
  isVisible: boolean;
}

const Counter = ({ end, suffix = "", prefix = "", duration = 2000, label, isVisible }: CounterProps) => {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * end);

      setCount(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <div className="text-center px-4">
      <div className="text-4xl md:text-6xl font-extrabold text-white mb-2 tracking-tight">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <p className="text-white/80 text-sm md:text-base font-medium max-w-[200px] mx-auto">
        {label}
      </p>
    </div>
  );
};

const RollingStats = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });

  const stats = [
    { end: 26, suffix: "+", label: "Universities Indexed", prefix: "" },
    { end: 500, suffix: "+", label: "Bursaries Found by Agents", prefix: "" },
    { end: 94, suffix: "%", label: "Match Accuracy", prefix: "" },
    { end: 10, suffix: "x", label: "Faster Than Manual Search", prefix: "" },
  ];

  return (
    <section
      ref={ref}
      className="relative py-16 md:py-20 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, hsl(220, 40%, 10%) 0%, hsl(220, 35%, 14%) 50%, hsl(220, 40%, 11%) 100%)",
        clipPath: "polygon(0 8%, 100% 0%, 100% 92%, 0% 100%)",
      }}
    >
      <div className="absolute inset-0 bg-black/10" />

      <div className="container mx-auto px-4 relative z-10">
        <h3 className="text-center text-white text-lg md:text-xl font-semibold mb-10 md:mb-14 tracking-wide">
          What our AI agents have done so far:
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 max-w-5xl mx-auto">
          {stats.map((stat, i) => (
            <Counter
              key={i}
              end={stat.end}
              suffix={stat.suffix}
              prefix={stat.prefix}
              label={stat.label}
              isVisible={isVisible}
              duration={2000 + i * 300}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RollingStats;
