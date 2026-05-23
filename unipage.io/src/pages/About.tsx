import SEOHead from "@/components/seo/SEOHead";
import LandingNav from "@/components/nav/LandingNav";

const About = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "unipage.io",
    "description": "AI-powered bursary and scholarship matching platform for African universities",
    "url": "https://unipage.io",
    "logo": "https://unipage.io/lovable-uploads/2ac3f1e4-64b5-4559-a6f7-899a09d9442c.png"
  };

  return (
    <>
      <SEOHead
        title="About Us - AI-Powered Bursary Matching"
        description="Learn about unipage.io, the leading AI platform connecting African students with bursary and scholarship opportunities across universities."
        keywords="about unipage, AI bursary matching, African education, scholarship platform, student funding"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-background">
        <LandingNav />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8">About unipage.io</h1>
            <div className="prose prose-lg mx-auto">
              <p className="text-lg mb-6">
                unipage.io is revolutionizing how African students discover and access bursary opportunities. 
                Our AI-powered platform connects students with the perfect funding options for their educational journey.
              </p>
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="mb-6">
                To democratize access to higher education funding across Africa by leveraging artificial intelligence 
                to match students with relevant bursary and scholarship opportunities.
              </p>
              <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
              <p className="mb-6">
                Our intelligent matching system analyzes your academic profile, interests, and goals to recommend 
                the most suitable funding opportunities from universities across Africa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;