// Fix: Removed self-import that was causing declaration conflicts.

export enum TransactionFlow {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum IncomeCategory {
  COMPANY_CONTRIBUTION = 'COMPANY_CONTRIBUTION',
  SHOP_RENTAL = 'SHOP_RENTAL',
  DIRECT_DONATION = 'DIRECT_DONATION',
}

export enum ExpenseCategory {
  GROCERIES = 'GROCERIES',
  STATIONERY = 'STATIONERY',
  ANIMAL_SACRIFICE = 'ANIMAL_SACRIFICE',
  BREAD = 'BREAD',
  OTHER = 'OTHER',
}

export type TransactionCategory = IncomeCategory | ExpenseCategory;

export interface Transaction {
  id: string;
  flow: TransactionFlow;
  category: TransactionCategory;
  amount: number;
  date: string;
  description: string;
  source?: string; // For tenant name, direct donor, etc.
}

export interface Child {
  id: string;
  name: string;
  gender: 'پسر' | 'دختر';
  educationalLevel: 'پیش دبستانی' | 'ابتدایی' | 'متوسطه اول' | 'متوسطه دوم' | 'دانشجو' | 'فارغ التحصیل' | 'ترک تحصیل';
  isStudent: boolean;
}

export interface Beneficiary {
  id: string;
  fullName: string;
  nationalId: string;
  householdSize: number;
  address: string;
  phoneNumber: string;
  supportStatus: 'فعال' | 'غیرفعال' | 'در حال بررسی';
  registrationDate: string; // ISO string
  children?: Child[];
}

export interface InKindDonation {
  id: string;
  donorName: string;
  donationDate: string; // ISO string
  description: string;
  estimatedValue: number;
}

export interface BoardMember {
  id: string;
  fullName: string;
  role: 'مدیرعامل' | 'رئیس هیئت مدیره' | 'نائب رئیس' | 'خزانه‌دار' | 'عضو هیئت مدیره' | 'بازرس';
  imageUrl?: string;
}

export interface MeetingMinute {
  id: string;
  title: string;
  date: string; // ISO string
  attendees: string[];
  content: string;
}

export interface ActionItem {
  id:string;
  title: string;
  assignedTo: string;
  dueDate: string; // ISO string
  description?: string;
  isCompleted: boolean;
  completionNotes?: string;
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
}