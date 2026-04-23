import { motion } from 'framer-motion';
import { Building2, Factory, Truck, Home } from 'lucide-react';
import { SERVICES } from '../../constants';

const iconMap = {
  Building2: Building2,
  Factory: Factory,
  Home: Home,
  Truck: Truck,
};

export default function Services() {
  return (
    <section id="services" className="py-32 bg-bg-surface/30">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20"
        >
          <div className="space-y-4">
            <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em]">Core Expertise</h2>
            <h3 className="text-4xl sm:text-5xl md:text-6xl font-black mb-0 leading-none uppercase">
              Professional <span className="text-primary">Services</span>
            </h3>
          </div>
          <p className="text-slate-300 max-w-sm font-medium leading-relaxed">
            From Miami to the Panhandle, we deliver specialized electrical support for every scale.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, i) => {
            const IconComponent = iconMap[service.icon as keyof typeof iconMap];

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="card-surface group cursor-pointer"
              >
                <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-base/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="absolute top-4 left-4 p-3 bg-primary rounded-lg text-white shadow-lg">
                    {IconComponent && <IconComponent size={24} />}
                  </div>
                </div>

                <h4 className="text-2xl font-black uppercase tracking-tight mb-4 group-hover:text-primary transition-colors">
                  {service.title}
                </h4>
                <p className="text-text-muted leading-relaxed">{service.description}</p>

                <div className="mt-4 flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn More</span>
                  <span>→</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-text-muted mb-4">Need a custom solution for your project?</p>
          <a href="#contact" className="btn-primary inline-flex">
            Discuss Your Project
          </a>
        </motion.div>
      </div>
    </section>
  );
}
