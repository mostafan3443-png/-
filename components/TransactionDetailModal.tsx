import React, { useRef } from 'react';
import moment from 'jalali-moment';
import { Transaction, TransactionFlow, IncomeCategory, ExpenseCategory } from '../types';
import { PERSIAN_TO_INCOME_CATEGORY, PERSIAN_TO_EXPENSE_CATEGORY } from '../constants';

const INCOME_CATEGORY_TO_PERSIAN: Record<IncomeCategory, string> = Object.fromEntries(
  Object.entries(PERSIAN_TO_INCOME_CATEGORY).map(([k, v]) => [v, k])
) as Record<IncomeCategory, string>;

const EXPENSE_CATEGORY_TO_PERSIAN: Record<ExpenseCategory, string> = Object.fromEntries(
  Object.entries(PERSIAN_TO_EXPENSE_CATEGORY).map(([k, v]) => [v, k])
) as Record<ExpenseCategory, string>;


interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ isOpen, onClose, transaction }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !transaction) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' ریال';
  };

  const getCategoryName = (category: IncomeCategory | ExpenseCategory, flow: TransactionFlow) => {
    if (flow === TransactionFlow.INCOME) {
        return INCOME_CATEGORY_TO_PERSIAN[category as IncomeCategory] || category;
    }
    return EXPENSE_CATEGORY_TO_PERSIAN[category as ExpenseCategory] || category;
  };
  
  const formatDate = (date: string) => moment(date).locale('fa').format('dddd، jD jMMMM jYYYY');
  const formatTime = (date: string) => moment(date).locale('fa').format('HH:mm');
  const flowText = transaction.flow === TransactionFlow.INCOME ? 'واریز' : 'برداشت';

  const DetailRow: React.FC<{ label: string; value: string | undefined | null; highlight?: boolean }> = ({ label, value, highlight = false }) => (
    value ? (
      <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-base font-medium text-gray-500">{label}</dt>
        <dd className={`mt-1 text-base text-gray-900 sm:mt-0 sm:col-span-2 font-yekan ${highlight ? 'text-xl font-bold' : ''}`}>
            {value}
        </dd>
      </div>
    ) : null
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div ref={modalRef} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl m-4 transform transition-all" dir="rtl">
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
            <h2 className="text-2xl font-bold text-gray-800" id="modal-title">جزئیات تراکنش</h2>
             <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-base font-semibold ${
                transaction.flow === TransactionFlow.INCOME 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {transaction.flow === TransactionFlow.INCOME ? 'تراکنش ورودی' : 'تراکنش خروجی'}
            </div>
        </div>
        
        <div className="flow-root">
          <dl className="divide-y divide-gray-200">
            <DetailRow label="شرح تراکنش" value={transaction.description} />
            <DetailRow label="دسته بندی" value={getCategoryName(transaction.category, transaction.flow)} />
            <DetailRow label="تاریخ" value={formatDate(transaction.date)} />
            <DetailRow label="ساعت" value={formatTime(transaction.date)} />
            <DetailRow label={`مبلغ ${flowText} شده`} value={formatCurrency(transaction.amount)} highlight={true}/>
            <DetailRow label="منبع / شخص" value={transaction.source} />
          </dl>
        </div>
        
        <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-base font-semibold"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;