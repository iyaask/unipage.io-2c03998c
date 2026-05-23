
import BackButton from "@/components/navigation/BackButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import CoursesLoading from "@/components/courses/CoursesLoading";
import CoursesError from "@/components/courses/CoursesError";
import CoursesResults, { CoursesResultsEmpty } from "@/components/courses/CoursesResults";
import CoursesNote from "@/components/courses/CoursesNote";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/seo/SEOHead";

const Courses = () => {
  const [qualificationData, setQualificationData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Function to fetch user's qualification results from Supabase
  const fetchQualificationResults = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error("You must be logged in to view your qualification results");
      }

      // Fetch the user's profile data from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('output')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile data:", profileError);
        throw new Error("Failed to fetch your qualification data");
      }

      // Redacted sensitive log: profile data should not be logged in client

      if (profileData && profileData.output) {
        // Redacted sensitive log: qualification data should not be logged in client
        
        // Handle the data regardless of its type (string, object, etc.)
        setQualificationData(profileData.output);
        toast.success("Qualification results loaded successfully!");
      } else {
        // Redacted: avoid logging absence of user data with specifics
        setQualificationData(null);
        setError("No qualification results found. Please submit your grades in the Subjects & Grades section.");
      }
    } catch (err: any) {
      console.error("Error fetching qualification results:", err);
      setError(err.message || "Failed to fetch your qualification results");
      setQualificationData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch grades when component mounts or user changes
  useEffect(() => {
    fetchQualificationResults();
  }, [user]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Your Qualifying Courses - Personalized Results",
    "description": "View university courses and programs you qualify for based on your academic grades and profile",
    "url": "https://unipage.io/courses"
  };

  return (
    <>
      <SEOHead
        title="Your Qualifying Courses - Personalized Results"
        description="View university courses and programs you qualify for based on your academic grades and profile. Get personalized course recommendations powered by AI."
        keywords="qualifying courses, university programs, course eligibility, academic qualifications, course recommendations"
        structuredData={structuredData}
      />
      <div className="container mx-auto py-6 px-4 md:px-6 relative">
      <BackButton fallbackPath="/dashboard" />
      <h1 className="text-3xl font-bold mb-8 mt-12">Courses</h1>

      <Card className="max-w-4xl mx-auto mb-8">
        <CardHeader className="bg-violet-700 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8" />
            <div>
              <CardTitle className="text-xl md:text-2xl">
                University Courses and Qualifications You Qualify For
              </CardTitle>
              <CardDescription className="text-violet-100 mt-1">
                Based on your submitted subjects and grades
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-end mb-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchQualificationResults}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {loading ? (
            <CoursesLoading />
          ) : error ? (
            <CoursesError error={error} />
          ) : qualificationData ? (
            <CoursesResults result={qualificationData} />
          ) : (
            <CoursesResultsEmpty />
          )}

          <CoursesNote />
        </CardContent>
      </Card>
      </div>
    </>
  );
};

export default Courses;
