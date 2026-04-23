import { useTheme } from './hooks/useTheme';
import Layout from './components/Layout';
import SEO from './components/SEO';
import Hero from './components/sections/Hero';
import Services from './components/sections/Services';
import Equipment from './components/sections/Equipment';
import About from './components/sections/About';
import Testimonials from './components/sections/Testimonials';
import { lazy, Suspense } from 'react';

const Contact = lazy(() => import('./components/sections/Contact'));
const JoseBot = lazy(() => import('./components/JoseBot'));

export default function App() {
  const { theme, setTheme, isReady } = useTheme();

  if (!isReady) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="animate-pulse">
          <div className="text-4xl font-black text-primary">AAA</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="AAA On Time Electric | Florida Electrical Contractors"
        description="Professional electrical contracting across Florida. 100% on-time service, owned equipment, 24/7 emergency response. Licensed & insured Master Electrician José L. Saladin."
        image="https://images.unsplash.com/photo-1621905235277-295096181f21?auto=format&fit=crop&q=80&w=1200"
        url="https://aaaontimeelectric.com"
      />
      <Layout theme={theme} onThemeChange={setTheme}>
        <Hero />
        <Services />
        <Equipment />
        <About />
        <Testimonials />
        <Suspense fallback={
          <section className="py-24 flex items-center justify-center">
            <div className="animate-pulse text-primary">Loading...</div>
          </section>
        }>
          <Contact />
        </Suspense>
        <Suspense fallback={null}>
          <JoseBot />
        </Suspense>
      </Layout>
    </>
  );
}
