
import SubjectGradeRow from "./SubjectGradeRow";

interface SubjectGrade {
  subject: string;
  grade: string;
  marks: string;
}

interface SubjectGradesListProps {
  subjectGrades: SubjectGrade[];
  onSubjectChange: (value: string, index: number) => void;
  onMarksChange: (value: string, index: number) => void;
  getAvailableSubjects: (index: number) => string[];
}

const SubjectGradesList = ({ 
  subjectGrades, 
  onSubjectChange, 
  onMarksChange, 
  getAvailableSubjects 
}: SubjectGradesListProps) => {
  return (
    <div className="space-y-3">
      <div className="pt-2">
        <h3 className="text-sm font-medium mb-2">Subjects with their APS</h3>
      </div>

      {subjectGrades.map((item, index) => (
        <SubjectGradeRow
          key={index}
          subject={item.subject}
          marks={item.marks}
          grade={item.grade}
          index={index}
          onSubjectChange={onSubjectChange}
          onMarksChange={onMarksChange}
          availableSubjects={getAvailableSubjects(index)}
        />
      ))}
    </div>
  );
};

export default SubjectGradesList;
