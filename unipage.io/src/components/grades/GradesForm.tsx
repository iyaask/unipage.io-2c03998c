
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const formSchema = z.object({
  countryOfStudy: z.string().min(2, "Please select a country"),
  curriculum: z.string().min(2, "Please select a curriculum"),
  subjects: z.string().min(2, "Please list at least one subject"),
  marks: z.string().min(1, "Please enter your marks"),
});

const countries = [
  "South Africa",
];

const saCurriculums = [
  { id: "nsc", name: "NSC – National Senior Certificate" },
  { id: "ieb", name: "IEB – Independent Examinations Board" },
  { id: "ib", name: "IB – International Baccalaureate" },
  { id: "cambridge", name: "Cambridge (A Levels)" },
];

type GradesFormValues = z.infer<typeof formSchema>;

const GradesForm = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<GradesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      countryOfStudy: "",
      curriculum: "",
      subjects: "",
      marks: "",
    },
  });

  const onSubmit = async (data: GradesFormValues) => {
    setIsSubmitting(true);
    
    try {
      toast.success("Grades submitted successfully!");
      form.reset();
      setSelectedCountry("");
    } catch (error) {
      console.error("Error submitting grades:", error);
      toast.error("Failed to submit grades. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    form.setValue("countryOfStudy", value);
    form.setValue("curriculum", "");
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 bg-card rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Enter Your Grades</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="countryOfStudy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country of Study</FormLabel>
                <Select onValueChange={handleCountryChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-black text-white border-gray-700 hover:bg-gray-900">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-black text-white border-gray-700">
                    {countries.map((country) => (
                      <SelectItem 
                        key={country} 
                        value={country}
                        className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer"
                      >
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="curriculum"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Curriculum Studied</FormLabel>
                {selectedCountry === "South Africa" ? (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-black text-white border-gray-700 hover:bg-gray-900">
                        <SelectValue placeholder="Select a curriculum" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-black text-white border-gray-700">
                      {saCurriculums.map((curriculum) => (
                        <SelectItem 
                          key={curriculum.id} 
                          value={curriculum.name}
                          className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer"
                        >
                          {curriculum.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <FormControl>
                    <Input
                      placeholder="e.g., IB, A-Levels, National Curriculum"
                      {...field}
                    />
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subjects"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subjects Studied</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="List your subjects (one per line)"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="marks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marks Obtained</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your marks for each subject"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full md:w-auto" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Grades"}
          </Button>
        </form>
      </Form>

      {/* Courses Qualified Section */}
      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Courses Qualified</h3>
        <Textarea
          className="w-full min-h-[300px] p-4 bg-white dark:bg-gray-800 rounded-md text-base resize-none"
          placeholder="Your qualified courses will appear here after analysis..."
          readOnly
          value=""
        />
      </div>
    </div>
  );
};

export default GradesForm;
