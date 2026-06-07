import { useEffect, useMemo, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type OnboardingFormData = {
  fullName: string;
  idNumber: string;
  race: string;
  gender: string;
  disability: boolean;
  province: string;
  university: string;
  faculty: string;
  degree: string;
  yearOfStudy: string;
  gpa: string;
  householdIncome: string;
};

const races = [
  "African",
  "Coloured",
  "Indian",
  "White",
  "Other",
];

const genders = ["Female", "Male", "Non-binary", "Prefer not to say"];

const provinces = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{ name: string; path: string }>>([]);
  const [documentError, setDocumentError] = useState<string | null>(null);

  const form = useForm<OnboardingFormData>({
    defaultValues: {
      fullName: "",
      idNumber: "",
      race: "",
      gender: "",
      disability: false,
      province: "",
      university: "",
      faculty: "",
      degree: "",
      yearOfStudy: "",
      gpa: "",
      householdIncome: "",
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      setIsLoading(true);

      const { data, error } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Failed to load onboarding profile:", error.message);
      }

      if (data) {
        form.reset({
          fullName: data.full_name ?? "",
          idNumber: data.id_number ?? "",
          race: data.race ?? "",
          gender: data.gender ?? "",
          disability: data.disability ?? false,
          province: data.province ?? "",
          university: data.university ?? "",
          faculty: data.faculty ?? "",
          degree: data.degree ?? "",
          yearOfStudy: data.year_of_study ?? "",
          gpa: data.gpa ? String(data.gpa) : "",
          householdIncome: data.household_income ?? "",
        });
        setUploadedDocuments((data.supporting_documents as Array<{ name: string; path: string }>) ?? []);
      }

      setIsLoading(false);
    };

    loadProfile();
  }, [user, form]);

  const documentCountLabel = useMemo(() => {
    if (uploadedDocuments.length === 0) return "No documents uploaded yet.";
    return `${uploadedDocuments.length} supporting document${uploadedDocuments.length > 1 ? "s" : ""} uploaded.`;
  }, [uploadedDocuments.length]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!user || !files || files.length === 0) {
      return [];
    }

    setDocumentError(null);
    const bucket = supabase.storage.from("student-documents");
    const uploads: Array<{ name: string; path: string }> = [];

    for (const file of Array.from(files)) {
      const filename = `${user.id}/${Date.now()}-${file.name}`;
      const { error } = await bucket.upload(filename, file, { upsert: true });
      if (error) {
        setDocumentError(`Upload failed for ${file.name}: ${error.message}`);
        continue;
      }
      uploads.push({ name: file.name, path: filename });
    }

    return uploads;
  };

  const handleStepSubmit = async (values: OnboardingFormData) => {
    if (!user) {
      toast({ title: "Not signed in", description: "Please sign in before completing onboarding.", variant: "destructive" });
      return;
    }

    if (step < 2) {
      setStep((current) => current + 1);
      return;
    }

    setIsLoading(true);
    try {
      const profileData = {
        user_id: user.id,
        full_name: values.fullName,
        id_number: values.idNumber,
        race: values.race,
        gender: values.gender,
        disability: values.disability,
        province: values.province,
        university: values.university,
        faculty: values.faculty,
        degree: values.degree,
        year_of_study: values.yearOfStudy,
        gpa: values.gpa ? Number(values.gpa) : null,
        household_income: values.householdIncome,
        supporting_documents: uploadedDocuments.length > 0 ? uploadedDocuments : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("student_profiles")
        .upsert(profileData as any, { onConflict: "user_id" });

      if (error) {
        throw error;
      }

      toast({ title: "Profile saved", description: "Your student profile is ready." });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: "Unable to save profile", description: error?.message || "Try again.", variant: "destructive" });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-sm text-primary font-semibold uppercase tracking-[0.24em]">Student onboarding</p>
        <h1 className="mt-3 text-3xl font-bold text-foreground">Complete your profile for bursary matching</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          This is the information our AI agents use to discover bursaries and apply on your behalf.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <aside className="space-y-3 rounded-3xl border border-border bg-card p-5">
          {['Personal', 'Academic', 'Financial'].map((label, index) => (
            <div key={label} className={`rounded-2xl p-3 ${step === index ? 'bg-primary/10 border border-primary/20' : 'bg-background'}`}>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Step {index + 1}</p>
              <p className="mt-2 font-semibold text-foreground">{label} details</p>
            </div>
          ))}
        </aside>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleStepSubmit)} className="space-y-6">
              {step === 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input disabled={isLoading} placeholder="Sipho Ndlovu" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID number</FormLabel>
                        <FormControl>
                          <Input disabled={isLoading} placeholder="9001011234087" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="race"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Race</FormLabel>
                        <FormControl>
                          <select
                            disabled={isLoading}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                            {...field}
                          >
                            <option value="">Select race</option>
                            {races.map((race) => (
                              <option key={race} value={race}>{race}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <select
                            disabled={isLoading}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                            {...field}
                          >
                            <option value="">Select gender</option>
                            {genders.map((gender) => (
                              <option key={gender} value={gender}>{gender}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Province</FormLabel>
                        <FormControl>
                          <select
                            disabled={isLoading}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                            {...field}
                          >
                            <option value="">Select province</option>
                            {provinces.map((province) => (
                              <option key={province} value={province}>{province}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="sm:col-span-2">
                    <FormField
                      control={form.control}
                      name="disability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Disability</FormLabel>
                          <FormControl>
                            <label className="inline-flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={field.value}
                                disabled={isLoading}
                                onChange={(event) => field.onChange(event.target.checked)}
                                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                              />
                              <span className="text-sm text-foreground">I have a disability</span>
                            </label>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="university"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>University</FormLabel>
                        <FormControl>
                          <Input disabled={isLoading} placeholder="University of Cape Town" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="faculty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Faculty</FormLabel>
                        <FormControl>
                          <Input disabled={isLoading} placeholder="Engineering" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="degree"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Degree</FormLabel>
                        <FormControl>
                          <Input disabled={isLoading} placeholder="BEng Civil Engineering" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yearOfStudy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year of study</FormLabel>
                        <FormControl>
                          <Input disabled={isLoading} placeholder="2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gpa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GPA</FormLabel>
                        <FormControl>
                          <Input disabled={isLoading} placeholder="4.2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="householdIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Household income</FormLabel>
                        <FormControl>
                          <Input disabled={isLoading} placeholder="R0 - R100 000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Supporting documents</FormLabel>
                    <FormControl>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        disabled={isLoading}
                        onChange={async (event) => {
                          const uploads = await handleFileUpload(event.target.files);
                          if (uploads.length > 0) {
                            setUploadedDocuments((current) => [...current, ...uploads]);
                          }
                          event.target.value = "";
                        }}
                        className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground mt-2">{documentCountLabel}</p>
                    {documentError && <p className="text-sm text-destructive mt-2">{documentError}</p>}
                  </FormItem>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <div className="text-sm text-muted-foreground">
                  Step {step + 1} of 3
                </div>
                <div className="flex gap-3">
                  {step > 0 && (
                    <Button type="button" variant="outline" onClick={() => setStep((current) => current - 1)} disabled={isLoading}>
                      Back
                    </Button>
                  )}
                  <Button type="submit" disabled={isLoading}>
                    {step === 2 ? (isLoading ? "Saving..." : "Finish onboarding") : "Continue"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </section>
      </div>
    </div>
  );
};

export default Onboarding;
