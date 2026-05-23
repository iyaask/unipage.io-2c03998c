
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SubjectGradeRowProps {
  subject: string;
  marks: string;
  grade: string;
  index: number;
  onSubjectChange: (value: string, index: number) => void;
  onMarksChange: (value: string, index: number) => void;
  availableSubjects: string[];
}

const SubjectGradeRow = ({ 
  subject, 
  marks, 
  grade, 
  index, 
  onSubjectChange, 
  onMarksChange, 
  availableSubjects 
}: SubjectGradeRowProps) => {
  const marksList = Array.from({ length: 100 }, (_, i) => (i + 1).toString());

  return (
    <div className="flex gap-2">
      <Select value={subject} onValueChange={value => onSubjectChange(value, index)}>
        <SelectTrigger className="bg-zinc-900 text-white hover:bg-zinc-800 transition-colors">
          <SelectValue placeholder="Select Subject" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 text-white border-zinc-700">
          {availableSubjects.map(subjectOption => 
            <SelectItem key={`${subjectOption}-${index}`} value={subjectOption} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer text-white">
              {subjectOption}
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      <Select value={marks} onValueChange={value => onMarksChange(value, index)}>
        <SelectTrigger className="w-24 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors">
          <SelectValue placeholder="Marks" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 text-white border-zinc-700">
          {marksList.map(mark => 
            <SelectItem key={`mark-${mark}-${index}`} value={mark} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer text-white">
              {mark}%
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      <div className="w-24 bg-zinc-900 text-white rounded-md px-3 py-2 flex items-center justify-center font-medium">
        APS: {grade || '-'}
      </div>
    </div>
  );
};

export default SubjectGradeRow;
