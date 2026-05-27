import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import Examples from '@/components/sections/Examples';
import Structure from '@/components/sections/Structure';
import Customizer from '@/components/sections/Customizer';
import Print from '@/components/sections/Print';
import HowItWorks from '@/components/sections/HowItWorks';
import Pricing from '@/components/sections/Pricing';
import Voices from '@/components/sections/Voices';
import Faq from '@/components/sections/Faq';
import Cta from '@/components/sections/Cta';

export default function Home() {
  return (
    <>
      <MobileNav />
      <div className="lg:flex lg:min-h-screen">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Hero />
          <Features />
          <Examples />
          <Structure />
          <Customizer />
          <Print />
          <HowItWorks />
          <Pricing />
          <Voices />
          <Faq />
          <Cta />
          <Footer />
        </main>
      </div>
    </>
  );
}
