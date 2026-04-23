export type Theme = 
  | 'default' 
  | 'light-sky' 
  | 'light-clean' 
  | 'light-warm' 
  | 'purple-voltage' 
  | 'emerald-energy' 
  | 'ruby-power' 
  | 'amber-blaze' 
  | 'teal-wave' 
  | 'pink-spark';

export interface ThemeOption {
  id: Theme;
  name: string;
  color: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Testimonial {
  id: string;
  name: string;
  company?: string;
  text: string;
  avatar: string;
  logo?: string;
}
