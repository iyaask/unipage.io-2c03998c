
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface CoursesErrorProps {
  error: string | null;
}

const CoursesError = ({ error }: CoursesErrorProps) => (
  <div className="min-h-[300px]">
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>No results available yet</AlertTitle>
      <AlertDescription>
        {error}
      </AlertDescription>
    </Alert>
    <Textarea
      className="w-full min-h-[250px] p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-base font-mono"
      placeholder="Your qualification results will appear here after you submit your subjects and grades..."
      readOnly
      value=""
    />
  </div>
);

export default CoursesError;
