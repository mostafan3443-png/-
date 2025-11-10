import { Transaction, TransactionFlow, IncomeCategory, ExpenseCategory } from './types';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    flow: TransactionFlow.INCOME,
    category: IncomeCategory.COMPANY_CONTRIBUTION,
    amount: 15000000,
    date: '2025-10-01T09:00:00Z',
    description: 'مشارکت ماه مهر شرکت',
  },
  {
    id: 't2',
    flow: TransactionFlow.INCOME,
    category: IncomeCategory.SHOP_RENTAL,
    amount: 2000000,
    date: '2025-10-03T11:30:00Z',
    description: 'اجاره مغازه شماره ۱',
    source: 'آقای محمدی'
  },
  {
    id: 't3',
    flow: TransactionFlow.EXPENSE,
    category: ExpenseCategory.GROCERIES,
    amount: 3500000,
    date: '2025-10-05T15:00:00Z',
    description: 'خرید بسته‌های معیشتی برای ۵ خانوار',
  },
  {
    id: 't4',
    flow: TransactionFlow.INCOME,
    category: IncomeCategory.DIRECT_DONATION,
    amount: 500000,
    date: '2025-10-10T10:15:00Z',
    description: 'کمک نقدی',
    source: 'یک همکار خیر'
  },
  {
    id: 't5',
    flow: TransactionFlow.EXPENSE,
    category: ExpenseCategory.ANIMAL_SACRIFICE,
    amount: 5000000,
    date: '2025-10-15T08:45:00Z',
    description: 'قربانی اول ماه',
  },
  {
    id: 't6',
    flow: TransactionFlow.EXPENSE,
    category: ExpenseCategory.STATIONERY,
    amount: 1200000,
    date: '2025-10-18T17:20:00Z',
    description: 'خرید لوازم‌التحریر برای دانش‌آموزان',
  },
   {
    id: 't7',
    flow: TransactionFlow.EXPENSE,
    category: ExpenseCategory.BREAD,
    amount: 750000,
    date: '2025-10-20T13:00:00Z',
    description: 'تامین نان روزانه',
  },
];

export const PERSIAN_TO_INCOME_CATEGORY: Record<string, IncomeCategory> = {
  "واریز شرکت": IncomeCategory.COMPANY_CONTRIBUTION,
  "اجاره بها": IncomeCategory.SHOP_RENTAL,
  "کمک مستقیم": IncomeCategory.DIRECT_DONATION,
};

export const PERSIAN_TO_EXPENSE_CATEGORY: Record<string, ExpenseCategory> = {
  "خرید مواد غذایی": ExpenseCategory.GROCERIES,
  "نوشت افزار": ExpenseCategory.STATIONERY,
  "ذبح دام": ExpenseCategory.ANIMAL_SACRIFICE,
  "نان": ExpenseCategory.BREAD,
  "سایر": ExpenseCategory.OTHER,
};

export const PERSIAN_FLOW: Record<string, TransactionFlow> = {
  "ورودی": TransactionFlow.INCOME,
  "خروجی": TransactionFlow.EXPENSE,
};