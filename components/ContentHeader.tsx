import React from 'react';
import PlusIcon from './icons/PlusIcon';

interface ContentHeaderProps {
  title: string;
  onAddTransaction: () => void;
  showAddButton?: boolean;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({ title, onAddTransaction, showAddButton }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      {showAddButton && (
        <button
          onClick={onAddTransaction}
          className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow"
        >
          <PlusIcon className="h-5 w-5 ml-2" />
          <span className="text-base font-medium">تراکنش جدید</span>
        </button>
      )}
    </div>
  );
};

export default ContentHeader;