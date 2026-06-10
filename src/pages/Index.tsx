
import { useNavigate } from "react-router-dom";
import React from "react";
import Hero from "@/components/hero/Hero";

import WhatWeOffer from "@/components/features/WhatWeOffer";
import VideoDemo from "@/components/video/VideoDemo";
import Testimonials from "@/components/testimonials/Testimonials";
import ContactForm from "@/components/contact/ContactForm";
import LandingNav from "@/components/nav/LandingNav";
import SEOHead from "@/components/seo/SEOHead";
import ThreeDMarqueeDemo from "@/components/ui/3d-marquee-demo";
import { ScrollRevealSection } from "@/components/ui/scroll-reveal-section";
import RollingStats from "@/components/stats/RollingStats";
import FAQ from "@/components/faq/FAQ";
import Footer from "@/components/footer/Footer";
import UniversityMarquee from "@/components/stats/UniversityMarquee";

const Index = () => {
  const navigate = useNavigate();

  const handleCheckEligibility = () => {
    navigate("/dashboard");
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "unipage.io",
    "description": "AI agents that automatically find and apply to bursaries for African students",
    "url": "https://unipage.io",
  };

  return (
    <>
      <SEOHead structuredData={structuredData} />
      <div className="min-h-screen bg-background scroll-smooth">
      <LandingNav />
      <ScrollRevealSection animation="fade-in">
        <Hero onCheckEligibility={handleCheckEligibility} />
      </ScrollRevealSection>
      
      <ScrollRevealSection animation="fade-up" delay={100}>
        <RollingStats />
      </ScrollRevealSection>

      <UniversityMarquee />

      {/* What We Offer - Univerbal-inspired clean layout */}
      <div id="features-section">
        <WhatWeOffer />
      </div>

      {/* Video Demo Section */}
      <VideoDemo />
      
      
      
      <ScrollRevealSection animation="slide-up" delay={200}>
        <Testimonials />
      </ScrollRevealSection>
      
      {/* Success Stories Gallery */}
      <ScrollRevealSection animation="fade-up" delay={300}>
        <section id="about-section" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <ScrollRevealSection animation="fade-up" delay={100}>
              <div className="max-w-3xl mx-auto text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="text-sm font-medium">Success Stories</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                  Celebrating Our Graduates
                </h2>
                <p className="text-text-secondary text-lg">
                  Join thousands of successful students who found their path through our platform
                </p>
              </div>
            </ScrollRevealSection>
            <ScrollRevealSection animation="scale-in" delay={200}>
              <ThreeDMarqueeDemo />
            </ScrollRevealSection>
          </div>
        </section>
      </ScrollRevealSection>

      {/* FAQ Section */}
      <FAQ />

      <ScrollRevealSection animation="fade-up" delay={400}>
        <section id="contact-section" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <ScrollRevealSection animation="fade-up" delay={100}>
              <div className="max-w-3xl mx-auto text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span className="text-sm font-medium">Get in Touch</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                  Have Questions? Contact Us
                </h2>
                <p className="text-text-secondary text-lg">
                  We're here to help you with any questions about universities and courses
                </p>
              </div>
            </ScrollRevealSection>
            
            <ScrollRevealSection animation="slide-up" delay={200}>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-6xl mx-auto">
                <div className="w-full md:w-1/2">
                  <ContactForm />
                </div>
                <div className="w-full md:w-1/2 flex justify-center">
                  {React.createElement('dotlottie-wc', {
                    src: "https://lottie.host/a3fa14fb-e2bf-4dbc-ad57-2ecc9ab646d3/qOFjWJ6xZx.lottie",
                    style: { width: '300px', height: '300px' },
                    speed: "1",
                    autoplay: true,
                    loop: true
                  })}
                </div>
              </div>
            </ScrollRevealSection>
          </div>
        </section>
      </ScrollRevealSection>

      <Footer />
      </div>
    </>
  );
};

export default Index;
