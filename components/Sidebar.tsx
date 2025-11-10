import React from 'react';
import { View } from '../App';
import CharityIcon from './icons/CharityIcon';
import DashboardIcon from './icons/DashboardIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import BeneficiaryIcon from './icons/BeneficiaryIcon';
import ReceiptIcon from './icons/ReceiptIcon';
import DocumentIcon from './icons/DocumentIcon';
import InKindIcon from './icons/InKindIcon';
import SmsIcon from './icons/SmsIcon';
import BoardIcon from './icons/BoardIcon';
import MinutesIcon from './icons/MinutesIcon';
import ActionIcon from './icons/ActionIcon';


interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const financialItems = [
  { view: 'dashboard' as View, label: 'داشبورد', icon: DashboardIcon },
  { view: 'analytics' as View, label: 'تحلیل و گزارشات', icon: ChartBarIcon },
  { view: 'receipts' as View, label: 'رسیدهای کمک', icon: ReceiptIcon },
];

const managementItems = [
    { view: 'beneficiaries' as View, label: 'مدیریت مددجویان', icon: BeneficiaryIcon },
    { view: 'in-kind' as View, label: 'کمک‌های غیرنقدی', icon: InKindIcon },
    { view: 'documents' as View, label: 'بارگذاری اسناد', icon: DocumentIcon },
    { view: 'sms' as View, label: 'سامانه پیامکی', icon: SmsIcon },
];

const boardItems = [
    { view: 'board' as View, label: 'اعضای هیئت مدیره', icon: BoardIcon },
    { view: 'minutes' as View, label: 'صورتجلسات', icon: MinutesIcon },
    { view: 'actions' as View, label: 'موارد اقدام', icon: ActionIcon },
]

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const NavLink: React.FC<{
    view: View;
    label: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
  }> = ({ view, label, icon: Icon }) => {
    const isActive = activeView === view;
    return (
      <button
        onClick={() => setActiveView(view)}
        className={`flex items-center w-full px-4 py-3 text-base rounded-lg transition-colors ${
          isActive
            ? 'bg-sky-600 text-white shadow-md'
            : 'text-sky-800 hover:bg-sky-200 hover:text-sky-900'
        }`}
      >
        <Icon className="w-6 h-6 ml-4" />
        <span className="font-titr font-bold">{label}</span>
      </button>
    );
  };

  return (
    <aside className="w-72 bg-sky-100 flex flex-col p-4 border-l border-sky-200">
      <div className="flex items-center mb-8 px-2">
        <div className="bg-white p-2 rounded-lg shadow-sm">
          <CharityIcon className="h-10 w-10 text-sky-600" />
        </div>
        <h1 className="text-lg font-bold text-sky-900 mr-3 font-titr">خیریه کارکنان شرکت</h1>
      </div>
      <nav className="flex-1 flex flex-col gap-y-6">
        <div>
          <h2 className="px-4 mb-2 text-sm font-semibold text-sky-600 uppercase tracking-wider">مالی و گزارشات</h2>
          <div className="space-y-2">
            {financialItems.map((item) => (
              <NavLink key={item.view} {...item} />
            ))}
          </div>
        </div>
        <div>
           <h2 className="px-4 mb-2 text-sm font-semibold text-sky-600 uppercase tracking-wider">مدیریت عملیات</h2>
           <div className="space-y-2">
            {managementItems.map((item) => (
              <NavLink key={item.view} {...item} />
            ))}
           </div>
        </div>
         <div>
           <h2 className="px-4 mb-2 text-sm font-semibold text-sky-600 uppercase tracking-wider">سازمان</h2>
           <div className="space-y-2">
            {boardItems.map((item) => (
              <NavLink key={item.view} {...item} />
            ))}
           </div>
        </div>
      </nav>
      <div className="mt-auto px-4 py-2 text-center text-xs text-sky-500">
        نسخه ۱.۰.۰
      </div>
    </aside>
  );
};

export default Sidebar;