import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  keywords?: string;
  structuredData?: object;
}

const SEOHead = ({ 
  title = "unipage.io - Let AI find the perfect bursary for you",
  description = "Let AI find the perfect bursary for you. Access information about bursary opportunities across African universities with our intelligent matching system.",
  canonical,
  keywords = "bursary, scholarship, university, AI, Africa, education, funding, student aid",
  structuredData
}: SEOHeadProps) => {
  const fullTitle = title.includes("unipage.io") ? title : `${title} - unipage.io`;
  const currentUrl = canonical || `https://unipage.io${window.location.pathname}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="/lovable-uploads/ab97adde-62ae-4f7b-aea7-9fba81fb7f31.png" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="/lovable-uploads/ab97adde-62ae-4f7b-aea7-9fba81fb7f31.png" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;