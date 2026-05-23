
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CoursesResultsProps {
  result: any;
}

const CoursesResults = ({ result }: CoursesResultsProps) => {
  let resultText = "";
  
  // Handle different data types of the result
  if (typeof result === 'string') {
    resultText = result;
  } else if (typeof result === 'object') {
    try {
      resultText = JSON.stringify(result, null, 2);
    } catch (e) {
      resultText = "Error formatting result data";
    }
  }

  // Check if resultText is empty or undefined
  if (!resultText || resultText === 'null' || resultText === '""' || resultText === '{}') {
    return <CoursesResultsEmpty />;
  }

  // Format text with line breaks for display
  const formattedText = resultText
    .replace(/\\n/g, '\n')  // Replace \n escape sequences with actual line breaks
    .split('\n')            // Split into array by line breaks
    .map((line, i) => <p key={i} className="mb-1">{line}</p>); // Create paragraph elements

  // Function to identify university sections and display them better
  const renderFormattedContent = () => {
    if (resultText && resultText.includes('University')) {
      return (
        <div className="space-y-6">
          {formattedText}
        </div>
      );
    }
    
    // Fallback to textarea if we can't format it nicely
    return (
      <Textarea
        className="w-full min-h-[300px] p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-base font-mono"
        value={resultText}
        readOnly
      />
    );
  };

  return (
    <div className="space-y-4">
      <Card className="border border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="prose dark:prose-invert max-w-none">
            {renderFormattedContent()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoursesResults;

export const CoursesResultsEmpty = () => (
  <Alert variant="default" className="mt-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
    <AlertCircle className="h-4 w-4 text-blue-600" />
    <AlertTitle>No results yet</AlertTitle>
    <AlertDescription>
      Please submit your grades in the Subjects & Grades section to see your qualification results.
    </AlertDescription>
  </Alert>
);
