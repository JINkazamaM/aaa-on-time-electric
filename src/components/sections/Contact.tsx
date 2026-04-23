import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Mail, MapPin, Clock, CheckCircle, AlertCircle, Loader2,
  FileText, Upload, X, Send, Sparkles, Zap, Shield,
  FileCheck, ArrowRight, Clock3
} from 'lucide-react';
import { OWNER_INFO } from '../../constants';
import { useAiEstimate } from '../../hooks/useAiEstimate';
import EstimateReviewModal from '../EstimateReviewModal';

interface FormData {
  name: string;
  email: string;
  phone: string;
  type: string;
  details: string;
  _csrf: string;
  _honeypot: string;
  _sessionId: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  details?: string;
  submit?: string;
  file?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  base64: string;
  extractedText?: string;
}

const INITIAL_FORM_DATA: Omit<FormData, '_csrf' | '_honeypot' | '_sessionId'> = {
  name: '',
  email: '',
  phone: '',
  type: 'Commercial',
  details: ''
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

const PROJECT_TYPES = [
  { value: 'Commercial', label: 'Commercial', icon: '🏢', desc: 'Office, retail, warehouse' },
  { value: 'Industrial', label: 'Industrial', icon: '🏭', desc: 'Manufacturing, heavy machinery' },
  { value: 'Residential', label: 'Residential', icon: '🏠', desc: 'Home electrical projects' },
  { value: 'Emergency', label: 'Emergency', icon: '🚨', desc: '24/7 urgent service' },
];

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({ ...INITIAL_FORM_DATA, _csrf: '', _honeypot: '', _sessionId: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [estimateStatus, setEstimateStatus] = useState<'pending' | 'reviewing' | 'approved' | 'sent' | null>(null);

  // Abort controller for cancelling pending requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    estimate,
    isGenerating,
    error: estimateError,
    generateEstimate,
    sendEstimateToJose,
    sendEstimateToUser,
    approveEstimate
  } = useAiEstimate();

  const FORM_STORAGE_KEY = 'aaa-contact-form-draft';

  // Fetch CSRF token with cleanup
  useEffect(() => {
    let isMounted = true;

    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/contact');
        if (response.ok && isMounted) {
          const data = await response.json();
          setCsrfToken(data.csrfToken);
          setSessionId(data.sessionId);
          setFormData(prev => ({ ...prev, _csrf: data.csrfToken, _sessionId: data.sessionId }));
        }
      } catch {
        // Silently fail - CSRF is optional for static/demo forms
      }
    };

    fetchCsrfToken();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load saved form data
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setFormData(prev => ({
            ...INITIAL_FORM_DATA,
            ...parsed.data,
            _csrf: prev._csrf,
            _sessionId: prev._sessionId,
            _honeypot: ''
          }));
          if (parsed.file) setUploadedFile(parsed.file);
          setLastSaved(new Date(parsed.timestamp));
        } else {
          localStorage.removeItem(FORM_STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error('Failed to load form draft:', e);
    }
  }, []);

  // Auto-save form with debounce
  useEffect(() => {
    if (isSubmitted || isSubmitting) return;

    const timeoutId = setTimeout(() => {
      if (formData.name || formData.email || formData.details) {
        try {
          localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify({
            data: { name: formData.name, email: formData.email, phone: formData.phone, type: formData.type, details: formData.details },
            file: uploadedFile,
            timestamp: Date.now(),
            sessionId: sessionId
          }));
          setLastSaved(new Date());
        } catch (e) {
          console.error('Failed to save form draft:', e);
        }
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData, isSubmitted, isSubmitting, uploadedFile, sessionId]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.details.trim().length < 10) {
      newErrors.details = 'Please provide more details (min 10 chars)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) await processFile(file);
  }, []);

  const processFile = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors(prev => ({ ...prev, file: 'Please upload a PDF, JPG, or PNG file' }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrors(prev => ({ ...prev, file: 'File size must be less than 10MB' }));
      return;
    }

    setErrors(prev => ({ ...prev, file: undefined }));
    setIsExtractingText(true);

    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const newFile: UploadedFile = {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        base64: base64.split(',')[1]
      };

      setUploadedFile(newFile);
      if (file.type === 'application/pdf') {
        newFile.extractedText = `[PDF Document: ${file.name}]`;
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, file: 'Failed to process file. Please try again.' }));
    } finally {
      setIsExtractingText(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const removeFile = useCallback(() => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleGenerateEstimate = useCallback(async () => {
    if (!validateForm()) return;
    if (!uploadedFile) {
      setErrors(prev => ({ ...prev, file: 'Please upload an electrical plan' }));
      return;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setEstimateStatus('pending');
    setErrors(prev => ({ ...prev, submit: undefined }));

    try {
      // Prepare file content
      let fileContent: string;
      if (uploadedFile.type === 'application/pdf' && uploadedFile.extractedText) {
        fileContent = uploadedFile.extractedText;
      } else if (uploadedFile.extractedText) {
        fileContent = uploadedFile.extractedText;
      } else {
        fileContent = `[File: ${uploadedFile.name}] ${uploadedFile.base64.substring(0, 2000)}`;
      }

      const result = await generateEstimate({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        projectType: formData.type,
        details: formData.details,
        fileName: uploadedFile.name,
        fileContent: fileContent
      });

      if (result) {
        setEstimateStatus('reviewing');
        setShowReviewModal(true);
        await sendEstimateToJose({
          estimate: result,
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          fileName: uploadedFile.name
        });
      } else if (estimateError) {
        setErrors(prev => ({ ...prev, submit: estimateError }));
        setEstimateStatus(null);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setErrors(prev => ({ ...prev, submit: 'Failed to generate estimate. Please try again.' }));
        setEstimateStatus(null);
      }
    }
  }, [formData, uploadedFile, generateEstimate, sendEstimateToJose, estimateError, validateForm]);

  const handleApproveAndSend = useCallback(async () => {
    if (!estimate) return;
    setEstimateStatus('approved');
    try {
      await approveEstimate(estimate.id);
      await sendEstimateToUser({
        email: formData.email,
        name: formData.name,
        estimate
      });
      setEstimateStatus('sent');
      setShowReviewModal(false);
      setIsSubmitted(true);
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: 'Failed to send estimate. Please try again.' }));
      setEstimateStatus(null);
    }
  }, [estimate, formData, approveEstimate, sendEstimateToUser]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Cancel any pending estimate generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, submit: undefined }));

    try {
      const payload = {
        ...formData,
        file: uploadedFile ? {
          name: uploadedFile.name,
          type: uploadedFile.type,
          base64: uploadedFile.base64
        } : null
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          'X-Session-Id': sessionId,
        },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          const formErrors: FormErrors = {};
          data.errors.forEach((err: string) => {
            if (err.toLowerCase().includes('name')) formErrors.name = err;
            else if (err.toLowerCase().includes('email')) formErrors.email = err;
            else if (err.toLowerCase().includes('phone')) formErrors.phone = err;
            else if (err.toLowerCase().includes('detail')) formErrors.details = err;
            else formErrors.submit = err;
          });
          setErrors(formErrors);
        } else {
          setErrors({ submit: data.error || 'Failed to submit. Please try again.' });
        }
        return;
      }

      setIsSubmitted(true);

      try {
        localStorage.removeItem(FORM_STORAGE_KEY);
      } catch (e) {
        console.error('Failed to clear form draft:', e);
      }

      // Reset form after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
          setFormData({ ...INITIAL_FORM_DATA, _csrf: csrfToken, _honeypot: '', _sessionId: sessionId });
        setUploadedFile(null);
        setLastSaved(null);
      }, 5000);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('Request was cancelled');
        } else {
          console.error('Form submission error:', error);
          setErrors({ submit: 'Network error. Please check your connection and try again.' });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, csrfToken, sessionId, uploadedFile, validateForm]);

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const errorKey = field as keyof FormErrors;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  }, [errors]);

  const getInputClasses = useCallback((field: keyof FormData, hasError?: boolean) => {
    const error = hasError || (errors as Record<string, string | undefined>)[field];
    return `
      w-full bg-bg-surface/50 border ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-border-accent focus:border-primary focus:ring-primary/20'}
      rounded-xl p-4 focus:outline-none focus:ring-4 transition-all duration-300
      placeholder:text-text-muted/40 disabled:opacity-50 disabled:cursor-not-allowed
      hover:border-primary/30
    `;
  }, [errors]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles size={14} />
            AI-Powered Estimates
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase mb-6">
            Get Your <span className="text-primary">Estimate</span>
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Upload your electrical plans and receive a detailed AI-generated estimate
            reviewed by José within 24 hours.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {/* Contact Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Quick Contact Card */}
            <div className="card-surface p-6 border border-border-accent/50">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
                <Zap size={16} className="text-primary" />
                Immediate Response
              </h3>
              <a
                href={`tel:${OWNER_INFO.phone}`}
                className="flex items-center gap-4 p-4 bg-bg-base rounded-xl hover:bg-primary/5 transition-colors group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider">24/7 Emergency Line</p>
                  <p className="text-xl font-black">{OWNER_INFO.phone}</p>
                </div>
              </a>
            </div>

            {/* Contact Methods */}
            <div className="grid grid-cols-2 gap-4">
              <a
                href={`mailto:${OWNER_INFO.email}`}
                className="card-surface p-5 border border-border-accent/50 hover:border-primary/30 transition-all group"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-all">
                  <Mail size={20} />
                </div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Email</p>
                <p className="text-sm font-bold truncate">{OWNER_INFO.email}</p>
              </a>

              <div className="card-surface p-5 border border-border-accent/50">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-3 text-accent">
                  <Clock size={20} />
                </div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Hours</p>
                <p className="text-sm font-bold">24/7 Service</p>
              </div>
            </div>

            {/* Coverage Card */}
            <div className="card-surface p-5 border border-border-accent/50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Service Coverage</p>
                  <p className="font-bold mb-2">All of Florida</p>
                  <p className="text-sm text-text-muted">
                    Miami • Orlando • Tampa • Jacksonville • Statewide
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: 'Licensed' },
                { icon: CheckCircle, label: 'Insured $5M' },
                { icon: Clock, label: 'On-Time' },
              ].map((badge, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-3 bg-bg-base/50 rounded-xl">
                  <badge.icon size={20} className="text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{badge.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="card-surface p-12 text-center h-full flex flex-col items-center justify-center border border-primary/20"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6"
                  >
                    <CheckCircle size={48} className="text-primary" />
                  </motion.div>
                  <h3 className="text-3xl font-black uppercase mb-4">
                    {estimateStatus === 'sent' ? 'Estimate Sent!' : 'Thank You!'}
                  </h3>
                  <p className="text-text-muted max-w-md mb-8">
                    {estimateStatus === 'sent'
                      ? 'Your AI-generated estimate has been reviewed by José and sent to your email.'
                      : 'Your inquiry has been received. José will contact you within 24 hours.'}
                  </p>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.5, duration: 5 }}
                    className="h-1 bg-primary/20 rounded-full max-w-xs overflow-hidden"
                  >
                    <div className="h-full bg-primary rounded-full" />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="card-surface p-8 border border-border-accent/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Honeypot */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData._honeypot}
                      onChange={(e) => setFormData(prev => ({ ...prev, _honeypot: e.target.value }))}
                    />
                  </div>

                  {/* Personal Info Grid */}
                  <div className="grid sm:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                        Full Name <span className="text-primary">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={getInputClasses('name')}
                        placeholder="John Smith"
                        disabled={isSubmitting}
                        aria-required="true"
                        aria-invalid={errors.name ? 'true' : 'false'}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                      <AnimatePresence>
                        {errors.name && (
                          <motion.p
                            id="name-error"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-1 text-xs text-red-500 flex items-center gap-1"
                            role="alert"
                          >
                            <AlertCircle size={12} />
                            {errors.name}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                        Email Address <span className="text-primary">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={getInputClasses('email')}
                        placeholder="john@company.com"
                        disabled={isSubmitting}
                        aria-required="true"
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                      <AnimatePresence>
                        {errors.email && (
                          <motion.p
                            id="email-error"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-1 text-xs text-red-500 flex items-center gap-1"
                            role="alert"
                          >
                            <AlertCircle size={12} />
                            {errors.email}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                        Phone Number <span className="text-primary">*</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className={getInputClasses('phone')}
                        placeholder="(786) 295-1748"
                        disabled={isSubmitting}
                        aria-required="true"
                        aria-invalid={errors.phone ? 'true' : 'false'}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                      />
                      <AnimatePresence>
                        {errors.phone && (
                          <motion.p
                            id="phone-error"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-1 text-xs text-red-500 flex items-center gap-1"
                            role="alert"
                          >
                            <AlertCircle size={12} />
                            {errors.phone}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                        Project Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {PROJECT_TYPES.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handleChange('type', type.value)}
                            className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                              formData.type === type.value
                                ? 'border-primary bg-primary/10'
                                : 'border-border-accent hover:border-primary/30 bg-bg-surface/50'
                            }`}
                          >
                            <span className="text-lg mr-2">{type.icon}</span>
                            <span className="text-sm font-bold">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                      <span className="flex items-center gap-2">
                        <FileCheck size={14} className="text-primary" />
                        Electrical Plans (Optional)
                      </span>
                    </label>

                    <AnimatePresence mode="wait">
                      {!uploadedFile ? (
                        <motion.div
                          key="upload-area"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                            isDragging
                              ? 'border-primary bg-primary/5'
                              : errors.file
                              ? 'border-red-500/50 bg-red-500/5'
                              : 'border-border-accent hover:border-primary/40 hover:bg-bg-base/50'
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileSelect}
                            disabled={isExtractingText}
                          />
                          <label className="cursor-pointer block">
                            <div className="flex flex-col items-center text-center">
                              {isExtractingText ? (
                                <>
                                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                                    <Loader2 size={32} className="text-primary animate-spin" />
                                  </div>
                                  <p className="text-sm font-bold mb-1">Processing your file...</p>
                                  <p className="text-xs text-text-muted">Please wait while we analyze your plan</p>
                                </>
                              ) : (
                                <>
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                                  >
                                    <Upload size={32} className="text-primary" />
                                  </motion.div>
                                  <p className="text-sm font-bold mb-1">
                                    Drop your file here or <span className="text-primary">browse</span>
                                  </p>
                                  <p className="text-xs text-text-muted mb-3">
                                    Support PDF, JPG, PNG (max 10MB)
                                  </p>
                                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider rounded-full">
                                    <Sparkles size={12} />
                                    AI-Powered Analysis
                                  </span>
                                </>
                              )}
                            </div>
                          </label>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="file-preview"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-4 p-4 bg-bg-base rounded-xl border border-primary/20"
                        >
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <FileText size={24} className="text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{uploadedFile.name}</p>
                            <p className="text-xs text-text-muted">{formatFileSize(uploadedFile.size)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                            aria-label="Remove file"
                          >
                            <X size={18} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {errors.file && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 text-xs text-red-500 flex items-center gap-1"
                        >
                          <AlertCircle size={12} />
                          {errors.file}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {uploadedFile && !errors.file && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 text-xs text-accent flex items-center gap-1"
                      >
                        <Sparkles size={12} />
                        AI will analyze your plan and generate a detailed estimate
                      </motion.p>
                    )}
                  </div>

                  {/* Project Details */}
                  <div className="mb-6">
                    <label htmlFor="details" className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                      Project Details <span className="text-primary">*</span>
                    </label>
                    <textarea
                      id="details"
                      value={formData.details}
                      onChange={(e) => handleChange('details', e.target.value)}
                      rows={4}
                      className={`${getInputClasses('details')} resize-none`}
                      placeholder="Describe your electrical needs, timeline, and any specific requirements..."
                      disabled={isSubmitting}
                      maxLength={5000}
                    />
                    <div className="flex justify-between mt-2">
                      <AnimatePresence>
                        {errors.details && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-xs text-red-500 flex items-center gap-1"
                          >
                            <AlertCircle size={12} />
                            {errors.details}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <p className={`text-xs ml-auto ${formData.details.length > 4500 ? 'text-yellow-500' : 'text-text-muted'}`}>
                        {formData.details.length}/5000
                      </p>
                    </div>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {errors.submit && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
                      >
                        <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-500">{errors.submit}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {uploadedFile && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        type="button"
                        onClick={handleGenerateEstimate}
                        disabled={isSubmitting || isGenerating}
                        className="flex-1 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-gradient" />
                        <div className="relative flex items-center justify-center gap-2 py-4 font-black uppercase tracking-wider text-bg-base">
                          {isGenerating ? (
                            <>
                              <Loader2 size={20} className="animate-spin" />
                              Analyzing with AI...
                            </>
                          ) : (
                            <>
                              <Sparkles size={20} />
                              Get AI Estimate
                              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </div>
                      </motion.button>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || isGenerating}
                      className={`flex-1 py-4 px-8 rounded-xl font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                        uploadedFile
                          ? 'bg-bg-base border-2 border-border-accent hover:border-primary'
                          : 'btn-primary'
                      } disabled:opacity-70 disabled:cursor-not-allowed`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          {uploadedFile ? 'Send Inquiry Only' : 'Send Inquiry'}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-6 border-t border-border-accent/50">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                          <Clock3 size={12} className="text-primary" />
                          Response within 24h
                        </span>
                        {lastSaved && (
                          <span className="text-accent">
                            Draft saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1.5">
                        <Shield size={12} className="text-primary" />
                        Secure & Confidential
                      </span>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* AI Estimate Review Modal */}
      <EstimateReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          if (estimateStatus !== 'sent') {
            setEstimateStatus(null);
          }
        }}
        estimate={estimate}
        isLoading={isGenerating}
        onApprove={handleApproveAndSend}
        onReject={() => setEstimateStatus(null)}
      />
    </section>
  );
}
