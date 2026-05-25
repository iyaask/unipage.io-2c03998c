import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "What is unipage.io?",
    answer:
      "unipage.io is an AI-agent platform that automatically finds, matches, and will soon apply to bursaries for South African students. Think of it as a personal funding assistant that works for you 24/7.",
  },
  {
    question: "How is this different from scholarship websites?",
    answer:
      "Traditional sites are just databases you search manually. Our AI agents actively scrape, filter, and match bursaries to your specific profile — and alert you instantly. You don't search; the agent searches for you.",
  },
  {
    question: "Is unipage.io free to use?",
    answer:
      "Yes! Our core AI agent features — bursary discovery, matching, and deadline alerts — are free for all students. We believe every student deserves equal access to funding.",
  },
  {
    question: "How does the AI agent find bursaries?",
    answer:
      "Our agents continuously scrape bursary listings from all 26 SA universities, government portals, corporate funders, and NGOs. They analyze eligibility criteria and match them against your profile automatically.",
  },
  {
    question: "What information do I need to provide?",
    answer:
      "Just your academic grades, field of study interest, and basic demographic info. The more you share, the better your agent can match you with relevant opportunities.",
  },
  {
    question: "Will the AI agent apply to bursaries for me?",
    answer:
      "Auto-apply is on our roadmap. Soon, your agent will pre-fill applications and submit them on your behalf — you just review and approve before they go out.",
  },
  {
    question: "Which universities and funders are covered?",
    answer:
      "We cover all 26 public South African universities plus major private funders like NSFAS, Sasol, Old Mutual, Allan Gray, and hundreds more. Our agents are always adding new sources.",
  },
];

const FAQ = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full mb-5">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">FAQ</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-muted-foreground text-base md:text-lg">
            Got questions? We've got answers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqData.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-xl px-5 md:px-6 bg-card shadow-sm hover:shadow-md transition-shadow duration-300 data-[state=open]:shadow-md"
              >
                <AccordionTrigger className="text-left text-foreground font-semibold text-sm md:text-base py-4 md:py-5 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm md:text-base leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
