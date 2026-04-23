import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, AlertCircle, FileText, Loader2, Check, RefreshCw, Sparkles, Building2, Download, Printer, Shield } from 'lucide-react';
import type { EstimateData } from '../hooks/useAiEstimate';
import { useCallback, useState } from 'react';

const pdfGeneratorLazy = () => import('../utils/pdfGenerator');

interface EstimateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimate: EstimateData | null;
  isLoading: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export default function EstimateReviewModal({
  isOpen,
  onClose,
  estimate,
  isLoading,
  onApprove,
  onReject
}: EstimateReviewModalProps) {
  const [pdfUtils, setPdfUtils] = useState<{
    downloadEstimatePDF: (estimate: EstimateData) => Promise<void>;
    printEstimate: (estimate: EstimateData) => Promise<void>;
  } | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const loadPdfUtils = useCallback(async () => {
    if (pdfUtils || isPdfLoading) return;
    setIsPdfLoading(true);
    try {
      const module = await pdfGeneratorLazy();
      setPdfUtils({
        downloadEstimatePDF: module.downloadEstimatePDF,
        printEstimate: module.printEstimate
      });
    } finally {
      setIsPdfLoading(false);
    }
  }, [pdfUtils, isPdfLoading]);

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = async () => {
    if (!estimate) return;
    await loadPdfUtils();
    await pdfUtils?.downloadEstimatePDF(estimate);
  };

  const handlePrint = async () => {
    if (!estimate) return;
    await loadPdfUtils();
    await pdfUtils?.printEstimate(estimate);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:max-h-[90vh] bg-bg-surface border border-border-accent rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                    <Loader2 size={48} className="text-primary animate-spin" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-primary/5 rounded-full"
                  />
                </div>
                <h3 className="text-2xl font-black uppercase mb-2 text-center">AI Analysis in Progress</h3>
                <p className="text-text-muted text-center max-w-md">
                  Our AI is carefully analyzing your electrical plan, calculating materials, labor costs, and timeline...
                </p>
                <div className="flex gap-2 mt-6">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scaleY: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-8 bg-primary rounded-full"
                    />
                  ))}
                </div>
              </div>
            ) : estimate ? (
              <>
                {/* Professional Header */}
                <div className="bg-gradient-to-r from-bg-base to-bg-surface border-b border-border-accent p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                        <FileText size={28} className="text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl font-black uppercase tracking-tight">Official Estimate</h2>
                          <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-bold uppercase tracking-wider rounded">
                            Pending Review
                          </span>
                        </div>
                        <p className="text-sm text-text-muted font-mono">{estimate.id} • {formatDate()}</p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 space-y-6">
                    {/* AI Analysis Banner */}
                    <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm mb-0.5">AI-Generated Estimate</p>
                        <p className="text-xs text-text-muted">
                          This estimate was generated using advanced AI analysis of your electrical plan.
                          Confidence level: <span className="text-primary font-bold">{Math.round(estimate.confidence * 100)}%</span>
                        </p>
                      </div>
                    </div>

                    {/* Project Info Grid */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-bg-base rounded-xl p-4 border border-border-accent/50">
                        <div className="flex items-center gap-2 text-text-muted text-xs uppercase tracking-wider mb-2">
                          <Building2 size={14} />
                          Project Type
                        </div>
                        <p className="font-bold">{estimate.projectSummary.split(' ')[0]}</p>
                      </div>
                      <div className="bg-bg-base rounded-xl p-4 border border-border-accent/50">
                        <div className="flex items-center gap-2 text-text-muted text-xs uppercase tracking-wider mb-2">
                          <Clock size={14} />
                          Estimated Duration
                        </div>
                        <p className="font-bold">{estimate.estimatedDays} day{estimate.estimatedDays !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="bg-bg-base rounded-xl p-4 border border-border-accent/50">
                        <div className="flex items-center gap-2 text-text-muted text-xs uppercase tracking-wider mb-2">
                          <Shield size={14} />
                          Valid Until
                        </div>
                        <p className="font-bold">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="bg-bg-base rounded-xl border border-border-accent/50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-border-accent/50 bg-bg-surface/50">
                        <h3 className="text-sm font-bold uppercase tracking-wider">Estimate Breakdown</h3>
                      </div>
                      <table className="w-full">
                        <thead className="bg-bg-surface/30">
                          <tr className="text-left text-xs uppercase tracking-wider text-text-muted border-b border-border-accent/30">
                            <th className="py-3 px-4 font-bold">Description</th>
                            <th className="py-3 px-4 font-bold text-center w-20">Qty</th>
                            <th className="py-3 px-4 font-bold text-right">Unit Price</th>
                            <th className="py-3 px-4 font-bold text-right w-32">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {estimate.items.map((item, index) => (
                            <tr
                              key={index}
                              className="border-b border-border-accent/20 last:border-0 hover:bg-white/5 transition-colors"
                            >
                              <td className="py-3 px-4 text-sm">{item.description}</td>
                              <td className="py-3 px-4 text-center text-sm text-text-muted">{item.quantity}</td>
                              <td className="py-3 px-4 text-right text-sm text-text-muted">
                                {formatCurrency(item.unitPrice)}
                              </td>
                              <td className="py-3 px-4 text-right font-bold">
                                {formatCurrency(item.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals Section */}
                    <div className="bg-bg-base rounded-xl p-6 border border-border-accent/50">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-muted">Subtotal</span>
                          <span className="font-medium">{formatCurrency(estimate.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-text-muted">Tax (7%)</span>
                          <span className="font-medium">{formatCurrency(estimate.tax)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-text-muted">Permits & Inspections</span>
                          <span className="font-medium text-green-500">Included</span>
                        </div>
                        <div className="pt-3 border-t border-border-accent/30 flex justify-between items-center">
                          <span className="text-lg font-black uppercase">Total Estimate</span>
                          <span className="text-3xl font-black text-primary">{formatCurrency(estimate.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-500 mb-3 flex items-center gap-2">
                        <AlertCircle size={16} />
                        Terms & Conditions
                      </h3>
                      <ul className="space-y-2">
                        {estimate.notes.map((note, index) => (
                          <li key={index} className="text-sm text-text-muted flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0" />
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* José's Review Section */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-black text-lg">
                          JL
                        </div>
                        <div>
                          <p className="font-bold">José L. Saladin</p>
                          <p className="text-xs text-text-muted">Master Electrician • Reviewing Estimate</p>
                        </div>
                      </div>
                      <p className="text-sm text-text-muted mb-4">
                        This AI-generated estimate requires my approval before being sent to the customer.
                        Please review the breakdown and approve if everything looks correct.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={onApprove}
                          className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                        >
                          <Check size={20} />
                          Approve & Send
                        </button>
                        <button
                          onClick={onReject}
                          className="flex-1 bg-bg-surface border-2 border-border-accent hover:border-red-500/50 hover:text-red-500 py-3 px-6 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                        >
                          <RefreshCw size={20} />
                          Request Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="border-t border-border-accent/50 p-4 bg-bg-base flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownload}
                      disabled={!estimate}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-muted hover:text-primary transition-colors disabled:opacity-50"
                    >
                      <Download size={18} />
                      Download PDF
                    </button>
                    <button
                      onClick={handlePrint}
                      disabled={!estimate}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-muted hover:text-primary transition-colors disabled:opacity-50"
                    >
                      <Printer size={18} />
                      Print
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Shield size={14} className="text-primary" />
                    Secure Document
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-12">
                <p className="text-text-muted">No estimate available</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
