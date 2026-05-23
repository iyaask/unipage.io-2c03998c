import SEOHead from "@/components/seo/SEOHead";
import LandingNav from "@/components/nav/LandingNav";

const Privacy = () => {
  return (
    <>
      <SEOHead
        title="Privacy Policy - Data Protection & Security"
        description="Read unipage.io's privacy policy to understand how we protect your personal information and data when using our AI bursary matching platform."
        keywords="privacy policy, data protection, security, unipage privacy, student data"
      />
      <div className="min-h-screen bg-background">
        <LandingNav />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>
            <div className="prose prose-lg mx-auto">
              <p className="text-sm text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>
              
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              <p className="mb-6">
                We collect information you provide directly to us, such as when you create an account, 
                fill out your academic profile, or contact us for support.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="mb-6">
                We use the information we collect to provide, maintain, and improve our services, 
                including matching you with relevant bursary opportunities.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <p className="mb-6">
                We implement appropriate security measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="mb-6">
                If you have any questions about this Privacy Policy, please contact us through our website.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Privacy;