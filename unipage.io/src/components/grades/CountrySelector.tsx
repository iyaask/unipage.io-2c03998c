
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const CountrySelector = ({ value, onChange }: CountrySelectorProps) => {
  const countries = ["South Africa", "Algeria", "Morocco", "Tunisia", "Ethiopia", "Uganda"];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Country of Study</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-zinc-900 text-white hover:bg-zinc-800 transition-colors">
          <SelectValue placeholder="Select Country" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 text-white border-zinc-700">
          {countries.map(country => 
            <SelectItem key={country} value={country} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
              {country}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CountrySelector;
