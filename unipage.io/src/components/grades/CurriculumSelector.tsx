
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CurriculumSelectorProps {
  value: string;
  onChange: (value: string) => void;
  countryOfStudy: string;
}

const CurriculumSelector = ({ value, onChange, countryOfStudy }: CurriculumSelectorProps) => {
  const saCurriculums = ["NSC – National Senior Certificate", "IEB – Independent Examinations Board", "IB – International Baccalaureate", "Cambridge (A Levels)"];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Curriculum Studied</label>
      {countryOfStudy === "South Africa" ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="bg-zinc-900 text-white hover:bg-zinc-800 transition-colors">
            <SelectValue placeholder="Select Curriculum" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 text-white border-zinc-700">
            {saCurriculums.map(curr => 
              <SelectItem key={curr} value={curr} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
                {curr}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      ) : (
        <input 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className="w-full bg-zinc-900 text-white rounded-md px-3 py-2 border border-zinc-700" 
          placeholder="e.g., National Curriculum" 
        />
      )}
    </div>
  );
};

export default CurriculumSelector;
