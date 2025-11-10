import React, { useState, useRef, useEffect } from 'react';
import moment from 'jalali-moment';
import { Transaction, TransactionFlow, IncomeCategory, ExpenseCategory } from '../types';
import { PERSIAN_TO_INCOME_CATEGORY, PERSIAN_TO_EXPENSE_CATEGORY } from '../constants';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAdd }) => {
  const today = moment();
  const [jalaliDate, setJalaliDate] = useState({
    year: today.jYear().toString(),
    month: (today.jMonth() + 1).toString(),
    day: today.jDate().toString(),
  });
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [incomeAmount, setIncomeAmount] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IncomeCategory | ExpenseCategory | ''>('');
  const [source, setSource] = useState('');
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const transactionType: 'income' | 'expense' | null = incomeAmount ? 'income' : (expenseAmount ? 'expense' : null);

  // Reset category when transaction type changes
  useEffect(() => {
    setCategory('');
  }, [transactionType]);


  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  const resetForm = () => {
    const today = moment();
    setJalaliDate({
        year: today.jYear().toString(),
        month: (today.jMonth() + 1).toString(),
        day: today.jDate().toString(),
    });
    setTime(new Date().toTimeString().slice(0, 5));
    setIncomeAmount('');
    setExpenseAmount('');
    setDescription('');
    setCategory('');
    setSource('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const handleSubmit = () => {
    setError(null);

    // Date validation
    const { year, month, day } = jalaliDate;
    const momentDate = moment(`${year}/${month}/${day}`, 'jYYYY/jMM/jDD');
    if (!momentDate.isValid() || parseInt(year) < 1300) {
        setError('تاریخ وارد شده معتبر نیست.');
        return;
    }

    // Other validations
    if (!description.trim()) {
      setError('شرح تراکنش الزامی است.');
      return;
    }
    if (!incomeAmount && !expenseAmount) {
      setError('مبلغ واریزی یا مبلغ برداشت شده باید وارد شود.');
      return;
    }
    if (incomeAmount && expenseAmount) {
      setError('فقط یکی از موارد مبلغ واریزی یا مبلغ برداشت شده را وارد کنید.');
      return;
    }
    const amount = Number(incomeAmount || expenseAmount);
    if (isNaN(amount) || amount <= 0) {
        setError('مبلغ وارد شده معتبر نیست.');
        return;
    }
    if(!category){
        setError('دسته بندی تراکنش را انتخاب کنید.');
        return;
    }


    const flow = incomeAmount ? TransactionFlow.INCOME : TransactionFlow.EXPENSE;
    const combinedDateTime = moment(`${year}/${month}/${day} ${time}`, 'jYYYY/jMM/jDD HH:mm').toISOString();

    const newTransaction: Omit<Transaction, 'id'> = {
      flow,
      category,
      amount,
      date: combinedDateTime,
      description: description.trim(),
      source: source.trim() || undefined,
    };

    onAdd(newTransaction);
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const renderCategoryOptions = () => {
    if (transactionType === 'income') {
      return Object.entries(PERSIAN_TO_INCOME_CATEGORY).map(([name, value]) => (
        <option key={value} value={value}>{name}</option>
      ));
    }
    if (transactionType === 'expense') {
      return Object.entries(PERSIAN_TO_EXPENSE_CATEGORY).map(([name, value]) => (
        <option key={value} value={value}>{name}</option>
      ));
    }
    return null;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity"
      onClick={handleOverlayClick}
    >
      <div ref={modalRef} className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl m-4" dir="rtl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">ثبت تراکنش جدید</h2>
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">تاریخ (شمسی)</label>
                     <div className="flex gap-2">
                        <input type="number" placeholder="روز" value={jalaliDate.day} onChange={e => setJalaliDate(p => ({...p, day: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-base font-yekan"/>
                        <input type="number" placeholder="ماه" value={jalaliDate.month} onChange={e => setJalaliDate(p => ({...p, month: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-base font-yekan"/>
                        <input type="number" placeholder="سال" value={jalaliDate.year} onChange={e => setJalaliDate(p => ({...p, year: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-base font-yekan"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">ساعت</label>
                    <input type="time" id="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-base font-yekan" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-1">مبلغ واریزی (ریال)</label>
                    <input type="number" id="income" placeholder="0" value={incomeAmount} onChange={e => { setIncomeAmount(e.target.value); setExpenseAmount(''); }} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-base font-yekan" disabled={!!expenseAmount}/>
                </div>
                <div>
                    <label htmlFor="expense" className="block text-sm font-medium text-gray-700 mb-1">مبلغ برداشت شده (ریال)</label>
                    <input type="number" id="expense" placeholder="0" value={expenseAmount} onChange={e => { setExpenseAmount(e.target.value); setIncomeAmount(''); }} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-base font-yekan" disabled={!!incomeAmount}/>
                </div>
            </div>
            
            {transactionType && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">دسته بندی</label>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value as any)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white text-base">
                            <option value="" disabled>انتخاب کنید...</option>
                            {renderCategoryOptions()}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">منبع/شخص (اختیاری)</label>
                        <input type="text" id="source" value={source} onChange={e => setSource(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-base"/>
                    </div>
                </div>
            )}
           
            <div>
                 <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">شرح تراکنش</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-base"
                  rows={3}
                  placeholder="جزئیات تراکنش را وارد کنید..."
                />
            </div>
        </div>
        
        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 text-base"
          >
            انصراف
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 text-base"
          >
            ثبت تراکنش
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionModal;