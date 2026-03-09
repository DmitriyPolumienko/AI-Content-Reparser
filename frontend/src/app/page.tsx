import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import TrustedBy from '@/components/landing/TrustedBy';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import Blog from '@/components/landing/Blog';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main className="bg-[#030014] min-h-screen">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <Blog />
      <CTASection />
      <Footer />
    </main>
  );
}
