import { useEffect, useState } from "react";

const items = [
  { id: "profile", label: "Profile" },
  { id: "documents", label: "Documents" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "certifications", label: "Certifications" },
  { id: "projects", label: "Projects" },
  { id: "application-defaults", label: "Application defaults" },
];

const ProfileNav = () => {
  const [active, setActive] = useState("profile");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sticky top-20 space-y-1">
      {items.map((i) => {
        const isActive = active === i.id;
        return (
          <a
            key={i.id}
            href={`#${i.id}`}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isActive ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
            {i.label}
          </a>
        );
      })}
    </nav>
  );
};

export default ProfileNav;
