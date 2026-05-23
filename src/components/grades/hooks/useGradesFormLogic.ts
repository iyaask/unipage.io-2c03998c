
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubjectGrade {
  subject: string;
  grade: string;
  marks: string;
}

export const useGradesFormLogic = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [countryOfStudy, setCountryOfStudy] = useState<string>("");
  const [curriculum, setCurriculum] = useState<string>("");
  const [subjectGrades, setSubjectGrades] = useState<Array<SubjectGrade>>(
    Array(10).fill(null).map(() => ({
      subject: "",
      grade: "",
      marks: ""
    }))
  );
  const [totalGrade, setTotalGrade] = useState<number>(0);
  const [averageMarks, setAverageMarks] = useState<number>(0);
  const [coursesQualified, setCoursesQualified] = useState<string>("");
  const { user } = useAuth();

  const subjectsList = ["Mathematics", "Physical Sciences", "Life Sciences", "Accounting", "Business Studies", "Economics", "Geography", "History", "English", "Afrikaans", "Zulu", "Xhosa", "Sotho", "Tswana", "Computer Applications Technology", "Information Technology", "Tourism", "Agricultural Sciences", "Engineering Graphics & Design", "Visual Arts", "Dramatic Arts", "Music"];

  const calculateAPSFromMarks = (mark: string): string => {
    const markValue = parseInt(mark, 10);
    if (markValue >= 80) return "7";
    if (markValue >= 70) return "6";
    if (markValue >= 60) return "5";
    if (markValue >= 50) return "4";
    if (markValue >= 40) return "3";
    if (markValue >= 30) return "2";
    return "1";
  };

  const getAvailableSubjects = (currentIndex: number) => {
    const selectedSubjects = subjectGrades.filter((_, index) => index !== currentIndex).map(item => item.subject);
    return subjectsList.filter(subject => !selectedSubjects.includes(subject));
  };

  const handleSubjectChange = (value: string, index: number) => {
    const newSubjectGrades = [...subjectGrades];
    newSubjectGrades[index] = {
      ...newSubjectGrades[index],
      subject: value
    };
    setSubjectGrades(newSubjectGrades);
  };

  const handleMarksChange = (value: string, index: number) => {
    const newSubjectGrades = [...subjectGrades];
    newSubjectGrades[index] = {
      ...newSubjectGrades[index],
      marks: value,
      grade: calculateAPSFromMarks(value)
    };
    setSubjectGrades(newSubjectGrades);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasSelectedSubjects = subjectGrades.some(item => item.subject !== "" && item.grade !== "" && item.marks !== "");
    if (!hasSelectedSubjects) {
      toast.error("Please select at least one subject, grade, and marks before submitting");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to submit grades");
      return;
    }

    setIsSubmitting(true);

    try {
      const filledSubjectGrades = subjectGrades.filter(item => item.subject !== "" && item.grade !== "" && item.marks !== "");
      const payload = {
        countryOfStudy,
        curriculum,
        subjectGrades: filledSubjectGrades,
        totalGrade,
        averageMarks,
        userId: user.id
      };

      await supabase.from('profiles').update({
        marks: JSON.stringify(payload)
      }).eq('id', user.id);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }

        const webhookUrl = "https://primary-production-4a757.up.railway.app/webhook/grades";
        const webhookResponse = await fetch(webhookUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        if (webhookResponse.ok) {
          const responseText = await webhookResponse.text();
          setCoursesQualified(responseText);
        } else {
          setCoursesQualified("Failed to fetch course recommendations. Please try again.");
        }
      } catch {
        setCoursesQualified("Error connecting to course recommendation service. Please try again.");
      }

      const successResponse = {
        message: "Grades submitted successfully!",
        summary: `Total APS: ${totalGrade}, Average Marks: ${averageMarks}%`,
        subjects: filledSubjectGrades.length
      };

      await supabase.from('profiles').update({
        output: JSON.stringify(successResponse)
      }).eq('id', user.id);

      toast.success("Grades submitted successfully!");
    } catch (error) {
      console.error("Error submitting grades:", error);
      toast.error("Failed to submit grades. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const loadStoredFormData = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase.from('profiles').select('marks').eq('id', user.id).single();
        if (error) {
          return;
        }
        if (data?.marks) {
          try {
            const parsedData = JSON.parse(data.marks);
            if (parsedData.countryOfStudy) setCountryOfStudy(parsedData.countryOfStudy);
            if (parsedData.curriculum) setCurriculum(parsedData.curriculum);
            if (parsedData.subjectGrades) {
              const newSubjectGrades = [...subjectGrades];
              parsedData.subjectGrades.forEach((item: any, index: number) => {
                if (index < newSubjectGrades.length) {
                  newSubjectGrades[index] = item;
                  if (item.marks && (!item.grade || item.grade !== calculateAPSFromMarks(item.marks))) {
                    newSubjectGrades[index].grade = calculateAPSFromMarks(item.marks);
                  }
                }
              });
              setSubjectGrades(newSubjectGrades);
            }
          } catch {
            // ignore malformed stored data
          }
        }
      } catch {
        // ignore load errors
      }
    };
    loadStoredFormData();
  }, [user]);

  useEffect(() => {
    const validMarks = subjectGrades.filter(item => item.marks !== "").map(item => parseInt(item.marks));
    if (validMarks.length > 0) {
      const sum = validMarks.reduce((acc, curr) => acc + curr, 0);
      setAverageMarks(Math.round(sum / validMarks.length));
    } else {
      setAverageMarks(0);
    }
    const total = subjectGrades.reduce((sum, item) => {
      const apsValue = parseInt(item.grade) || 0;
      return sum + apsValue;
    }, 0);
    setTotalGrade(total);
  }, [subjectGrades]);

  return {
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
  };
};
