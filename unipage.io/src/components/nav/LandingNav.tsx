import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import logoOptimized from "@/assets/logo-optimized.webp";
import { Menu, X } from "lucide-react";

const LandingNav = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "Features", action: () => scrollTo("features-section") },
    { label: "About", action: () => scrollTo("about-section") },
    { label: "Contact", action: () => scrollTo("contact-section") },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => { navigate("/"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center gap-2 group"
          >
            <img
              src={logoOptimized}
              alt="Unipage Logo"
              className="h-8 sm:h-10 w-auto unipage-logo"
              width="64"
              height="64"
            />
            <h1 className="text-lg sm:text-2xl font-bold unipage-title truncate">unipage.io</h1>
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Button
                onClick={() => navigate("/dashboard")}
                className="rounded-full px-6 h-9 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="rounded-full px-5 h-9 text-sm font-medium border-primary/40 text-primary hover:bg-primary/5"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate("/auth")}
                  className="rounded-full px-5 h-9 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border/60 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-3 border-t border-border/60 mt-2 flex flex-col gap-2">
              {user ? (
                <Button
                  onClick={() => { setMobileOpen(false); navigate("/dashboard"); }}
                  className="rounded-full h-10 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground w-full"
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => { setMobileOpen(false); navigate("/auth"); }}
                    className="rounded-full h-10 text-sm font-medium border-primary/40 text-primary hover:bg-primary/5 w-full"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => { setMobileOpen(false); navigate("/auth"); }}
                    className="rounded-full h-10 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground w-full"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNav;
