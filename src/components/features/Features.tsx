import { CheckCircle, Bot, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const Features = () => {
  const [loading, setLoading] = useState(true);
  const [animationCycle, setAnimationCycle] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      const animationInterval = setInterval(() => {
        setAnimationCycle((prev) => prev + 1);
      }, 10000);
      return () => clearInterval(animationInterval);
    }
  }, [loading]);

  const features = [
    {
      icon: <Bot className="h-8 w-8 text-emerald-400" />,
      title: "AI-Agent Architecture",
      description:
        "Purpose-built AI agents that scrape, analyze, and match bursaries in real-time — not just a search engine, a system that works for you 24/7.",
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-400" />,
      title: "10x Faster Than Manual Search",
      description:
        "Students spend 40+ hours searching for funding. Our agents surface every opportunity you qualify for in under 2 minutes.",
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-slate-400" />,
      title: "Addressing a $2.1B Funding Gap",
      description:
        "Billions in bursaries go unclaimed every year because students don't know they exist. Our agents close that gap automatically.",
    },
  ];

  const FeatureLoader = ({ delay = 0 }: { delay?: number }) => {
    const items = Array.from({ length: 9 });
    return (
      <div className="flex justify-center items-center h-48">
        <div className="grid grid-cols-3 grid-rows-3 w-[67.2px] h-[67.2px]">
          {items.map((_, index) => (
            <div
              key={index}
              className="bg-primary"
              style={{
                animation: `flipping-${delay} 1.5s ${index * 0.1 + delay * 0.2}s infinite backwards`,
              }}
            />
          ))}
        </div>
        <style>
          {`
            @keyframes flipping-${delay} {
              0% { transform: perspective(67.2px) rotateX(-90deg); }
              50%, 75% { transform: perspective(67.2px) rotateX(0); }
              100% { opacity: 0; transform: perspective(67.2px) rotateX(0); }
            }
          `}
        </style>
      </div>
    );
  };

  return (
    <section className="py-20 bg-gradient-to-b from-blue-900 to-blue-800">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why AI Agents, Not Just Search?
          </h2>
          <p className="text-gray-300 text-lg">
            Traditional scholarship websites list opportunities. Our AI agents actively work to find and secure funding for every student.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 animate-fade-up">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm shadow-lg border border-white/20"
                >
                  <FeatureLoader delay={index} />
                </div>
              ))
            : features.map((feature, index) => {
                const animationClasses = [
                  "animate-rotate-scale-up-diag-2",
                  "animate-flip-scale-up-hor",
                  "animate-swirl-in-fwd",
                ];
                return (
                  <div
                    key={`${index}-${animationCycle}`}
                    className={`p-6 rounded-2xl bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20 animate-fade-in ${animationClasses[index]}`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-300">{feature.description}</p>
                  </div>
                );
              })}
        </div>
      </div>
    </section>
  );
};

export default Features;
