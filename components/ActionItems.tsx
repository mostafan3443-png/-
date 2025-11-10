import React, { useState, useMemo, useRef, useEffect } from 'react';
import moment from 'jalali-moment';
import { ActionItem } from '../types';
import PlusIcon from './icons/PlusIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import ActionIcon from './icons/ActionIcon';

const initialActionItems: ActionItem[] = [
  {
    id: 'ai1',
    title: 'پیگیری خرید لوازم التحریر',
    assignedTo: 'علی رضایی',
    dueDate: moment().add(5, 'days').toISOString(),
    description: 'خرید ۱۰۰ بسته لوازم التحریر برای دانش‌آموزان طبق مصوبه جلسه مهرماه.',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ai2',
    title: 'تهیه گزارش مالی سه ماهه',
    assignedTo: 'محمد کریمی',
    dueDate: moment().subtract(2, 'days').toISOString(),
    description: 'آماده‌سازی گزارش مالی برای ارائه در جلسه بعدی هیئت مدیره.',
    isCompleted: false,
    createdAt: moment().subtract(10, 'days').toISOString(),
  },
  {
    id: 'ai3',
    title: 'هماهنگی برای توزیع بسته‌های معیشتی',
    assignedTo: 'زهرا حسینی',
    dueDate: moment().subtract(15, 'days').toISOString(),
    isCompleted: true,
    completionNotes: 'هماهنگی‌های لازم با فروشگاه و تیم توزیع انجام شد. بسته‌ها در تاریخ مقرر بین ۱۵ خانوار توزیع گردید. مستندات در بخش بارگذاری اسناد بایگانی شد.',
    createdAt: moment().subtract(25, 'days').toISOString(),
    completedAt: moment().subtract(14, 'days').toISOString(),
  },
];


const ActionItemModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Omit<ActionItem, 'id'> | ActionItem) => void;
    itemToEdit: ActionItem | null;
}> = ({ isOpen, onClose, onSave, itemToEdit }) => {
    const today = moment();
    const [title, setTitle] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [description, setDescription] = useState('');
    const [jalaliDate, setJalaliDate] = useState({
        year: today.jYear().toString(),
        month: (today.jMonth() + 1).toString(),
        day: today.jDate().toString(),
    });
    const [error, setError] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (itemToEdit) {
                const itemMoment = moment(itemToEdit.dueDate);
                setTitle(itemToEdit.title);
                setAssignedTo(itemToEdit.assignedTo);
                setDescription(itemToEdit.description || '');
                setJalaliDate({
                    year: itemMoment.jYear().toString(),
                    month: (itemMoment.jMonth() + 1).toString(),
                    day: itemMoment.jDate().toString(),
                });
            } else {
                const tomorrow = moment().add(1, 'day');
                setTitle('');
                setAssignedTo('');
                setDescription('');
                setJalaliDate({
                    year: tomorrow.jYear().toString(),
                    month: (tomorrow.jMonth() + 1).toString(),
                    day: tomorrow.jDate().toString(),
                });
            }
            setError('');
        }
    }, [isOpen, itemToEdit]);
    
    const handleSave = () => {
        if (!title.trim() || !assignedTo.trim()) {
            setError('عنوان و مسئول پیگیری الزامی است.');
            return;
        }
        const { year, month, day } = jalaliDate;
        const momentDate = moment(`${year}/${month}/${day}`, 'jYYYY/jMM/jDD');
        if (!momentDate.isValid() || parseInt(year) < 1300) {
            setError('تاریخ سررسید وارد شده معتبر نیست.');
            return;
        }

        const itemData = {
            title,
            assignedTo,
            dueDate: momentDate.endOf('day').toISOString(), // Set deadline to end of day
            description,
        };
        
        onSave(itemToEdit ? { ...itemToEdit, ...itemData } : { ...itemData, isCompleted: false, createdAt: new Date().toISOString() });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={(e) => { if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose()}}>
            <div ref={modalRef} className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl m-4">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">{itemToEdit ? 'ویرایش وظیفه' : 'افزودن مورد اقدام جدید'}</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان وظیفه" className="w-full p-2 border rounded"/>
                        <input type="text" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="مسئول پیگیری" className="w-full p-2 border rounded"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ سررسید</label>
                        <div className="flex gap-2">
                            <input type="number" placeholder="روز" value={jalaliDate.day} onChange={e => setJalaliDate(p => ({...p, day: e.target.value}))} className="w-full p-2 border rounded font-yekan"/>
                            <input type="number" placeholder="ماه" value={jalaliDate.month} onChange={e => setJalaliDate(p => ({...p, month: e.target.value}))} className="w-full p-2 border rounded font-yekan"/>
                            <input type="number" placeholder="سال" value={jalaliDate.year} onChange={e => setJalaliDate(p => ({...p, year: e.target.value}))} className="w-full p-2 border rounded font-yekan"/>
                        </div>
                    </div>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="توضیحات تکمیلی (اختیاری)" rows={4} className="w-full p-2 border rounded"/>
                </div>
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-100">انصراف</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">ذخیره</button>
                </div>
            </div>
        </div>
    );
};


const CompleteItemModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onComplete: (completionNotes: string) => void;
}> = ({ isOpen, onClose, onComplete }) => {
    const [completionNotes, setCompletionNotes] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) setCompletionNotes('');
    }, [isOpen]);

    const handleComplete = () => {
        if (!completionNotes.trim()) {
            alert('لطفاً گزارش اقدامات انجام شده را وارد کنید.');
            return;
        }
        onComplete(completionNotes);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={(e) => { if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose()}}>
            <div ref={modalRef} className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl m-4">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">تکمیل وظیفه و ثبت گزارش</h2>
                <textarea
                    value={completionNotes}
                    onChange={e => setCompletionNotes(e.target.value)}
                    placeholder="لطفاً گزارش اقدامات انجام شده برای این وظیفه را اینجا ثبت کنید..."
                    rows={6}
                    className="w-full p-2 border rounded"
                />
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-100">انصراف</button>
                    <button onClick={handleComplete} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">ثبت و تکمیل</button>
                </div>
            </div>
        </div>
    );
};


const ActionItems: React.FC = () => {
    const [items, setItems] = useState<ActionItem[]>(initialActionItems);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<ActionItem | null>(null);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [itemToComplete, setItemToComplete] = useState<ActionItem | null>(null);

    const { pending, overdue, completed } = useMemo(() => {
        const now = new Date();
        return items.reduce<{ pending: ActionItem[], overdue: ActionItem[], completed: ActionItem[] }>((acc, item) => {
            if (item.isCompleted) {
                acc.completed.push(item);
            } else if (new Date(item.dueDate) < now) {
                acc.overdue.push(item);
            } else {
                acc.pending.push(item);
            }
            return acc;
        }, { pending: [], overdue: [], completed: [] });
    }, [items]);

    const handleOpenAddModal = () => {
        setItemToEdit(null);
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = (item: ActionItem) => {
        setItemToEdit(item);
        setIsAddEditModalOpen(true);
    };

    const handleOpenCompleteModal = (item: ActionItem) => {
        setItemToComplete(item);
        setIsCompleteModalOpen(true);
    };

    const handleSave = (itemData: Omit<ActionItem, 'id'> | ActionItem) => {
        if ('id' in itemData) {
            setItems(items.map(i => i.id === itemData.id ? itemData : i));
        } else {
            const newItem: ActionItem = { ...itemData, id: `ai${Date.now()}` };
            setItems(prev => [...prev, newItem]);
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('آیا از حذف این مورد اطمینان دارید؟')) {
            setItems(items.filter(i => i.id !== id));
        }
    };

    const handleComplete = (completionNotes: string) => {
        if (itemToComplete) {
            setItems(items.map(i =>
                i.id === itemToComplete.id
                    ? { ...i, isCompleted: true, completionNotes, completedAt: new Date().toISOString() }
                    : i
            ));
        }
    };

    const ItemCard: React.FC<{ item: ActionItem; isOverdue?: boolean }> = ({ item, isOverdue = false }) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <h4 className="font-bold text-gray-800">{item.title}</h4>
            <p className="text-sm text-gray-500 mt-1">مسئول: <span className="font-semibold text-gray-600">{item.assignedTo}</span></p>
            <p className={`text-sm mt-1 font-yekan ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                سررسید: {moment(item.dueDate).format('jD jMMMM jYYYY')}
            </p>
            {item.description && <p className="text-sm text-gray-600 mt-2 pt-2 border-t border-dashed">{item.description}</p>}
            {item.isCompleted && item.completionNotes && (
                 <div className="mt-3 pt-3 border-t bg-green-50 p-2 rounded-md">
                    <p className="text-sm font-semibold text-green-800">گزارش اقدام:</p>
                    <p className="text-sm text-green-700 whitespace-pre-wrap">{item.completionNotes}</p>
                 </div>
            )}
            <div className="flex justify-end gap-1 mt-3">
                 {!item.isCompleted && (
                    <button onClick={() => handleOpenCompleteModal(item)} className="p-2 text-gray-500 hover:text-green-600" title="تکمیل وظیفه">
                        <ActionIcon className="w-5 h-5"/>
                    </button>
                )}
                <button onClick={() => handleOpenEditModal(item)} className="p-2 text-gray-500 hover:text-blue-600" title="ویرایش">
                    <EditIcon className="w-5 h-5"/>
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-500 hover:text-red-600" title="حذف">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );


    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">پیگیری وظایف و مصوبات</h2>
                <button onClick={handleOpenAddModal} className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 shadow">
                    <PlusIcon className="h-5 w-5 ml-2" /> افزودن مورد جدید
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pending Column */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-blue-800 border-b-2 border-blue-200 pb-2 mb-4">در حال انجام ({pending.length})</h3>
                    {pending.map(item => <ItemCard key={item.id} item={item} />)}
                </div>
                {/* Overdue Column */}
                <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-red-800 border-b-2 border-red-200 pb-2 mb-4">معوق ({overdue.length})</h3>
                     {overdue.map(item => <ItemCard key={item.id} item={item} isOverdue />)}
                </div>
                {/* Completed Column */}
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-green-800 border-b-2 border-green-200 pb-2 mb-4">انجام شده ({completed.length})</h3>
                     {completed.map(item => <ItemCard key={item.id} item={item} />)}
                </div>
            </div>

            <ActionItemModal
                isOpen={isAddEditModalOpen}
                onClose={() => setIsAddEditModalOpen(false)}
                onSave={handleSave}
                itemToEdit={itemToEdit}
            />

            <CompleteItemModal
                isOpen={isCompleteModalOpen}
                onClose={() => setIsCompleteModalOpen(false)}
                onComplete={handleComplete}
            />
        </div>
    );
};

export default ActionItems;
