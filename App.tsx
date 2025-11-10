import React, { useState } from 'react';
import { Transaction, InKindDonation } from './types';
import { INITIAL_TRANSACTIONS } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AddTransactionModal from './components/AddTransactionModal';
import ContentHeader from './components/ContentHeader';
import BeneficiaryManagement from './components/BeneficiaryManagement';
import DonationReceipts from './components/DonationReceipts';
import DocumentUpload from './components/DocumentUpload';
import InKindDonations from './components/InKindDonations';
import SmsSystem from './components/SmsSystem';
import BoardMembers from './components/BoardMembers';
import MeetingMinutes from './components/MeetingMinutes';
import ActionItems from './components/ActionItems';

export type View =
  | 'dashboard'
  | 'analytics'
  | 'beneficiaries'
  | 'receipts'
  | 'documents'
  | 'in-kind'
  | 'sms'
  | 'board'
  | 'minutes'
  | 'actions';
  
export interface ReceiptData {
    type: 'in-kind';
    donorName: string;
    description: string;
    date: string;
}

const viewTitles: Record<View, string> = {
  dashboard: 'داشبورد',
  analytics: 'تحلیل و گزارشات',
  beneficiaries: 'مدیریت مددجویان',
  receipts: 'رسیدهای کمک',
  documents: 'بارگذاری اسناد',
  'in-kind': 'کمک‌های غیرنقدی',
  sms: 'سامانه پیامکی',
  board: 'اعضای هیئت مدیره',
  minutes: 'صورتجلسات',
  actions: 'موارد اقدام',
};

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receiptDataToPreload, setReceiptDataToPreload] = useState<ReceiptData | null>(null);

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `t${Date.now()}`,
    };
    setTransactions((prev) => [...prev, newTransaction]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleGenerateReceipt = (data: InKindDonation) => {
    setReceiptDataToPreload({
        type: 'in-kind',
        donorName: data.donorName,
        description: data.description,
        date: data.donationDate,
    });
    setActiveView('receipts');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard transactions={transactions} onDeleteTransaction={handleDeleteTransaction} />;
      case 'analytics':
        return <AnalyticsDashboard transactions={transactions} />;
      case 'beneficiaries':
        return <BeneficiaryManagement />;
      case 'receipts':
          return <DonationReceipts receiptData={receiptDataToPreload} onDataPreloaded={() => setReceiptDataToPreload(null)} />;
      case 'documents':
          return <DocumentUpload />;
      case 'in-kind':
          return <InKindDonations onGenerateReceipt={handleGenerateReceipt}/>;
      case 'sms':
          return <SmsSystem />;
      case 'board':
          return <BoardMembers />;
      case 'minutes':
          return <MeetingMinutes />;
      case 'actions':
          return <ActionItems />;
      default:
        return <Dashboard transactions={transactions} onDeleteTransaction={handleDeleteTransaction} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100" dir="rtl">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
            <ContentHeader 
                title={viewTitles[activeView]} 
                onAddTransaction={() => setIsModalOpen(true)} 
                showAddButton={activeView === 'dashboard'} 
            />
            {renderContent()}
        </div>
      </main>
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTransaction}
      />
    </div>
  );
};

export default App;