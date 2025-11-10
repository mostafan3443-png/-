import React, { useState, useMemo, useRef, useEffect } from 'react';
import moment from 'jalali-moment';
import { InKindDonation } from '../types';
import PlusIcon from './icons/PlusIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import WalletIcon from './icons/WalletIcon';
import ReceiptIcon from './icons/ReceiptIcon';

const initialDonations: InKindDonation[] = [
    { id: 'ik1', donorName: 'یک خیر گمنام', donationDate: new Date(Date.now() - 86400000 * 5).toISOString(), description: '۵۰ بسته لوازم التحریر', estimatedValue: 25000000 },
    { id: 'ik2', donorName: 'فروشگاه مواد غذایی المهدی', donationDate: new Date(Date.now() - 86400000 * 12).toISOString(), description: '۱۵۰ کیلوگرم برنج', estimatedValue: 12000000 },
    { id: 'ik3', donorName: 'خانواده محمدی', donationDate: new Date(Date.now() - 86400000 * 400).toISOString(), description: 'پوشاک زمستانی برای کودکان', estimatedValue: 8000000 },
];

const DonationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (donation: Omit<InKindDonation, 'id'> | InKindDonation) => void;
    donationToEdit: InKindDonation | null;
}> = ({ isOpen, onClose, onSave, donationToEdit }) => {
    const today = moment();
    const [formData, setFormData] = useState({
        donorName: '',
        description: '',
        estimatedValue: '',
        year: today.jYear().toString(),
        month: (today.jMonth() + 1).toString(),
        day: today.jDate().toString(),
    });
    const [error, setError] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (donationToEdit) {
                const donationMoment = moment(donationToEdit.donationDate);
                setFormData({
                    donorName: donationToEdit.donorName,
                    description: donationToEdit.description,
                    estimatedValue: donationToEdit.estimatedValue.toString(),
                    year: donationMoment.jYear().toString(),
                    month: (donationMoment.jMonth() + 1).toString(),
                    day: donationMoment.jDate().toString(),
                });
            } else {
                 const today = moment();
                 setFormData({ donorName: '', description: '', estimatedValue: '', year: today.jYear().toString(), month: (today.jMonth() + 1).toString(), day: today.jDate().toString() });
            }
            setError('');
        }
    }, [donationToEdit, isOpen]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const { year, month, day, donorName, description, estimatedValue } = formData;
        if (!donorName || !description || !estimatedValue) {
            setError('تمام فیلدها الزامی هستند.');
            return;
        }
        const momentDate = moment(`${year}/${month}/${day}`, 'jYYYY/jMM/jDD');
        if (!momentDate.isValid() || parseInt(year) < 1300) {
            setError('تاریخ وارد شده معتبر نیست.');
            return;
        }
        const donation: Omit<InKindDonation, 'id' | 'donationDate'> & { donationDate?: string } = {
            donorName,
            description,
            estimatedValue: Number(estimatedValue),
        };
        const donationDate = momentDate.toISOString();

        onSave(donationToEdit ? { ...donation, id: donationToEdit.id, donationDate } : { ...donation, donationDate });
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={(e) => { if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose()}}>
            <div ref={modalRef} className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl m-4">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">{donationToEdit ? 'ویرایش کمک' : 'ثبت کمک غیرنقدی جدید'}</h2>
                <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="donorName" value={formData.donorName} onChange={handleChange} placeholder="نام اهدا کننده" className="w-full p-2 border rounded"/>
                        <input name="estimatedValue" type="number" value={formData.estimatedValue} onChange={handleChange} placeholder="ارزش حدودی (ریال)" className="w-full p-2 border rounded font-yekan"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ اهدا</label>
                         <div className="flex gap-2">
                            <input type="number" name="day" placeholder="روز" value={formData.day} onChange={handleChange} className="w-full p-2 border rounded font-yekan"/>
                            <input type="number" name="month" placeholder="ماه" value={formData.month} onChange={handleChange} className="w-full p-2 border rounded font-yekan"/>
                            <input type="number" name="year" placeholder="سال" value={formData.year} onChange={handleChange} className="w-full p-2 border rounded font-yekan"/>
                        </div>
                    </div>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="شرح کمک (مثال: ۱۰ بسته مواد غذایی)" rows={3} className="w-full p-2 border rounded"/>
                </div>
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-6 py-2 border rounded-lg">انصراف</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">ذخیره</button>
                </div>
            </div>
        </div>
    );
}

