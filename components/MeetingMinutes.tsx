import React, { useState, useRef, useEffect } from 'react';
import moment from 'jalali-moment';
import { MeetingMinute } from '../types';
import PlusIcon from './icons/PlusIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import EyeIcon from './icons/EyeIcon';

// Initial data for demonstration
const initialMinutes: MeetingMinute[] = [
  {
    id: 'm1',
    title: 'جلسه ماهانه هیئت مدیره - مهر ۱۴۰۴',
    date: '2025-10-20T14:00:00Z',
    attendees: ['محمد کریمی', 'زهرا حسینی', 'علی رضایی'],
    content: 'مصوبات جلسه:\n1. تصویب بودجه خرید لوازم التحریر برای دانش‌آموزان نیازمند.\n2. بررسی گزارش مالی سه ماهه سوم سال.\n3. برنامه‌ریزی برای توزیع بسته‌های معیشتی ماه آینده.',
  },
  {
    id: 'm2',
    title: 'جلسه فوق‌العاده بررسی کمک‌های غیرنقدی',
    date: '2025-11-05T10:30:00Z',
    attendees: ['محمد کریمی', 'فاطمه احمدی', 'علی رضایی'],
    content: 'در این جلسه، لیست کمک‌های غیرنقدی دریافتی از خیرین بررسی و مقرر شد این اقلام در اسرع وقت بین خانواده‌های شناسایی‌شده توزیع گردد.',
  },
];

// Modal for Adding/Editing a Meeting Minute
const MinuteModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (minute: Omit<MeetingMinute, 'id'> | MeetingMinute) => void;
    minuteToEdit: MeetingMinute | null;
}> = ({ isOpen, onClose, onSave, minuteToEdit }) => {
    const today = moment();
    const [title, setTitle] = useState('');
    const [attendees, setAttendees] = useState('');
    const [content, setContent] = useState('');
    const [jalaliDate, setJalaliDate] = useState({
        year: today.jYear().toString(),
        month: (today.jMonth() + 1).toString(),
        day: today.jDate().toString(),
    });
    const [error, setError] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (minuteToEdit) {
                const minuteMoment = moment(minuteToEdit.date);
                setTitle(minuteToEdit.title);
                setAttendees(minuteToEdit.attendees.join('\n'));
                setContent(minuteToEdit.content);
                setJalaliDate({
                    year: minuteMoment.jYear().toString(),
                    month: (minuteMoment.jMonth() + 1).toString(),
                    day: minuteMoment.jDate().toString(),
                });
            } else {
                setTitle('');
                setAttendees('');
                setContent('');
                const today = moment();
                setJalaliDate({
                    year: today.jYear().toString(),
                    month: (today.jMonth() + 1).toString(),
                    day: today.jDate().toString(),
                });
            }
            setError('');
        }
    }, [isOpen, minuteToEdit]);
    
    const handleSave = () => {
        if (!title.trim() || !content.trim()) {
            setError('عنوان و محتوای صورتجلسه الزامی است.');
            return;
        }
        const { year, month, day } = jalaliDate;
        const momentDate = moment(`${year}/${month}/${day}`, 'jYYYY/jMM/jDD');
        if (!momentDate.isValid() || parseInt(year) < 1300) {
            setError('تاریخ وارد شده معتبر نیست.');
            return;
        }

        const attendeesList = attendees.split('\n').map(a => a.trim()).filter(Boolean);

        const minuteData = {
            title,
            date: momentDate.toISOString(),
            attendees: attendeesList,
            content,
        };

        onSave(minuteToEdit ? { ...minuteData, id: minuteToEdit.id } : minuteData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={(e) => { if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose()}}>
            <div ref={modalRef} className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl m-4">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">{minuteToEdit ? 'ویرایش صورتجلسه' : 'ثبت صورتجلسه جدید'}</h2>
                <div className="space-y-4">
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان جلسه" className="w-full p-2 border rounded"/>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ جلسه</label>
                        <div className="flex gap-2">
                            <input type="number" placeholder="روز" value={jalaliDate.day} onChange={e => setJalaliDate(p => ({...p, day: e.target.value}))} className="w-full p-2 border rounded font-yekan"/>
                            <input type="number" placeholder="ماه" value={jalaliDate.month} onChange={e => setJalaliDate(p => ({...p, month: e.target.value}))} className="w-full p-2 border rounded font-yekan"/>
                            <input type="number" placeholder="سال" value={jalaliDate.year} onChange={e => setJalaliDate(p => ({...p, year: e.target.value}))} className="w-full p-2 border rounded font-yekan"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <textarea value={attendees} onChange={(e) => setAttendees(e.target.value)} placeholder="حاضرین جلسه (هر نام در یک خط)" rows={8} className="w-full p-2 border rounded"/>
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="محتوای صورتجلسه و مصوبات..." rows={8} className="w-full p-2 border rounded"/>
                     </div>
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


// Modal for Viewing a Meeting Minute
const MinuteDetailModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    minute: MeetingMinute | null;
}> = ({ isOpen, onClose, minute }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    if (!isOpen || !minute) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={(e) => { if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose()}}>
            <div ref={modalRef} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-3xl m-4">
                <div className="pb-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">{minute.title}</h2>
                    <p className="text-base text-gray-500 mt-1 font-yekan">{moment(minute.date).format('dddd، jD jMMMM jYYYY')}</p>
                </div>
                <div className="mt-6 max-h-[60vh] overflow-y-auto pr-2">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">حاضرین جلسه:</h3>
                    {minute.attendees.length > 0 ? (
                        <ul className="list-disc list-inside bg-gray-50 p-3 rounded-md mb-6">
                            {minute.attendees.map((attendee, index) => <li key={index} className="text-gray-800">{attendee}</li>)}
                        </ul>
                    ) : (
                        <p className="text-gray-500 italic mb-6">هیچ شرکت‌کننده‌ای ثبت نشده است.</p>
                    )}
                    
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">محتوای صورتجلسه:</h3>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{minute.content}</p>
                </div>
                <div className="flex justify-end mt-8 pt-4 border-t">
                    <button onClick={onClose} className="px-8 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-base font-semibold">بستن</button>
                </div>
            </div>
        </div>
    );
};


