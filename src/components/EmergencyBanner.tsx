import { motion } from 'framer-motion';
import { Phone, AlertCircle } from 'lucide-react';
import { OWNER_INFO } from '../constants';

export default function EmergencyBanner() {
  return (
    <motion.div
      initial={{ y: -40 }}
      animate={{ y: 0 }}
      className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white py-2 px-6 text-center font-bold text-sm tracking-wide border-b border-red-800 uppercase sticky top-0 z-50 shadow-lg"
    >
      <a
        href={`tel:${OWNER_INFO.phone}`}
        className="flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
      >
        <AlertCircle size={16} className="animate-pulse" />
        <Phone size={16} className="animate-pulse" />
        <span className="hidden sm:inline">24/7 Emergency Response:</span>
        <span className="sm:hidden">24/7:</span>
        <span className="underline underline-offset-2">{OWNER_INFO.phone}</span>
        <span className="hidden sm:inline">– Call Now</span>
      </a>
    </motion.div>
  );
}
