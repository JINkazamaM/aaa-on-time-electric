import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Truck, Zap } from 'lucide-react';
import Image from '../Image';

export default function Hero() {
  const [imageError, setImageError] = useState(false);

  const handleScrollToContact = useCallback(() => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-base to-bg-surface -z-10" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-accent/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center">
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6 min-w-0 order-2 lg:order-1"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 text-accent text-xs font-bold rounded uppercase tracking-widest"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Florida Statewide Service
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[0.9] uppercase">
            <span className="block sm:inline">100% ON-TIME.</span> <span className="text-primary block sm:inline">NO SUBCONTRACTORS.</span>
          </h1>

          <p className="text-lg text-slate-300 max-w-lg leading-relaxed">
            Fully licensed and insured electrical contracting. We own our excavators, bucket trucks, and equipment to guarantee no delays for your project.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <motion.button
              onClick={handleScrollToContact}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-sm flex items-center gap-2"
            >
              GET FREE ESTIMATE
              <Zap size={18} />
            </motion.button>

            <div className="flex flex-col">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-bold whitespace-nowrap">Licensed & Bonded</span>
              <span className="font-bold text-sm tracking-tight whitespace-nowrap">$5M Liability Insured</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <div className="flex -space-x-2 shrink-0">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-bg-surface border-2 border-bg-base flex items-center justify-center text-xs font-bold"
                >
                  {i === 4 ? '+' : '★'}
                </div>
              ))}
            </div>
            <div className="text-sm">
              <span className="font-bold text-primary">500+ Projects</span>
              <span className="text-text-muted"> completed statewide</span>
            </div>
          </div>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative hidden lg:block min-w-0 order-1 lg:order-2"
        >
          <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 group max-w-full">
            <Image
              src="/hero-electrician.jpg"
              alt="AAA On Time Electric Fleet - Professional Electrical Contracting Services"
              loading="eager"
              fetchPriority="high"
              className="w-full h-auto max-h-[600px] object-cover"
              onError={() => setImageError(true)}
            />

            {!imageError && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                <div className="absolute bottom-8 left-8 right-8 pointer-events-auto">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                    <Truck className="text-primary" size={32} />
                    <div>
                      <p className="font-bold text-white uppercase text-sm tracking-widest">Premium Fleet</p>
                      <p className="text-xs text-white/80">60ft Bucket Trucks & Heavy Excavators</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {!imageError && (
            <>
              <motion.div
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 12 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                className="absolute -top-6 -right-6 w-32 h-32 bg-primary rounded-full flex items-center justify-center text-center p-4 shadow-2xl z-20"
              >
                <span className="text-white font-black text-sm uppercase leading-tight tracking-tighter">
                  Owned
                  <br />
                  Equipment
                </span>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-4 -left-4 bg-bg-surface border border-border-accent rounded-xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    15+
                  </div>
                  <div>
                    <p className="font-bold text-sm">Years Experience</p>
                    <p className="text-xs text-text-muted">Master Electrician</p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>

      {/* Trust Bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-0 right-0"
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-bold uppercase tracking-widest text-text-muted">
            {[
              'Licensed & Bonded',
              '24/7 Emergency Service',
              'Own Equipment',
              'Free Estimates',
            ].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
