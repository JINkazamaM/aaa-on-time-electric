import { useState, useCallback } from 'react';

export interface EstimateItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface EstimateData {
  id: string;
  projectSummary: string;
  items: EstimateItem[];
  subtotal: number;
  tax: number;
  total: number;
  estimatedDays: number;
  notes: string[];
  confidence: number;
}

interface EstimateRequest {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  details: string;
  fileName: string;
  fileContent: string;
}

export function useAiEstimate() {
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateEstimate = useCallback(async (request: EstimateRequest): Promise<EstimateData | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      // Simulate AI processing delay based on file size / content complexity
      const processingTime = 2500 + (request.fileContent.length > 500 ? 1000 : 0);
      await new Promise(resolve => setTimeout(resolve, processingTime));

      // Mock AI estimate generation based on project type and file content
      const mockEstimate = generateMockEstimate(request);
      setEstimate(mockEstimate);
      return mockEstimate;
    } catch (err) {
      setError('Failed to generate estimate. Please try again or contact us directly.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const sendEstimateToJose = useCallback(async (data: {
    estimate: EstimateData;
    email: string;
    name: string;
    phone: string;
    fileName: string;
  }) => {
    // In production, this would send to José's email/SMS/notification system
    console.log('📧 Sending estimate to José for review:', {
      to: 'jose@aaaontimeelectric.com',
      subject: `AI Estimate Ready for Review: ${data.name}`,
      estimate: data.estimate,
      customer: { name: data.name, email: data.email, phone: data.phone },
      file: data.fileName
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }, []);

  const sendEstimateToUser = useCallback(async (data: {
    estimate: EstimateData;
    email: string;
    name: string;
  }) => {
    // In production, this would send to user's email
    console.log('📧 Sending approved estimate to user:', {
      to: data.email,
      subject: 'Your Electrical Estimate from AAA On Time Electric',
      estimate: data.estimate,
      name: data.name
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }, []);

  const approveEstimate = useCallback(async (estimateId: string) => {
    console.log('✅ Estimate approved:', estimateId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
  }, []);

  return {
    estimate,
    isGenerating,
    error,
    generateEstimate,
    sendEstimateToJose,
    sendEstimateToUser,
    approveEstimate
  };
}

// Mock estimate generator based on project type
function generateMockEstimate(request: EstimateRequest): EstimateData {
  const baseRates: Record<string, { hourlyRate: number; materialMarkup: number }> = {
    Commercial: { hourlyRate: 150, materialMarkup: 1.25 },
    Industrial: { hourlyRate: 180, materialMarkup: 1.3 },
    Residential: { hourlyRate: 120, materialMarkup: 1.2 },
    Emergency: { hourlyRate: 220, materialMarkup: 1.4 }
  };

  const rate = baseRates[request.projectType] || baseRates.Commercial;

  // Generate items based on project type
  let items: EstimateItem[] = [];
  let estimatedDays = 1;

  switch (request.projectType) {
    case 'Commercial':
      items = [
        { description: 'Site Assessment & Planning', quantity: 4, unitPrice: rate.hourlyRate, total: 4 * rate.hourlyRate },
        { description: 'Panel Upgrade (400A)', quantity: 1, unitPrice: 3500 * rate.materialMarkup, total: 3500 * rate.materialMarkup },
        { description: 'LED Lighting Installation (per fixture)', quantity: 20, unitPrice: 85 * rate.materialMarkup, total: 1700 * rate.materialMarkup },
        { description: 'Circuit Installation', quantity: 8, unitPrice: 450, total: 3600 },
        { description: 'Code Compliance Inspection', quantity: 1, unitPrice: 350, total: 350 }
      ];
      estimatedDays = 5;
      break;

    case 'Industrial':
      items = [
        { description: 'High-Voltage System Assessment', quantity: 8, unitPrice: rate.hourlyRate, total: 8 * rate.hourlyRate },
        { description: 'Machinery Wiring (per machine)', quantity: 3, unitPrice: 2800, total: 8400 },
        { description: 'Underground Conduit Installation', quantity: 200, unitPrice: 12 * rate.materialMarkup, total: 2400 * rate.materialMarkup },
        { description: 'Safety Systems Integration', quantity: 1, unitPrice: 5500, total: 5500 },
        { description: 'Load Calculations & Testing', quantity: 6, unitPrice: rate.hourlyRate, total: 6 * rate.hourlyRate }
      ];
      estimatedDays = 12;
      break;

    case 'Residential':
      items = [
        { description: 'Home Electrical Inspection', quantity: 2, unitPrice: rate.hourlyRate, total: 2 * rate.hourlyRate },
        { description: 'Panel Upgrade (200A)', quantity: 1, unitPrice: 2200 * rate.materialMarkup, total: 2200 * rate.materialMarkup },
        { description: 'Outlet/Switch Installation', quantity: 10, unitPrice: 95, total: 950 },
        { description: 'GFCI Circuit Installation', quantity: 3, unitPrice: 275, total: 825 },
        { description: 'Smoke Detector Wiring', quantity: 4, unitPrice: 125, total: 500 }
      ];
      estimatedDays = 2;
      break;

    case 'Emergency':
      items = [
        { description: 'Emergency Response (After Hours)', quantity: 3, unitPrice: rate.hourlyRate, total: 3 * rate.hourlyRate },
        { description: 'Troubleshooting & Diagnosis', quantity: 2, unitPrice: rate.hourlyRate, total: 2 * rate.hourlyRate },
        { description: 'Parts & Materials', quantity: 1, unitPrice: 500 * rate.materialMarkup, total: 500 * rate.materialMarkup },
        { description: 'Temporary Power Solution', quantity: 1, unitPrice: 350, total: 350 }
      ];
      estimatedDays = 1;
      break;

    default:
      items = [
        { description: 'General Electrical Work', quantity: 8, unitPrice: rate.hourlyRate, total: 8 * rate.hourlyRate },
        { description: 'Materials & Supplies', quantity: 1, unitPrice: 800, total: 800 }
      ];
      estimatedDays = 2;
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.07; // 7% tax
  const total = subtotal + tax;

  return {
    id: 'EST-' + Date.now().toString(36).toUpperCase(),
    projectSummary: `${request.projectType} electrical project for ${request.name}`,
    items,
    subtotal: Math.round(subtotal),
    tax: Math.round(tax),
    total: Math.round(total),
    estimatedDays,
    notes: [
      'Estimate based on uploaded electrical plan and project details',
      'Final pricing may vary based on site conditions',
      'Permits and inspections included where required',
      'Valid for 30 days from issue date'
    ],
    confidence: 0.87
  };
}
