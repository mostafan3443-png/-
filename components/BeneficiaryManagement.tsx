import React, { useState, useRef } from 'react';
import moment from 'jalali-moment';
import { Beneficiary } from '../types';
import PlusIcon from './icons/PlusIcon';
import ImportIcon from './icons/ImportIcon';
import ExportIcon from './icons/ExportIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import FamilyDetailModal from './FamilyDetailModal';

const initialBeneficiaries: Beneficiary[] = [
  { 
    id: 'b1', 
    fullName: 'خانواده احمدی', 
    nationalId: '1234567890', 
    householdSize: 4, 
    address: 'تهران، خیابان آزادی', 
    phoneNumber: '09123456789', 
    supportStatus: 'فعال', 
    registrationDate: new Date().toISOString(),
    children: [
        { id: 'c1', name: 'سارا', gender: 'دختر', educationalLevel: 'ابتدایی', isStudent: true },
        { id: 'c2', name: 'علی', gender: 'پسر', educationalLevel: 'پیش دبستانی', isStudent: true },
    ]
  },
  { 
    id: 'b2', 
    fullName: 'خانواده رضایی', 
    nationalId: '0987654321', 
    householdSize: 2, 
    address: 'اصفهان، میدان نقش جهان', 
    phoneNumber: '09139876543', 
    supportStatus: 'در حال بررسی', 
    registrationDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    children: []
  },
];

const BeneficiaryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (beneficiary: Omit<Beneficiary, 'id'> | Beneficiary) => void;
    beneficiaryToEdit: Beneficiary | null;
}> = ({ isOpen, onClose, onSave, beneficiaryToEdit }) => {
    const [formData, setFormData] = useState<Omit<Beneficiary, 'id' | 'registrationDate' | 'children'>>({
        fullName: '', nationalId: '', householdSize: 1, address: '', phoneNumber: '', supportStatus: 'در حال بررسی'
    });
    const [error, setError] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (beneficiaryToEdit) {
            const { children, ...rest } = beneficiaryToEdit;
            setFormData(rest);
        } else {
             setFormData({ fullName: '', nationalId: '', householdSize: 1, address: '', phoneNumber: '', supportStatus: 'در حال بررسی' });
        }
    }, [beneficiaryToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'householdSize' ? parseInt(value) : value }));
    };

    const handleSave = () => {
        if (!formData.fullName || !formData.nationalId || !formData.phoneNumber) {
            setError('نام کامل، کد ملی و شماره تلفن الزامی هستند.');
            return;
        }
        setError('');
        const beneficiaryData = beneficiaryToEdit 
            ? { ...beneficiaryToEdit, ...formData } 
            : { ...formData, registrationDate: new Date().toISOString(), children: [] };
        onSave(beneficiaryData);
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={(e) => { if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose()}}>
            <div ref={modalRef} className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl m-4">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">{beneficiaryToEdit ? 'ویرایش مددجو' : 'افزودن مددجوی جدید'}</h2>
                <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="نام کامل سرپرست" className="w-full p-2 border rounded"/>
                        <input name="nationalId" value={formData.nationalId} onChange={handleChange} placeholder="کد ملی" className="w-full p-2 border rounded font-yekan"/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="شماره تماس" className="w-full p-2 border rounded font-yekan"/>
                        <input name="householdSize" type="number" min="1" value={formData.householdSize} onChange={handleChange} placeholder="تعداد اعضا" className="w-full p-2 border rounded font-yekan"/>
                        <select name="supportStatus" value={formData.supportStatus} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                            <option value="فعال">فعال</option>
                            <option value="غیرفعال">غیرفعال</option>
                            <option value="در حال بررسی">در حال بررسی</option>
                        </select>
                     </div>
                    <textarea name="address" value={formData.address} onChange={handleChange} placeholder="آدرس" rows={2} className="w-full p-2 border rounded"/>
                </div>
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-6 py-2 border rounded-lg">انصراف</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">ذخیره</button>
                </div>
            </div>
        </div>
    );
};


