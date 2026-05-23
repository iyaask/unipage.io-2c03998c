import SEOHead from "@/components/seo/SEOHead";
import LandingNav from "@/components/nav/LandingNav";

const Terms = () => {
  return (
    <>
      <SEOHead
        title="Terms of Service - User Agreement"
        description="Read unipage.io's terms of service to understand the rules and guidelines for using our AI-powered bursary matching platform."
        keywords="terms of service, user agreement, terms and conditions, unipage terms"
      />
      <div className="min-h-screen bg-background">
        <LandingNav />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8">Terms of Service</h1>
            <div className="prose prose-lg mx-auto">
              <p className="text-sm text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>
              
              <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
              <p className="mb-6">
                By accessing and using unipage.io, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4">Use License</h2>
              <p className="mb-6">
                Permission is granted to temporarily use unipage.io for personal, non-commercial 
                transitory viewing only.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
              <p className="mb-6">
                Users are responsible for providing accurate information and using the platform 
                in accordance with applicable laws and regulations.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4">Limitations</h2>
              <p className="mb-6">
                In no event shall unipage.io be liable for any damages arising out of the use 
                or inability to use the materials on our website.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;