
import { Calculator } from "lucide-react";

interface GradeSummaryCardProps {
  title: string;
  value: number | string;
  suffix?: string;
}

const GradeSummaryCard = ({ title, value, suffix = "" }: GradeSummaryCardProps) => {
  return (
    <div className="mt-6 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 p-4 rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-violet-700 dark:text-violet-400" />
          <span className="font-medium">{title}:</span>
        </div>
        <span className="text-xl font-bold text-violet-700 dark:text-violet-400">
          {value}{suffix}
        </span>
      </div>
    </div>
  );
};

export default GradeSummaryCard;