const BeneficiaryManagement: React.FC = () => {
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(initialBeneficiaries);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [beneficiaryToEdit, setBeneficiaryToEdit] = useState<Beneficiary | null>(null);
    const [familyModalBeneficiary, setFamilyModalBeneficiary] = useState<Beneficiary | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOpenEditModal = (beneficiary: Beneficiary | null = null) => {
        setBeneficiaryToEdit(beneficiary);
        setIsEditModalOpen(true);
    };

    const handleSave = (beneficiaryData: Omit<Beneficiary, 'id'> | Beneficiary) => {
        if ('id' in beneficiaryData) {
            setBeneficiaries(beneficiaries.map(b => b.id === beneficiaryData.id ? beneficiaryData : b));
        } else {
            const newBeneficiary: Beneficiary = {
                ...beneficiaryData,
                id: `b${Date.now()}`,
            };
            setBeneficiaries(prev => [...prev, newBeneficiary]);
        }
    };
    
    const handleUpdateBeneficiary = (updatedBeneficiary: Beneficiary) => {
        setBeneficiaries(beneficiaries.map(b => b.id === updatedBeneficiary.id ? updatedBeneficiary : b));
    };

    const handleDelete = (id: string) => {
        if (window.confirm('آیا از حذف این مددجو اطمینان دارید؟')) {
            setBeneficiaries(beneficiaries.filter(b => b.id !== id));
        }
    };

    const handleExport = () => {
        const XLSX = (window as any).XLSX;
        if (!XLSX) {
            alert("XLSX library not found.");
            return;
        }
        const dataToExport = beneficiaries.map(b => ({
            "نام کامل": b.fullName,
            "کد ملی": b.nationalId,
            "تعداد اعضای خانوار": b.householdSize,
            "شماره تماس": b.phoneNumber,
            "آدرس": b.address,
            "وضعیت": b.supportStatus,
            "تاریخ ثبت": moment(b.registrationDate).locale('fa').format('jYY/jMM/DD'),
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "مددجویان");
        XLSX.writeFile(workbook, "لیست_مددجویان.xlsx");
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const XLSX = (window as any).XLSX;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet) as any[];

                const newBeneficiaries = json.map((row, index): Beneficiary | null => {
                     if (!row["نام کامل"] || !row["کد ملی"]) return null;
                     return {
                        id: `import-${Date.now()}-${index}`,
                        fullName: String(row["نام کامل"]),
                        nationalId: String(row["کد ملی"]),
                        householdSize: Number(row["تعداد اعضای خانوار"] || 1),
                        phoneNumber: String(row["شماره تماس"] || ''),
                        address: String(row["آدرس"] || ''),
                        supportStatus: (row["وضعیت"] === 'فعال' || row["وضعیت"] === 'غیرفعال') ? row["وضعیت"] : 'در حال بررسی',
                        registrationDate: new Date().toISOString(),
                        children: [],
                     }
                }).filter((b): b is Beneficiary => b !== null);
                
                const existingIds = new Set(beneficiaries.map(b => b.nationalId));
                const uniqueNewBeneficiaries = newBeneficiaries.filter(nb => !existingIds.has(nb.nationalId));

                setBeneficiaries(prev => [...prev, ...uniqueNewBeneficiaries]);
                alert(`${uniqueNewBeneficiaries.length} مددجوی جدید با موفقیت اضافه شد.`);

            } catch (error) {
                console.error("Error importing file:", error);
                alert("خطا در پردازش فایل اکسل. لطفاً از فرمت صحیح فایل اطمینان حاصل کنید.");
            } finally {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md flex items-center">
                    <div className="bg-sky-100 p-3 rounded-full mr-4">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div>
                        <p className="text-base text-gray-600">تعداد کل مددجویان</p>
                        <p className="text-3xl font-bold text-gray-800 font-yekan">{beneficiaries.length}</p>
                    </div>
                </div>
                <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-md flex items-center justify-end gap-4">
                    <button onClick={() => handleOpenEditModal()} className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow">
                        <PlusIcon className="h-5 w-5 ml-2" /> افزودن مددجو
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow">
                        <ImportIcon className="h-5 w-5 ml-2" /> وارد کردن از اکسل
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".xlsx, .xls" />
                    <button onClick={handleExport} className="flex items-center bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow">
                        <ExportIcon className="h-5 w-5 ml-2" /> خروجی اکسل
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b"><h2 className="text-xl font-bold text-gray-800">لیست مددجویان</h2></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-600">نام کامل</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">شماره تماس</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">کد ملی</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">تاریخ ثبت</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">وضعیت</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {beneficiaries.map(b => (
                                <tr key={b.id} className="hover:bg-gray-100 cursor-pointer" onClick={() => setFamilyModalBeneficiary(b)}>
                                    <td className="p-4 font-semibold">{b.fullName}</td>
                                    <td className="p-4 font-yekan text-gray-600">{b.phoneNumber}</td>
                                    <td className="p-4 font-yekan">{b.nationalId}</td>
                                    <td className="p-4 font-yekan">{moment(b.registrationDate).locale('fa').format('jYY/jMM/DD')}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                            b.supportStatus === 'فعال' ? 'bg-green-100 text-green-800' :
                                            b.supportStatus === 'غیرفعال' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>{b.supportStatus}</span>
                                    </td>
                                    <td className="p-4 text-left" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => handleOpenEditModal(b)} className="text-gray-500 hover:text-blue-600 p-1 ml-2"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDelete(b.id)} className="text-gray-500 hover:text-red-600 p-1"><TrashIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <BeneficiaryModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSave}
                beneficiaryToEdit={beneficiaryToEdit}
            />

            <FamilyDetailModal
                isOpen={!!familyModalBeneficiary}
                onClose={() => setFamilyModalBeneficiary(null)}
                beneficiary={familyModalBeneficiary}
                onUpdateBeneficiary={handleUpdateBeneficiary}
            />
        </div>
    );
};

export default BeneficiaryManagement;