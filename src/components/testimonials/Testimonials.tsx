import { User } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";

const testimonials = [
  {
    name: "Sarah M.",
    role: "University Student",
    content: "The AI agent found me 3 bursaries I didn't even know existed. I got funded within weeks!",
    color: "accent",
  },
  {
    name: "Junior K.",
    role: "High School Learner",
    content: "I was stressing about funding for university. The agent matched me with the perfect bursary automatically.",
    color: "primary",
  },
  {
    name: "Michael O.",
    role: "First-Gen Student",
    content: "No more spending hours searching. The AI agent did everything — I just reviewed and applied.",
    color: "highlight",
  },
  {
    name: "Amina H.",
    role: "International Student",
    content: "Finding bursaries across SA universities was impossible before. Now the agent handles it all for me.",
    color: "bright",
  },
];

const TestimonialCard = ({
  name,
  role,
  content,
  color,
}: {
  name: string;
  role: string;
  content: string;
  color: string;
}) => {
  const colorMap: { [key: string]: string } = {
    accent: "#0F172A",
    primary: "#0F172A",
    highlight: "#0F172A",
    bright: "#0F172A",
    secondary: "#0F172A",
  };

  return (
    <div
      className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 w-80 mx-4"
      style={{ borderLeftColor: colorMap[color] }}
    >
      <div className="flex items-center mb-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${colorMap[color]}20` }}
        >
          <User className="w-6 h-6" style={{ color: colorMap[color] }} />
        </div>
        <div className="ml-4">
          <h3 className="font-semibold text-text-primary">{name}</h3>
          <p className="text-sm text-text-secondary">{role}</p>
        </div>
      </div>
      <p className="text-text-secondary">{content}</p>
    </div>
  );
};

const Testimonials = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-primary/5 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Students Love Their AI Agent
          </h2>
          <p className="text-text-secondary text-lg">
            Join thousands of students whose AI agents found them funding they never knew about
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden animate-fade-up">
          <Marquee pauseOnHover className="[--duration:30s]">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:30s] mt-4">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index + testimonials.length} {...testimonial} />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
