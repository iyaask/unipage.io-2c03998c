import { Marquee } from "@/components/ui/marquee";

const universities = [
  { name: "University of Cape Town", abbr: "UCT", color: "hsl(210, 60%, 35%)" },
  { name: "Stellenbosch University", abbr: "SU", color: "hsl(340, 60%, 35%)" },
  { name: "University of the Witwatersrand", abbr: "Wits", color: "hsl(45, 80%, 40%)" },
  { name: "University of Pretoria", abbr: "UP", color: "hsl(350, 50%, 40%)" },
  { name: "University of KwaZulu-Natal", abbr: "UKZN", color: "hsl(200, 70%, 30%)" },
  { name: "University of Johannesburg", abbr: "UJ", color: "hsl(25, 80%, 45%)" },
  { name: "Rhodes University", abbr: "RU", color: "hsl(270, 50%, 35%)" },
  { name: "University of the Free State", abbr: "UFS", color: "hsl(30, 70%, 40%)" },
  { name: "North-West University", abbr: "NWU", color: "hsl(210, 50%, 40%)" },
  { name: "Nelson Mandela University", abbr: "NMU", color: "hsl(170, 50%, 35%)" },
  { name: "University of the Western Cape", abbr: "UWC", color: "hsl(210, 70%, 40%)" },
  { name: "Tshwane University of Technology", abbr: "TUT", color: "hsl(0, 60%, 40%)" },
  { name: "Cape Peninsula University of Technology", abbr: "CPUT", color: "hsl(200, 60%, 35%)" },
  { name: "Durban University of Technology", abbr: "DUT", color: "hsl(140, 50%, 30%)" },
  { name: "University of South Africa", abbr: "UNISA", color: "hsl(210, 60%, 30%)" },
  { name: "Walter Sisulu University", abbr: "WSU", color: "hsl(120, 40%, 35%)" },
  { name: "University of Limpopo", abbr: "UL", color: "hsl(140, 60%, 30%)" },
  { name: "University of Venda", abbr: "UniVen", color: "hsl(30, 50%, 35%)" },
  { name: "University of Fort Hare", abbr: "UFH", color: "hsl(210, 50%, 30%)" },
  { name: "Mangosuthu University of Technology", abbr: "MUT", color: "hsl(0, 50%, 35%)" },
  { name: "Vaal University of Technology", abbr: "VUT", color: "hsl(220, 60%, 35%)" },
  { name: "Central University of Technology", abbr: "CUT", color: "hsl(10, 60%, 40%)" },
  { name: "Sefako Makgatho Health Sciences University", abbr: "SMU", color: "hsl(160, 50%, 30%)" },
  { name: "Sol Plaatje University", abbr: "SPU", color: "hsl(280, 40%, 35%)" },
  { name: "University of Mpumalanga", abbr: "UMP", color: "hsl(130, 50%, 35%)" },
  { name: "University of Zululand", abbr: "UniZulu", color: "hsl(50, 60%, 35%)" },
];

const UniversityMarquee = () => {
  return (
    <section className="py-10 md:py-14 bg-muted/40">
      <div className="container mx-auto px-4 mb-6">
        <p className="text-center text-sm font-medium text-muted-foreground tracking-wide uppercase">
          Indexing bursaries from all 26 South African universities
        </p>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-muted/40 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-muted/40 to-transparent" />
        <Marquee pauseOnHover className="[--duration:60s]" repeat={3}>
          {universities.map((uni) => (
            <div
              key={uni.name}
              className="mx-3 flex items-center gap-3 rounded-full bg-background px-5 py-2.5 shadow-sm border border-border/50"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                style={{ backgroundColor: uni.color }}
              >
                {uni.abbr.slice(0, 2)}
              </div>
              <span className="text-sm md:text-base font-semibold text-foreground whitespace-nowrap">
                {uni.name}
              </span>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};

export default UniversityMarquee;
