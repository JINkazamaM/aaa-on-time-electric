import { Phone, Clock, ShieldCheck, Facebook, Instagram, MapPin, Linkedin, ExternalLink } from 'lucide-react';
import { OWNER_INFO } from '../constants';

const navLinks = [
  { name: 'Services', href: '#services' },
  { name: 'Fleet', href: '#equipment' },
  { name: 'About', href: '#about' },
  { name: 'Estimate', href: '#contact' },
];

const serviceAreas = [
  'Miami & South Florida',
  'Orlando & Central FL',
  'Tampa & Gulf Coast',
  'Jacksonville & Panhandle',
  'Statewide Dispatch',
];

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com/aaaontimeelectric', label: 'Facebook', color: 'hover:bg-blue-600' },
  { icon: Instagram, href: 'https://instagram.com/aaaontimeelectric', label: 'Instagram', color: 'hover:bg-pink-600' },
  { icon: Linkedin, href: 'https://linkedin.com/company/aaaontimeelectric', label: 'LinkedIn', color: 'hover:bg-blue-700' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-bg-base py-16 border-t border-border-accent">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6 lg:col-span-1">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="bg-primary px-2 py-1.5 rounded flex items-center justify-center font-black text-xl text-bg-base transform transition-transform group-hover:rotate-12">
                AAA
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight leading-none uppercase">On Time Electric</span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-accent font-bold">Master Electrician</span>
              </div>
            </a>
            <p className="text-sm text-text-muted font-medium leading-relaxed">
              Professional electrical contracting across the state of Florida. 100% on-time service, owned equipment, zero subcontractors.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 bg-bg-surface border border-border-accent rounded-lg transition-all hover:scale-110 hover:text-white ${social.color}`}
                  aria-label={`Visit our ${social.label}`}
                >
                  <social.icon size={20} />
                </a>
              ))}
              <a
                href="https://maps.google.com/?q=Florida"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-bg-surface border border-border-accent rounded-lg hover:text-white hover:bg-green-600 transition-all hover:scale-110"
                aria-label="View on Google Maps"
              >
                <MapPin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-black uppercase tracking-[0.3em] text-[10px] mb-8 text-primary">Quick Links</h5>
            <ul className="space-y-4 text-sm font-bold">
              {navLinks.map(link => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                    className="hover:text-primary transition-colors uppercase tracking-widest text-xs"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h5 className="font-black uppercase tracking-[0.3em] text-[10px] mb-8 text-primary">Service Area</h5>
            <ul className="space-y-4 text-sm text-slate-300 font-medium">
              {serviceAreas.map(area => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h5 className="font-black uppercase tracking-[0.3em] text-[10px] mb-8 text-primary">Contact Us</h5>
            <div className="space-y-4">
              <a href={`tel:${OWNER_INFO.phone}`} className="flex items-center gap-3 group">
                <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-bg-base transition-all">
                  <Phone size={18} />
                </div>
                <span className="font-black uppercase tracking-tight text-lg">{OWNER_INFO.phone}</span>
              </a>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-bg-surface rounded-lg">
                  <Clock size={16} className="text-accent" />
                </div>
                <span className="font-bold text-sm text-slate-300">Dispatch 24/7/365</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="p-2 bg-bg-surface rounded-lg">
                  <ShieldCheck size={16} className="text-accent" />
                </div>
                <span className="font-bold text-slate-400">{OWNER_INFO.license}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border-accent flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase font-black tracking-[0.3em] text-text-muted">
          <p>© {currentYear} AAA On Time Electric. Licensed & Insured.</p>
          <div className="flex flex-wrap gap-8 items-center">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              24/7 Emergency
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Free Estimates
            </span>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); handleNavClick('#contact'); }}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              Contact Us
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
