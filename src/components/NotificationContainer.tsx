import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface NotificationContainerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: 'bg-green-500/10 border-green-500/30 text-green-500',
  error: 'bg-red-500/10 border-red-500/30 text-red-500',
  info: 'bg-primary/10 border-primary/30 text-primary',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
};

export default function NotificationContainer({
  notifications,
  onDismiss,
}: NotificationContainerProps) {
  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = icons[notification.type];
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className={`p-4 rounded-lg border shadow-lg flex items-start gap-3 ${styles[notification.type]}`}
              role="alert"
            >
              <Icon size={20} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm flex-1">{notification.message}</p>
              <button
                onClick={() => onDismiss(notification.id)}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
