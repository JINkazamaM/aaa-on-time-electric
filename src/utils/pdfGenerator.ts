import type { EstimateData } from '../hooks/useAiEstimate';

// Dynamic import for jsPDF to avoid loading it on initial page load
// This reduces initial bundle size by ~593KB

export async function generateEstimatePDF(estimate: EstimateData): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  doc.setFillColor(6, 182, 212); // cyan-500
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AAA ON TIME ELECTRIC', margin, 25);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Professional Electrical Contracting', margin, 33);

  yPos = 55;
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Official Estimate', margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Estimate ID: ${estimate.id}`, margin, yPos);
  yPos += 5;
  doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, yPos);
  yPos += 5;
  doc.text(`Valid Until: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`, margin, yPos);
  yPos += 15;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Project Summary', margin, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(estimate.projectSummary, margin, yPos);
  yPos += 15;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Estimate Breakdown', margin, yPos);
  yPos += 10;

  doc.setFillColor(248, 248, 248);
  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');

  doc.setFontSize(9);
  doc.text('Description', margin + 2, yPos);
  doc.text('Qty', pageWidth - 80, yPos);
  doc.text('Unit Price', pageWidth - 55, yPos);
  doc.text('Total', pageWidth - margin, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'normal');
  estimate.items.forEach((item) => {
    const description = item.description.length > 50 ? item.description.substring(0, 47) + '...' : item.description;
    doc.text(description, margin + 2, yPos);
    doc.text(item.quantity.toString(), pageWidth - 80, yPos);
    doc.text(formatCurrency(item.unitPrice), pageWidth - 55, yPos);
    doc.text(formatCurrency(item.total), pageWidth - margin, yPos);
    yPos += 7;
  });

  yPos += 5;
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  const subtotalX = pageWidth - 80;
  doc.text('Subtotal:', subtotalX, yPos);
  doc.text(formatCurrency(estimate.subtotal), pageWidth - margin, yPos);
  yPos += 7;

  doc.text('Tax (7%):', subtotalX, yPos);
  doc.text(formatCurrency(estimate.tax), pageWidth - margin, yPos);
  yPos += 7;

  doc.text('Permits & Inspections:', subtotalX, yPos);
  doc.setTextColor(34, 197, 94);
  doc.text('Included', pageWidth - margin, yPos);
  yPos += 10;

  doc.setFillColor(6, 182, 212);
  doc.rect(pageWidth - 90, yPos - 5, 70, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', pageWidth - 85, yPos + 4);
  doc.text(formatCurrency(estimate.total), pageWidth - margin, yPos + 4);

  yPos += 25;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Conditions', margin, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  estimate.notes.forEach((note, i) => {
    doc.text(`${i + 1}. ${note}`, margin + 2, yPos);
    yPos += 5;
  });

  yPos += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Contact Information', margin, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Phone: (786) 295-1748', margin, yPos);
  yPos += 5;
  doc.text('Email: info@aaaontimeelectric.com', margin, yPos);
  yPos += 5;
  doc.text('License: ER13015944 - Statewide Florida', margin, yPos);

  yPos += 15;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('This estimate was generated using AI analysis. Final pricing may vary based on site conditions.', margin, yPos);
  doc.text('Valid for 30 days from issue date.', margin, yPos + 5);

  return doc.output('blob');
}

export async function downloadEstimatePDF(estimate: EstimateData): Promise<void> {
  const blob = await generateEstimatePDF(estimate);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `AAA-Estimate-${estimate.id}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function printEstimate(estimate: EstimateData): Promise<void> {
  const blob = await generateEstimatePDF(estimate);
  const url = URL.createObjectURL(blob);

  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
    setTimeout(() => {
      try {
        printWindow.print();
      } catch {
        // Silent fail - user can manually print
      }
    }, 1000);
  } else {
    window.open(url, '_blank');
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}
