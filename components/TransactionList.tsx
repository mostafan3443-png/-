import React, { useState } from 'react';
import moment from 'jalali-moment';
import { Transaction, TransactionFlow, IncomeCategory, ExpenseCategory } from '../types';
import { PERSIAN_TO_INCOME_CATEGORY, PERSIAN_TO_EXPENSE_CATEGORY } from '../constants';
import TransactionDetailModal from './TransactionDetailModal';


const INCOME_CATEGORY_TO_PERSIAN: Record<IncomeCategory, string> = Object.fromEntries(
  Object.entries(PERSIAN_TO_INCOME_CATEGORY).map(([k, v]) => [v, k])
) as Record<IncomeCategory, string>;

const EXPENSE_CATEGORY_TO_PERSIAN: Record<ExpenseCategory, string> = Object.fromEntries(
  Object.entries(PERSIAN_TO_EXPENSE_CATEGORY).map(([k, v]) => [v, k])
) as Record<ExpenseCategory, string>;


interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  const getCategoryName = (category: IncomeCategory | ExpenseCategory, flow: TransactionFlow) => {
    if (flow === TransactionFlow.INCOME) {
        return INCOME_CATEGORY_TO_PERSIAN[category as IncomeCategory] || category;
    }
    return EXPENSE_CATEGORY_TO_PERSIAN[category as ExpenseCategory] || category;
  };

  const sortedTransactions = [...transactions].sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf());

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
  };


  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">آخرین تراکنش‌ها</h2>
        </div>
        <div className="overflow-x-auto">
          {sortedTransactions.length > 0 ? (
            <table className="w-full text-right">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">نوع</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">شرح / دسته بندی</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">تاریخ</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-left">مبلغ (ریال)</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedTransactions.map((t) => (
                  <tr key={t.id} 
                      className="hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => setSelectedTransaction(t)}
                  >
                    <td className="p-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          t.flow === TransactionFlow.INCOME 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {t.flow === TransactionFlow.INCOME ? 'ورودی' : 'خروجی'}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-base text-gray-900">{t.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {getCategoryName(t.category, t.flow)}
                        {t.source && <span className="text-gray-400 font-normal"> / {t.source}</span>}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-gray-600 font-yekan">
                      {moment(t.date).locale('fa').format('jYY/jMM/DD')}
                    </td>
                    <td className={`p-4 text-base font-bold font-yekan text-left whitespace-nowrap ${
                        t.flow === TransactionFlow.INCOME 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="p-4 text-center">
                        <button 
                          onClick={(e) => handleDeleteClick(e, t.id)} 
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          aria-label={`حذف تراکنش ${t.description}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-500 text-base">هیچ تراکنشی برای نمایش وجود ندارد.</p>
              <p className="text-gray-400 text-sm mt-2">برای شروع، یک تراکنش جدید اضافه کنید.</p>
            </div>
          )}
        </div>
      </div>
      <TransactionDetailModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />
    </>
  );
};

export default TransactionList;