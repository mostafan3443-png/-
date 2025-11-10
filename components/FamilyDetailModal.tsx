import React, { useState, useEffect, useRef } from 'react';
import { Beneficiary, Child } from '../types';
import PlusIcon from './icons/PlusIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import UserGroupIcon from './icons/UserGroupIcon';

const EDUCATIONAL_LEVELS: Child['educationalLevel'][] = [
    'پیش دبستانی', 'ابتدایی', 'متوسطه اول', 'متوسطه دوم', 'دانشجو', 'فارغ التحصیل', 'ترک تحصیل'
];

// Nested Modal for adding/editing a child
const ChildModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (child: Omit<Child, 'id'> | Child) => void;
    childToEdit: Child | null;
}> = ({ isOpen, onClose, onSave, childToEdit }) => {
    const [formData, setFormData] = useState<Omit<Child, 'id'>>({
        name: '', gender: 'پسر', educationalLevel: 'ابتدایی', isStudent: true
    });
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (childToEdit) {
                setFormData(childToEdit);
            } else {
                setFormData({ name: '', gender: 'پسر', educationalLevel: 'ابتدایی', isStudent: true });
            }
        }
    }, [isOpen, childToEdit]);

    const handleSave = () => {
        if (!formData.name.trim()) {
            alert('نام فرزند الزامی است.');
            return;
        }
        onSave(childToEdit ? { ...formData, id: childToEdit.id } : formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-[60]" onClick={(e) => { if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose()}}>
            <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md m-4">
                <h3 className="text-xl font-bold mb-4">{childToEdit ? 'ویرایش فرزند' : 'افزودن فرزند'}</h3>
                <div className="space-y-4">
                    <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="نام فرزند" className="w-full p-2 border rounded" />
                    <select value={formData.gender} onChange={e => setFormData(p => ({ ...p, gender: e.target.value as Child['gender'] }))} className="w-full p-2 border rounded bg-white">
                        <option value="پسر">پسر</option>
                        <option value="دختر">دختر</option>
                    </select>
                    <select value={formData.educationalLevel} onChange={e => setFormData(p => ({ ...p, educationalLevel: e.target.value as Child['educationalLevel'] }))} className="w-full p-2 border rounded bg-white">
                        {EDUCATIONAL_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                    <div className="flex items-center">
                        <input type="checkbox" id="isStudent" checked={formData.isStudent} onChange={e => setFormData(p => ({ ...p, isStudent: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                        <label htmlFor="isStudent" className="mr-2 block text-sm text-gray-900">محصل است</label>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 border rounded-lg">انصراف</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">ذخیره</button>
                </div>
            </div>
        </div>
    );
};

// Main Modal
interface FamilyDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    beneficiary: Beneficiary | null;
    onUpdateBeneficiary: (beneficiary: Beneficiary) => void;
}

const FamilyDetailModal: React.FC<FamilyDetailModalProps> = ({ isOpen, onClose, beneficiary, onUpdateBeneficiary }) => {
    const [children, setChildren] = useState<Child[]>([]);
    const [isChildModalOpen, setIsChildModalOpen] = useState(false);
    const [childToEdit, setChildToEdit] = useState<Child | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (beneficiary) {
            setChildren(beneficiary.children || []);
        }
    }, [beneficiary]);

    const handleOpenChildModal = (child: Child | null = null) => {
        setChildToEdit(child);
        setIsChildModalOpen(true);
    };

    const handleSaveChild = (childData: Omit<Child, 'id'> | Child) => {
        if ('id' in childData) {
            setChildren(children.map(c => c.id === childData.id ? childData : c));
        } else {
            setChildren(prev => [...prev, { ...childData, id: `c${Date.now()}` }]);
        }
    };

    const handleDeleteChild = (id: string) => {
        if (window.confirm('آیا از حذف این فرزند اطمینان دارید؟')) {
            setChildren(children.filter(c => c.id !== id));
        }
    };

    const handleSaveChanges = () => {
        if (beneficiary) {
            onUpdateBeneficiary({ ...beneficiary, children, householdSize: 1 + children.length }); // Auto-update household size
        }
        onClose();
    };
    
    if (!isOpen || !beneficiary) return null;
    
    const studentCount = children.filter(c => c.isStudent).length;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={(e) => { if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose()}}>
            <div ref={modalRef} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl m-4 transform transition-all">
                <div className="flex justify-between items-start mb-4 pb-4 border-b">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">مدیریت خانواده: {beneficiary.fullName}</h2>
                        <div className="flex items-center text-gray-600 mt-2">
                             <UserGroupIcon className="w-5 h-5 ml-2 text-gray-500" />
                             <span>{children.length} فرزند ثبت شده ({studentCount} نفر محصل)</span>
                        </div>
                    </div>
                    <button onClick={() => handleOpenChildModal()} className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                        <PlusIcon className="h-5 w-5 ml-2" /> افزودن فرزند
                    </button>
                </div>
                
                <div className="max-h-[50vh] overflow-y-auto">
                    {children.length > 0 ? (
                        <table className="w-full text-right">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="p-3 text-sm font-semibold text-gray-600">نام فرزند</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600">جنسیت</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600">مقطع تحصیلی</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600">وضعیت تحصیل</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {children.map(child => (
                                    <tr key={child.id}>
                                        <td className="p-3 font-medium">{child.name}</td>
                                        <td className="p-3">{child.gender}</td>
                                        <td className="p-3">{child.educationalLevel}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${child.isStudent ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                                                {child.isStudent ? 'محصل' : 'غیرمحصل'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-left">
                                            <button onClick={() => handleOpenChildModal(child)} className="p-1 text-gray-500 hover:text-blue-600"><EditIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleDeleteChild(child.id)} className="p-1 text-gray-500 hover:text-red-600 mr-1"><TrashIcon className="w-5 h-5"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            <p>هنوز فرزندی برای این خانواده ثبت نشده است.</p>
                        </div>
                    )}
                </div>
                
                <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
                    <button onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-100">انصراف</button>
                    <button onClick={handleSaveChanges} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">ذخیره تغییرات</button>
                </div>
            </div>
            
             <ChildModal 
                isOpen={isChildModalOpen}
                onClose={() => setIsChildModalOpen(false)}
                onSave={handleSaveChild}
                childToEdit={childToEdit}
             />
        </div>
    );
};

export default FamilyDetailModal;