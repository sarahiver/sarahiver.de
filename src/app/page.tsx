import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import Themes from '@/components/sections/Themes';
import HowItWorks from '@/components/sections/HowItWorks';
import Pricing from '@/components/sections/Pricing';
import Social from '@/components/sections/Social';
import Faq from '@/components/sections/Faq';
import Cta from '@/components/sections/Cta';

export default function Home() {
  return (
    <>
      {/* Mobile Navigation (hidden on lg+) */}
      <MobileNav />

      {/* Main Layout: Sidebar (Desktop) + Content */}
      <div className="lg:flex lg:min-h-screen">
        {/* Desktop Sidebar (sticky) */}
        <Sidebar />

        {/* Content scroll area */}
        <main className="flex-1 min-w-0">
          <Hero />
          <Features />
          <Themes />
          <HowItWorks />
          <Pricing />
          <Social />
          <Faq />
          <Cta />
          <Footer />
        </main>
      </div>
    </>
  );
}