interface InKindDonationsProps {
    onGenerateReceipt: (donation: InKindDonation) => void;
}

const InKindDonations: React.FC<InKindDonationsProps> = ({ onGenerateReceipt }) => {
    const [donations, setDonations] = useState<InKindDonation[]>(initialDonations);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [donationToEdit, setDonationToEdit] = useState<InKindDonation | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>(moment().jYear().toString());

    const availableYears = useMemo(() => {
        const years = new Set(donations.map(d => moment(d.donationDate).jYear().toString()));
        years.add(moment().jYear().toString()); // Ensure current year is always available
        return Array.from(years).sort((a, b) => Number(b) - Number(a));
    }, [donations]);

    const filteredDonations = useMemo(() => {
        return donations
            .filter(d => moment(d.donationDate).jYear().toString() === selectedYear)
            .sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime());
    }, [donations, selectedYear]);

    const totalValueForYear = useMemo(() => {
        return filteredDonations.reduce((sum, d) => sum + d.estimatedValue, 0);
    }, [filteredDonations]);

    const handleOpenModal = (donation: InKindDonation | null = null) => {
        setDonationToEdit(donation);
        setIsModalOpen(true);
    };

    const handleSave = (donationData: Omit<InKindDonation, 'id'> | InKindDonation) => {
        if ('id' in donationData) {
            setDonations(donations.map(d => d.id === donationData.id ? donationData : d));
        } else {
            const newDonation: InKindDonation = {
                ...donationData,
                id: `ik${Date.now()}`,
            };
            setDonations(prev => [...prev, newDonation]);
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('آیا از حذف این مورد اطمینان دارید؟')) {
            setDonations(donations.filter(d => d.id !== id));
        }
    };
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat('fa-IR').format(amount) + ' ریال';

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center">
                    <div className="bg-sky-100 p-3 rounded-full mr-4">
                        <WalletIcon className="h-8 w-8 text-sky-600" />
                    </div>
                    <div>
                        <p className="text-base text-gray-600">مجموع ارزش تخمینی در سال {selectedYear}</p>
                        <p className="text-3xl font-bold text-gray-800 font-yekan">{formatCurrency(totalValueForYear)}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="bg-white border border-gray-300 rounded-md p-2 text-base font-yekan">
                        {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                     <button onClick={() => handleOpenModal()} className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow">
                        <PlusIcon className="h-5 w-5 ml-2" /> افزودن کمک جدید
                    </button>
                 </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b"><h2 className="text-xl font-bold text-gray-800">بایگانی کمک‌های غیرنقدی سال {selectedYear}</h2></div>
                <div className="overflow-x-auto">
                     {filteredDonations.length > 0 ? (
                        <table className="w-full text-right">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600">اهدا کننده</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">شرح کمک</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">تاریخ</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">ارزش تخمینی</th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredDonations.map(d => (
                                    <tr key={d.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-semibold">{d.donorName}</td>
                                        <td className="p-4 text-gray-700">{d.description}</td>
                                        <td className="p-4 font-yekan">{moment(d.donationDate).locale('fa').format('jYY/jMM/DD')}</td>
                                        <td className="p-4 font-yekan">{formatCurrency(d.estimatedValue)}</td>
                                        <td className="p-4 text-left whitespace-nowrap">
                                            <button onClick={() => onGenerateReceipt(d)} className="text-gray-500 hover:text-green-600 p-1 ml-2" title="صدور رسید">
                                                <ReceiptIcon className="w-6 h-6"/>
                                            </button>
                                            <button onClick={() => handleOpenModal(d)} className="text-gray-500 hover:text-blue-600 p-1 ml-2" title="ویرایش">
                                                <EditIcon className="w-5 h-5"/>
                                            </button>
                                            <button onClick={() => handleDelete(d.id)} className="text-gray-500 hover:text-red-600 p-1" title="حذف">
                                                <TrashIcon className="w-5 h-5"/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     ) : (
                        <div className="text-center p-8">
                            <p className="text-gray-500 text-base">هیچ کمک غیرنقدی در سال {selectedYear} ثبت نشده است.</p>
                        </div>
                     )}
                </div>
            </div>
            
            <DonationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                donationToEdit={donationToEdit}
            />
        </div>
    );
};

export default InKindDonations;