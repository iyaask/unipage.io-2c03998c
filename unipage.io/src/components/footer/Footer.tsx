import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-8">
          {/* Left - Brand */}
          <div className="space-y-4">
            <Link to="/" className="text-xl font-bold text-foreground">
              unipage.io
            </Link>
            <p className="text-sm text-muted-foreground">
              © Copyright {new Date().getFullYear()} unipage.io
            </p>
            <div className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full text-sm font-medium">
              🤖 AI Agents for Student Funding
            </div>
          </div>

          {/* Middle - Links */}
          <div className="flex flex-col gap-3">
            <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              About Us
            </Link>
            <Link to="/bursaries" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Bursaries
            </Link>
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Dashboard
            </Link>
          </div>

          {/* Right - Legal */}
          <div className="flex flex-col gap-3">
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Terms & Conditions
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Privacy Policy
            </Link>
            <a href="#contact-section" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
