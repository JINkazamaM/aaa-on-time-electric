import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { OWNER_INFO } from '../../constants';

export default function About() {
  return (
    <section id="about" className="py-24 bg-bg-surface/50">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"
                alt="José L. Saladin - Master Electrician"
                loading="lazy"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute top-8 right-8 bg-primary p-4 rounded-xl shadow-2xl flex flex-col items-center justify-center transform group-hover:rotate-6 transition-transform">
                <span className="text-white font-black text-2xl leading-none">15+</span>
                <span className="text-white text-[10px] font-bold uppercase tracking-widest opacity-80">Years Exp</span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-6 -right-6 p-6 card-surface shadow-2xl space-y-2"
            >
              <h4 className="font-black uppercase tracking-tight text-xl">{OWNER_INFO.name}</h4>
              <p className="text-primary font-bold text-sm">{OWNER_INFO.title}</p>
            </motion.div>
          </motion.div>

          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em]">Owner & Credibility</h2>
              <h3 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-none uppercase">
                The Direct <br /> <span className="text-primary">Guarantee</span>
              </h3>
            </div>

            <blockquote className="text-xl leading-relaxed text-slate-300 font-medium border-l-4 border-primary pl-6">
              "{OWNER_INFO.guarantee} When you call us, you're getting direct expertise and a promise backed by 15 years in the field."
            </blockquote>

            <ul className="space-y-4">
              {[
                OWNER_INFO.license,
                '24/7 Priority Emergency Support',
                'Family-Owned & Statewide Operational',
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-3"
                >
                  <ShieldCheck className="text-primary flex-shrink-0" size={24} />
                  <span className="font-bold opacity-80">{item}</span>
                </motion.li>
              ))}
            </ul>

            <div className="pt-6 flex flex-wrap gap-4">
              <a href={`tel:${OWNER_INFO.phone}`} className="btn-primary inline-flex items-center gap-3 text-lg px-8">
                Connect Directly
              </a>
              <a href="#contact" className="inline-flex items-center gap-3 text-lg px-8 py-3 border border-border-accent rounded hover:border-primary transition-colors">
                Request Quote
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