// Main Component
const MeetingMinutes: React.FC = () => {
    const [minutes, setMinutes] = useState<MeetingMinute[]>(initialMinutes);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [minuteToEdit, setMinuteToEdit] = useState<MeetingMinute | null>(null);
    const [minuteToView, setMinuteToView] = useState<MeetingMinute | null>(null);

    const sortedMinutes = [...minutes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleOpenAddModal = () => {
        setMinuteToEdit(null);
        setIsEditModalOpen(true);
    };

    const handleOpenEditModal = (minute: MeetingMinute) => {
        setMinuteToEdit(minute);
        setIsEditModalOpen(true);
    };

    const handleOpenViewModal = (minute: MeetingMinute) => {
        setMinuteToView(minute);
        setIsViewModalOpen(true);
    };

    const handleSave = (minuteData: Omit<MeetingMinute, 'id'> | MeetingMinute) => {
        if ('id' in minuteData) {
            setMinutes(minutes.map(m => m.id === minuteData.id ? minuteData : m));
        } else {
            const newMinute: MeetingMinute = {
                ...minuteData,
                id: `m${Date.now()}`,
            };
            setMinutes(prev => [...prev, newMinute]);
        }
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm('آیا از حذف این صورتجلسه اطمینان دارید؟')) {
            setMinutes(minutes.filter(m => m.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">بایگانی صورتجلسات</h2>
                <button onClick={handleOpenAddModal} className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow">
                    <PlusIcon className="h-5 w-5 ml-2" />
                    <span>ثبت صورتجلسه جدید</span>
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    {sortedMinutes.length > 0 ? (
                        <table className="w-full text-right">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600">عنوان جلسه</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">تاریخ</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">خلاصه</th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sortedMinutes.map(minute => (
                                    <tr key={minute.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-semibold text-gray-800">{minute.title}</td>
                                        <td className="p-4 font-yekan text-gray-600">{moment(minute.date).locale('fa').format('jYY/jMM/DD')}</td>
                                        <td className="p-4 text-gray-500 max-w-sm truncate">{minute.content}</td>
                                        <td className="p-4 text-left whitespace-nowrap">
                                            <button onClick={() => handleOpenViewModal(minute)} className="p-2 text-gray-500 hover:text-green-600" title="مشاهده"><EyeIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleOpenEditModal(minute)} className="p-2 text-gray-500 hover:text-blue-600" title="ویرایش"><EditIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleDelete(minute.id)} className="p-2 text-gray-500 hover:text-red-600" title="حذف"><TrashIcon className="w-5 h-5"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                         <div className="text-center p-8">
                            <p className="text-gray-500 text-base">هیچ صورتجلسه‌ای برای نمایش وجود ندارد.</p>
                        </div>
                    )}
                </div>
            </div>

            <MinuteModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSave}
                minuteToEdit={minuteToEdit}
            />

            <MinuteDetailModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                minute={minuteToView}
            />
        </div>
    );
};

export default MeetingMinutes;