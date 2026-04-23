import { motion } from 'framer-motion';
import { EQUIPMENT } from '../../constants';

export default function Equipment() {
  return (
    <section id="equipment" className="py-32">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-20 space-y-4">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-xs font-black text-primary uppercase tracking-[0.4em]"
          >
            Our Heavy Duty Tools
          </motion.h2>

          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-none uppercase max-w-3xl"
          >
            Fleet & Equipment <span className="text-primary">(Owned, Not Rented)</span>
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 max-w-2xl font-medium leading-relaxed"
          >
            We don't wait for rentals. We own every machine, ensuring 100% on-time deployment for your project.
          </motion.p>
        </div>

        {/* Equipment Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {EQUIPMENT.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="relative group rounded-2xl overflow-hidden aspect-square shadow-xl border border-border-accent cursor-pointer"
            >
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Owned
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h4 className="text-xl font-bold uppercase tracking-tight mb-2">{item.name}</h4>
                <p className="text-sm text-text-muted opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 duration-300">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: '60ft', label: 'Bucket Truck Reach' },
            { value: '24/7', label: 'Equipment Available' },
            { value: '100%', label: 'On-Time Deployment' },
            { value: '0', label: 'Rental Delays' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-black text-primary mb-2">{stat.value}</div>
              <div className="text-xs uppercase tracking-widest text-text-muted">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
