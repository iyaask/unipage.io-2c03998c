
import React from "react";
import { RefreshCw } from "lucide-react";

const CoursesLoading = () => (
  <div className="min-h-[300px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
    <div className="text-center">
      <RefreshCw className="h-8 w-8 animate-spin text-slate-600 mx-auto mb-2" />
      <p className="text-sm text-gray-600 dark:text-gray-300">Loading your qualification results...</p>
    </div>
  </div>
);

export default CoursesLoading;
