import { ReactNode } from "react";

interface SectionCardProps {
  id: string;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

const SectionCard = ({ id, icon, title, subtitle, action, children }: SectionCardProps) => (
  <section
    id={id}
    className="scroll-mt-24 rounded-2xl border bg-card text-card-foreground shadow-sm p-6 md:p-8"
  >
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
    {children}
  </section>
);

export default SectionCard;
