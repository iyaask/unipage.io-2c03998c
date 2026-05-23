
import GradesAndCoursesForm from "@/components/grades/GradesAndCoursesForm";

const Grades = () => {
  return (
    <div className="container mx-auto py-2 md:py-6 px-2 md:px-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-center md:text-left">Grades & Course</h1>
      <GradesAndCoursesForm />
    </div>
  );
};

export default Grades;
