export interface School {
  id: string;
  name: string;
  address?: string;
  logo?: string;
  currency: string;
  lateFeeRules?: {
    tier1Days: number;
    tier1Percent: number;
    tier2Days: number;
    tier2Percent: number;
    fixedPenalty: number;
  };
  createdAt: any;
}

export interface UserProfile {
  id: string;
  schoolId: string;
  role: 'super_admin' | 'admin' | 'accountant';
  email: string;
  name: string;
}

export interface Student {
  id: string;
  schoolId: string;
  fullName: string;
  grade: string;
  fatherName?: string;
  motherName?: string;
  whatsappStudent?: string;
  whatsappFather?: string;
  whatsappMother?: string;
  feePlan: number;
  admissionDate: string;
  status: 'active' | 'inactive';
  createdAt: any;
}

export interface Invoice {
  id: string;
  schoolId: string;
  studentId: string;
  month: number;
  year: number;
  baseAmount: number;
  lateFee: number;
  totalAmount: number;
  dueDate: any;
  status: 'pending' | 'sent' | 'paid' | 'overdue';
  lateFeeAppliedAt?: any;
  createdAt: any;
}

export interface Receipt {
  id: string;
  schoolId: string;
  invoiceId: string;
  receiptNumber: string;
  amountPaid: number;
  paymentDate: any;
  paymentMethod: string;
  filePath?: string;
}
