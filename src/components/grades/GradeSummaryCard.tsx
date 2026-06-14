
import { Calculator } from "lucide-react";

interface GradeSummaryCardProps {
  title: string;
  value: number | string;
  suffix?: string;
}

const GradeSummaryCard = ({ title, value, suffix = "" }: GradeSummaryCardProps) => {
  return (
    <div className="mt-6 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 p-4 rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-slate-700 dark:text-slate-400" />
          <span className="font-medium">{title}:</span>
        </div>
        <span className="text-xl font-bold text-slate-700 dark:text-slate-400">
          {value}{suffix}
        </span>
      </div>
    </div>
  );
};

export default GradeSummaryCard;
