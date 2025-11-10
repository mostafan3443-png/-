import React, { useState } from 'react';
import FileUploadIcon from './icons/FileUploadIcon';
import PdfIcon from './icons/PdfIcon';
import TrashIcon from './icons/TrashIcon';
import EyeIcon from './icons/EyeIcon';

type DocCategory = 'receipts' | 'bank' | 'invoices' | 'distribution';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  previewUrl?: string; // For images
  uploadDate: Date;
}

const categories: { key: DocCategory; title: string }[] = [
  { key: 'receipts', title: 'رسیدهای کمک' },
  { key: 'bank', title: 'اسناد بانکی' },
  { key: 'invoices', title: 'فاکتورهای هزینه' },
  { key: 'distribution', title: 'مستندات توزیع' },
];

const DocumentUpload: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DocCategory>('receipts');
  const [files, setFiles] = useState<Record<DocCategory, UploadedFile[]>>({
    receipts: [],
    bank: [],
    invoices: [],
    distribution: [],
  });
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = Array.from(selectedFiles).map(file => {
      const newFile: UploadedFile = {
        id: `${file.name}-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadDate: new Date(),
      };
      if (file.type.startsWith('image/')) {
        newFile.previewUrl = newFile.url;
      }
      return newFile;
    });

    setFiles(prevFiles => ({
      ...prevFiles,
      [activeTab]: [...prevFiles[activeTab], ...newFiles],
    }));
  };

  const handleDelete = (fileId: string) => {
    // Revoke the object URL to prevent memory leaks
    const fileToDelete = files[activeTab].find(f => f.id === fileId);
    if (fileToDelete) {
        URL.revokeObjectURL(fileToDelete.url);
    }

    setFiles(prevFiles => ({
      ...prevFiles,
      [activeTab]: prevFiles[activeTab].filter(f => f.id !== fileId),
    }));
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, dragState: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragState);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 space-x-reverse" aria-label="Tabs">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveTab(cat.key)}
              className={`${
                activeTab === cat.key
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}
            >
              {cat.title}
            </button>
          ))}
        </nav>
      </div>

      {/* File Upload Zone */}
      <div
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging ? 'border-sky-500 bg-sky-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <FileUploadIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 block text-base font-medium text-gray-900">
          فایل‌ها را بکشید و اینجا رها کنید
        </p>
        <p className="text-sm text-gray-500">یا</p>
        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-sky-600 hover:text-sky-500">
          <span>فایل‌های خود را انتخاب کنید</span>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            multiple
            className="sr-only"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </label>
      </div>

      {/* Uploaded Files Grid */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          فایل‌های بایگانی شده در «{categories.find(c => c.key === activeTab)?.title}»
        </h3>
        {files[activeTab].length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files[activeTab].map(file => (
              <div key={file.id} className="group relative border rounded-lg overflow-hidden shadow-sm">
                <div className="aspect-w-10 aspect-h-7 block w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {file.previewUrl ? (
                    <img src={file.previewUrl} alt={file.name} className="object-cover pointer-events-none h-full w-full" />
                  ) : (
                    <PdfIcon className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center gap-4">
                     <a href={file.url} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 p-2 bg-white/80 rounded-full text-gray-700 hover:bg-white transition-transform transform scale-90 group-hover:scale-100" title="مشاهده فایل">
                        <EyeIcon className="h-6 w-6" />
                    </a>
                    <button onClick={() => handleDelete(file.id)} className="opacity-0 group-hover:opacity-100 p-2 bg-white/80 rounded-full text-red-600 hover:bg-white transition-transform transform scale-90 group-hover:scale-100" title="حذف فایل">
                        <TrashIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-3 bg-white">
                  <p className="pointer-events-none block truncate text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="pointer-events-none block text-xs text-gray-500">{formatFileSize(file.size)} - {file.uploadDate.toLocaleDateString('fa-IR')}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500">هنوز هیچ سندی در این بخش بایگانی نشده است.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;
