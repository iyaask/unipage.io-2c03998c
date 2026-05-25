
import { ArrowRight } from "lucide-react";

const Process = () => {
  const steps = [
    {
      number: "01",
      title: "Enter Your Marks",
      description: "Input your academic results from high school examinations.",
      color: "accent",
    },
    {
      number: "02",
      title: "Get Instant Results",
      description: "Our system analyzes your eligibility for various courses.",
      color: "highlight",
    },
    {
      number: "03",
      title: "Explore Options",
      description: "Browse through your qualified courses and universities.",
      color: "bright",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            How It Works
          </h2>
          <p className="text-text-secondary text-lg">
            Three simple steps to discover your academic opportunities
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative animate-fade-up">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className={`p-6 rounded-2xl bg-white border border-${step.color}/20 shadow-lg hover:shadow-xl transition-all duration-300 h-full`}>
                <div className={`text-4xl font-bold text-${step.color} mb-4 opacity-70`}>
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-text-secondary">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <ArrowRight className="text-secondary w-8 h-8" />
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Process;
