import { ThemeOption, Service, Equipment, Testimonial } from './types';

export const THEMES: ThemeOption[] = [
  { id: 'default', name: 'Dark Cyan', color: '#06b6d4' },
  { id: 'light-sky', name: 'Light Sky', color: '#0ea5e9' },
  { id: 'light-clean', name: 'Light Clean', color: '#2563eb' },
  { id: 'light-warm', name: 'Light Warm', color: '#d97706' },
  { id: 'purple-voltage', name: 'Purple Voltage', color: '#9333ea' },
  { id: 'emerald-energy', name: 'Emerald Energy', color: '#059669' },
  { id: 'ruby-power', name: 'Ruby Power', color: '#dc2626' },
  { id: 'amber-blaze', name: 'Amber Blaze', color: '#d97706' },
  { id: 'teal-wave', name: 'Teal Wave', color: '#0d9488' },
  { id: 'pink-spark', name: 'Pink Spark', color: '#db2777' },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Michael Rodriguez',
    company: 'Skyline Construction',
    text: 'José and his team are the only electricians I trust for our large-scale commercial projects. They own the equipment, which saved us weeks on our last site prep.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=100',
  },
  {
    id: '2',
    name: 'Sarah Jenkins',
    company: 'Downtown Property Mgmt',
    text: 'When our parking lot lights failed during a storm, AAA On Time was there with their bucket truck within two hours. Professional, fast, and exactly on time.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=100',
  },
  {
    id: '3',
    name: 'David Chen',
    company: 'Chen Industrial Hub',
    text: 'Exemplary industrial service. The machinery wiring was complex, but José handled it with precision. Direct communication and zero subcontractors made a huge difference.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    logo: 'https://images.unsplash.com/photo-1599305090748-366398a67cb1?auto=format&fit=crop&q=80&w=100',
  },
  {
    id: '4',
    name: 'Robert Miller',
    company: 'Miller & Sons Logistics',
    text: 'Required a complete site-wide underground electrical grid for our new warehouse. AAA On Time brought their own excavators and finished ahead of schedule. Truly professional.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    logo: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=100',
  },
];

export const SERVICES: Service[] = [
  {
    id: 'commercial',
    title: 'Commercial',
    description: 'Full panel upgrades, LED lighting design, code inspections, and fast permit handling for businesses.',
    icon: 'Building2',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'industrial',
    title: 'Industrial',
    description: 'High‑voltage systems, machinery wiring, underground electrical infrastructure, and heavy excavation.',
    icon: 'Factory',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'residential',
    title: 'Residential',
    description: 'Home electrical repairs, panel upgrades, lighting installation, rewiring, and 24/7 emergency service for homeowners.',
    icon: 'Home',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'bucket-truck',
    title: 'Bucket Truck Service',
    description: '60ft articulating bucket trucks for parking lot lighting, signage, and overhead line repairs – available 24/7.',
    icon: 'Truck',
    image: '/bucket-truck-service.png',
  },
];

export const EQUIPMENT: Equipment[] = [
  {
    id: 'bucket-truck-60',
    name: '60ft Articulating Bucket Truck',
    description: '500lb capacity for high-reach electrical work and signage.',
    image: '/bucket-truck.jpg',
  },
  {
    id: 'excavator',
    name: 'Heavy Excavator',
    description: 'For underground trenching, site prep, and major electrical conduit laying.',
    image: '/excavator.jpg',
  },
  {
    id: 'bobcat',
    name: 'Bobcat / Skid Steer',
    description: 'Precise grading and conduit placement on residential and commercial sites.',
    image: '/bobcat-s650.jpg',
  },
];

export const PARTNERS = [
  { name: 'Skyline Construction', logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=200' },
  { name: 'Downtown Property', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200' },
  { name: 'Chen Industrial', logo: 'https://images.unsplash.com/photo-1599305090748-366398a67cb1?auto=format&fit=crop&q=80&w=200' },
  { name: 'Florida Power', logo: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=200' },
  { name: 'Statewide Logistics', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200' },
  { name: 'Oceanic Real Estate', logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=200' },
];

export const OWNER_INFO = {
  name: 'José L. Saladin',
  title: 'Master Electrician & Owner',
  experience: '15+ Years Exp',
  guarantee: 'We show up On Time and own the equipment – no subcontractors.',
  license: 'Statewide Florida Licence, Bonded, $5M Liability Insurance',
  phone: '(786) 295-1748',
  email: 'info@aaaontimeelectric.com',
};
