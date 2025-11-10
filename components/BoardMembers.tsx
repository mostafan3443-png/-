import React, { useState, useRef, useEffect } from 'react';
import { BoardMember } from '../types';
import PlusIcon from './icons/PlusIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import UserCircleIcon from './icons/UserCircleIcon';

const initialBoardMembers: BoardMember[] = [
    { id: 'bm1', fullName: 'محمد کریمی', role: 'مدیرعامل' },
    { id: 'bm2', fullName: 'زهرا حسینی', role: 'رئیس هیئت مدیره' },
    { id: 'bm3', fullName: 'علی رضایی', role: 'خزانه‌دار' },
    { id: 'bm4', fullName: 'فاطمه احمدی', role: 'عضو هیئت مدیره' },
];

const ROLES: BoardMember['role'][] = ['مدیرعامل', 'رئیس هیئت مدیره', 'نائب رئیس', 'خزانه‌دار', 'عضو هیئت مدیره', 'بازرس'];

const MemberModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (member: Omit<BoardMember, 'id'> | BoardMember) => void;
    memberToEdit: BoardMember | null;
}> = ({ isOpen, onClose, onSave, memberToEdit }) => {
    const [formData, setFormData] = useState<{ fullName: string; role: BoardMember['role'] }>({ fullName: '', role: ROLES[0] });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        if (isOpen) {
            if (memberToEdit) {
                setFormData({ fullName: memberToEdit.fullName, role: memberToEdit.role });
                setImagePreview(memberToEdit.imageUrl || null);
            } else {
                setFormData({ fullName: '', role: ROLES[0] });
                setImagePreview(null);
            }
        }
    }, [isOpen, memberToEdit]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
             // Revoke previous blob URL if it exists
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(previewUrl);
        }
    };

    const handleSave = () => {
        if (!formData.fullName.trim()) {
            alert('نام کامل عضو الزامی است.');
            return;
        }
        const memberDataWithImage = {
            ...formData,
            imageUrl: imagePreview || undefined
        };

        onSave(memberToEdit ? { ...memberDataWithImage, id: memberToEdit.id } : memberDataWithImage);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={(e) => { if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose()}}>
            <div ref={modalRef} className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg m-4">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">{memberToEdit ? 'ویرایش عضو' : 'افزودن عضو جدید'}</h2>
                <div className="space-y-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">عکس پروفایل (اختیاری)</label>
                        <div className="mt-2 flex items-center gap-4">
                            <span className="inline-block h-20 w-20 overflow-hidden rounded-full bg-gray-100 ring-2 ring-white ring-offset-2">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <UserCircleIcon className="h-full w-full text-gray-300" />
                                )}
                            </span>
                            <input
                                type="file"
                                id="image-upload"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="cursor-pointer rounded-md border border-gray-300 bg-white py-1.5 px-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
                            >
                                انتخاب عکس
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">نام کامل</label>
                        <input
                            id="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">سمت</label>
                        <select
                            id="role"
                            value={formData.role}
                            onChange={(e) => setFormData(p => ({ ...p, role: e.target.value as BoardMember['role'] }))}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white"
                        >
                            {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-100">انصراف</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">ذخیره</button>
                </div>
            </div>
        </div>
    );
};

const BoardMembers: React.FC = () => {
    const [members, setMembers] = useState<BoardMember[]>(initialBoardMembers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [memberToEdit, setMemberToEdit] = useState<BoardMember | null>(null);

    const handleOpenModal = (member: BoardMember | null = null) => {
        setMemberToEdit(member);
        setIsModalOpen(true);
    };

    const handleSaveMember = (memberData: Omit<BoardMember, 'id'> | BoardMember) => {
        if ('id' in memberData) {
             const oldMember = members.find(m => m.id === memberData.id);
            if (oldMember && oldMember.imageUrl && oldMember.imageUrl.startsWith('blob:') && oldMember.imageUrl !== memberData.imageUrl) {
                URL.revokeObjectURL(oldMember.imageUrl);
            }
            setMembers(members.map(m => m.id === memberData.id ? memberData : m));
        } else {
            const newMember: BoardMember = {
                ...memberData,
                id: `bm${Date.now()}`,
            };
            setMembers(prev => [...prev, newMember]);
        }
    };

    const handleDeleteMember = (id: string) => {
        if (window.confirm('آیا از حذف این عضو اطمینان دارید؟')) {
             const memberToDelete = members.find(m => m.id === id);
            if (memberToDelete && memberToDelete.imageUrl && memberToDelete.imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(memberToDelete.imageUrl);
            }
            setMembers(members.filter(m => m.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">لیست اعضای هیئت مدیره</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow"
                >
                    <PlusIcon className="h-5 w-5 ml-2" />
                    <span>افزودن عضو جدید</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map(member => (
                    <div key={member.id} className="bg-white p-5 rounded-lg shadow-md flex flex-col justify-between transition-shadow hover:shadow-lg">
                        <div className="flex items-center mb-4">
                             {member.imageUrl ? (
                                <img src={member.imageUrl} alt={member.fullName} className="w-16 h-16 rounded-full object-cover ml-4 flex-shrink-0" />
                            ) : (
                                <UserCircleIcon className="w-16 h-16 text-gray-300 ml-4 flex-shrink-0" />
                            )}
                            <div className="flex-grow">
                                <h3 className="text-lg font-bold text-gray-800">{member.fullName}</h3>
                                <p className="text-base text-sky-600 font-semibold">{member.role}</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 border-t pt-3 mt-3">
                            <button
                                onClick={() => handleOpenModal(member)}
                                className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
                                aria-label={`ویرایش ${member.fullName}`}
                            >
                                <EditIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleDeleteMember(member.id)}
                                className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"
                                aria-label={`حذف ${member.fullName}`}
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <MemberModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveMember}
                memberToEdit={memberToEdit}
            />
        </div>
    );
};

export default BoardMembers;