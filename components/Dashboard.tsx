import React from 'react';
import { Transaction, TransactionFlow } from '../types';
import TransactionList from './TransactionList';
import WalletIcon from './icons/WalletIcon';
import ArrowUpIcon from './icons/ArrowUpIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';

interface DashboardProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, onDeleteTransaction }) => {
  const totalIncome = transactions
    .filter((t) => t.flow === TransactionFlow.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.flow === TransactionFlow.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' ریال';
  };

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <ArrowUpIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-base text-gray-600">مجموع درآمد</p>
            <p className="text-2xl font-semibold text-gray-800 font-yekan">{formatCurrency(totalIncome)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div className="bg-red-100 p-3 rounded-full mr-4">
            <ArrowDownIcon className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-base text-gray-600">مجموع هزینه</p>
            <p className="text-2xl font-semibold text-gray-800 font-yekan">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <WalletIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-base text-gray-600">موجودی</p>
            <p className="text-2xl font-semibold text-gray-800 font-yekan">{formatCurrency(balance)}</p>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <TransactionList transactions={transactions} onDelete={onDeleteTransaction} />
    </div>
  );
};

export default Dashboard;