import { Briefcase, GraduationCap, Sparkles, Award, FolderGit2, User } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Navigate } from "react-router-dom";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileNav from "@/components/profile/ProfileNav";
import SectionCard from "@/components/profile/sections/SectionCard";
import DocumentsSection from "@/components/profile/sections/DocumentsSection";
import ListSection from "@/components/profile/sections/ListSection";
import ApplicationDefaultsSection from "@/components/profile/sections/ApplicationDefaultsSection";

const Profile = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" />;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">My Profile</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_220px]">
        <div className="space-y-6 min-w-0">
          <SectionCard
            id="profile"
            icon={<User className="h-5 w-5" />}
            title="Personal details"
            subtitle="The basics that appear on every application."
          >
            <ProfileForm />
          </SectionCard>

          <DocumentsSection />

          <ListSection
            id="experience"
            icon={<Briefcase className="h-5 w-5" />}
            title="Experience"
            subtitle="Work history and roles."
            table="profile_experience"
            fields={[
              { key: "role", label: "Role", required: true, placeholder: "e.g. Marketing Manager" },
              { key: "company", label: "Company", placeholder: "Company name" },
              { key: "start_date", label: "Start date", placeholder: "e.g. Jan 2022" },
              { key: "end_date", label: "End date", placeholder: "Present" },
              { key: "description", label: "Description", type: "textarea", placeholder: "What you did..." },
            ]}
            renderItem={(r) => (
              <>
                <p className="font-semibold">{r.role}</p>
                <p className="text-sm text-muted-foreground">
                  {r.company}{r.company && (r.start_date || r.end_date) ? " · " : ""}
                  {[r.start_date, r.end_date].filter(Boolean).join(" – ")}
                </p>
                {r.description && <p className="text-sm mt-2 whitespace-pre-wrap">{r.description}</p>}
              </>
            )}
          />

          <ListSection
            id="education"
            icon={<GraduationCap className="h-5 w-5" />}
            title="Education"
            subtitle="Schools and qualifications."
            table="profile_education"
            fields={[
              { key: "institution", label: "Institution", required: true, placeholder: "University name" },
              { key: "degree", label: "Degree", placeholder: "e.g. BSc" },
              { key: "field", label: "Field of study", placeholder: "e.g. Computer Science" },
              { key: "start_year", label: "Start year", placeholder: "2018" },
              { key: "end_year", label: "End year", placeholder: "2022" },
            ]}
            renderItem={(r) => (
              <>
                <p className="font-semibold">{r.institution}</p>
                <p className="text-sm text-muted-foreground">
                  {[r.degree, r.field].filter(Boolean).join(", ")}
                  {(r.start_year || r.end_year) && ` · ${[r.start_year, r.end_year].filter(Boolean).join(" – ")}`}
                </p>
              </>
            )}
          />

          <ListSection
            id="skills"
            icon={<Sparkles className="h-5 w-5" />}
            title="Skills"
            subtitle="Things you're good at."
            table="profile_skills"
            fields={[
              { key: "name", label: "Skill", required: true, placeholder: "e.g. React" },
              { key: "level", label: "Level", placeholder: "Beginner / Intermediate / Expert" },
            ]}
            renderItem={(r) => (
              <>
                <p className="font-semibold">{r.name}</p>
                {r.level && <p className="text-sm text-muted-foreground">{r.level}</p>}
              </>
            )}
          />

          <ListSection
            id="certifications"
            icon={<Award className="h-5 w-5" />}
            title="Certifications"
            subtitle="Courses and credentials."
            table="profile_certifications"
            fields={[
              { key: "name", label: "Name", required: true, placeholder: "Certification name" },
              { key: "issuer", label: "Issuer", placeholder: "Issuing organization" },
              { key: "issue_date", label: "Issue date", placeholder: "e.g. Mar 2024" },
            ]}
            renderItem={(r) => (
              <>
                <p className="font-semibold">{r.name}</p>
                <p className="text-sm text-muted-foreground">
                  {[r.issuer, r.issue_date].filter(Boolean).join(" · ")}
                </p>
              </>
            )}
          />

          <ListSection
            id="projects"
            icon={<FolderGit2 className="h-5 w-5" />}
            title="Projects"
            subtitle="Selected work and personal projects."
            table="profile_projects"
            fields={[
              { key: "name", label: "Project name", required: true },
              { key: "url", label: "URL", placeholder: "https://..." },
              { key: "description", label: "Description", type: "textarea" },
            ]}
            renderItem={(r) => (
              <>
                <p className="font-semibold">{r.name}</p>
                {r.url && (
                  <a href={r.url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline break-all">
                    {r.url}
                  </a>
                )}
                {r.description && <p className="text-sm mt-2 whitespace-pre-wrap">{r.description}</p>}
              </>
            )}
          />

          <ApplicationDefaultsSection />
        </div>

        <aside className="hidden lg:block">
          <ProfileNav />
        </aside>
      </div>
    </div>
  );
};

export default Profile;
