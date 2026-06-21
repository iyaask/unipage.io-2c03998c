
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import CountrySelector from "./CountrySelector";
import CurriculumSelector from "./CurriculumSelector";
import SubjectGradesList from "./SubjectGradesList";
import GradeSummaryCard from "./GradeSummaryCard";
import { useGradesFormLogic } from "./hooks/useGradesFormLogic";

const GradesAndCoursesForm = () => {
  const {
    isSubmitting,
    countryOfStudy,
    setCountryOfStudy,
    curriculum,
    setCurriculum,
    subjectGrades,
    totalGrade,
    averageMarks,
    coursesQualified,
    setCoursesQualified,
    getAvailableSubjects,
    handleSubjectChange,
    handleMarksChange,
    handleSubmit
  } = useGradesFormLogic();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <CountrySelector 
                value={countryOfStudy} 
                onChange={setCountryOfStudy} 
              />
              
              <CurriculumSelector 
                value={curriculum} 
                onChange={setCurriculum}
                countryOfStudy={countryOfStudy}
              />

              <SubjectGradesList
                subjectGrades={subjectGrades}
                onSubjectChange={handleSubjectChange}
                onMarksChange={handleMarksChange}
                getAvailableSubjects={getAvailableSubjects}
              />
            </div>

            <GradeSummaryCard
              title="Average Marks"
              value={averageMarks}
              suffix="%"
            />

            <GradeSummaryCard
              title="Total APS"
              value={totalGrade}
            />

            <Button 
              type="submit" 
              className="w-full bg-slate-700 hover:bg-slate-800 text-white" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl md:text-4xl font-bold text-primary">
            Courses Qualified
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8">
          <Textarea
            value={coursesQualified}
            onChange={(e) => setCoursesQualified(e.target.value)}
            placeholder="Your qualified courses will appear here after submitting your grades..."
            className="min-h-[400px] md:min-h-[500px] text-base md:text-lg bg-zinc-900 text-white border-zinc-700 placeholder:text-gray-400 p-6 w-full"
            readOnly
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default GradesAndCoursesForm;
