import React, { useState, useRef, useEffect } from 'react';
import moment from 'jalali-moment';
import CharityIcon from './icons/CharityIcon';
import { ReceiptData } from '../App';

interface DonationReceiptsProps {
    receiptData: ReceiptData | null;
    onDataPreloaded: () => void;
}

const DonationReceipts: React.FC<DonationReceiptsProps> = ({ receiptData, onDataPreloaded }) => {
    const [donorName, setDonorName] = useState('');
    const [amountNumeric, setAmountNumeric] = useState('');
    const [amountText, setAmountText] = useState('');
    const [purpose, setPurpose] = useState('');
    const [date, setDate] = useState(moment().locale('fa').format('jYYYY/jMM/jDD'));
    const [donationType, setDonationType] = useState<'cash' | 'in-kind'>('cash');
    const [inKindDescription, setInKindDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [receiptNumber, setReceiptNumber] = useState('');
    const receiptRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Generate a new, unique receipt number and set it.
        // This number is archived in localStorage to be sequential.
        const yearPrefix = moment().jYear();
        const key = `lastReceiptNumber_${yearPrefix}`;
        const lastNum = parseInt(localStorage.getItem(key) || `${yearPrefix}0000`, 10);
        const newNum = lastNum + 1;
        localStorage.setItem(key, newNum.toString());
        setReceiptNumber(newNum.toString());

        if (receiptData) {
            if (receiptData.type === 'in-kind') {
                setDonationType('in-kind');
                setDonorName(receiptData.donorName);
                setInKindDescription(receiptData.description);
                setDate(moment(receiptData.date).locale('fa').format('jYYYY/jMM/jDD'));
                setPurpose('کمک غیرنقدی'); // Default purpose
                // Clear out cash fields
                setAmountNumeric('');
                setAmountText('');
            }
            // Once data is used, clear it from the parent state
            onDataPreloaded();
        }
    }, [receiptData]);

    const handleDownload = async (format: 'png' | 'pdf') => {
        const receiptElement = receiptRef.current;
        const html2canvas = (window as any).html2canvas;
        const jspdf = (window as any).jspdf;

        if (!receiptElement || !html2canvas) {
            alert('امکان ایجاد فایل رسید وجود ندارد. کتابخانه مورد نیاز بارگذاری نشده است.');
            return;
        }

        setIsGenerating(true);
        try {
            const canvas = await html2canvas(receiptElement, {
                scale: 2.5,
                useCORS: true,
                backgroundColor: '#ffffff',
            });
            const imgData = canvas.toDataURL('image/png', 1.0);

            if (format === 'png') {
                const link = document.createElement('a');
                link.download = `receipt-${receiptNumber}.png`;
                link.href = imgData;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else if (format === 'pdf' && jspdf) {
                const { jsPDF } = jspdf;
                const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const widthRatio = pageWidth / canvas.width;
                const heightRatio = pageHeight / canvas.height;
                const ratio = Math.min(widthRatio, heightRatio) * 0.95; // 95% of available space
                const canvasWidth = canvas.width * ratio;
                const canvasHeight = canvas.height * ratio;
                const marginX = (pageWidth - canvasWidth) / 2;
                const marginY = (pageHeight - canvasHeight) / 2;
                pdf.addImage(imgData, 'PNG', marginX, marginY, canvasWidth, canvasHeight);
                pdf.save(`receipt-${receiptNumber}.pdf`);
            }
        } catch (error) {
            console.error('Error generating receipt file:', error);
            alert('خطا در ایجاد فایل رسید. لطفاً دوباره تلاش کنید.');
        } finally {
            setIsGenerating(false);
        }
    };

    const formatCurrency = (amount: string) => {
        if (!amount) return '۰';
        return new Intl.NumberFormat('fa-IR').format(Number(amount));
    };

    const handleDonationTypeChange = (type: 'cash' | 'in-kind') => {
        setDonationType(type);
        setAmountNumeric('');
        setAmountText('');
        setInKindDescription('');
    };

    const renderReceiptBody = () => {
        if (donationType === 'cash') {
            return (
                <p className="text-gray-800">
                    بدینوسیله گواهی می‌شود مبلغ
                    <strong className="font-yekan mx-2 text-lg">{formatCurrency(amountNumeric) || '[مبلغ به عدد]'}</strong>
                    ریال
                    (<strong className="mx-2">{amountText || '[مبلغ به حروف]'}</strong>)
                    از
                    <strong className="mx-2">{donorName || '[نام کمک کننده]'}</strong>
                    محترم بابت
                    <strong className="mx-2">{purpose || '[علت کمک]'}</strong>
                    دریافت گردید.
                </p>
            );
        } else {
            return (
                 <p className="text-gray-800">
                    بدینوسیله گواهی می‌شود کمک غیرنقدی شامل
                    <strong className="mx-2 text-lg">{inKindDescription || '[شرح اقلام]'}</strong>
                    از
                    <strong className="mx-2">{donorName || '[نام کمک کننده]'}</strong>
                    محترم بابت
                    <strong className="mx-2">{purpose || '[علت کمک]'}</strong>
                    دریافت گردید.
                </p>
            )
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">ایجاد رسید کمک</h2>
                    <div className="space-y-4">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">نوع کمک</label>
                             <div className="flex gap-4">
                                <button onClick={() => handleDonationTypeChange('cash')} className={`w-full py-2 text-sm rounded-md border transition-colors ${donationType === 'cash' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                                    نقدی
                                </button>
                                 <button onClick={() => handleDonationTypeChange('in-kind')} className={`w-full py-2 text-sm rounded-md border transition-colors ${donationType === 'in-kind' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                                    غیرنقدی
                                </button>
                             </div>
                        </div>

                        <div>
                            <label htmlFor="donorName" className="block text-sm font-medium text-gray-700 mb-1">نام کمک کننده</label>
                            <input
                                type="text"
                                id="donorName"
                                value={donorName}
                                onChange={(e) => setDonorName(e.target.value)}
                                placeholder="جناب آقای / سرکار خانم ..."
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-base"
                            />
                        </div>

                        {donationType === 'cash' ? (
                            <>
                                <div>
                                    <label htmlFor="amountNumeric" className="block text-sm font-medium text-gray-700 mb-1">مبلغ به عدد (ریال)</label>
                                    <input
                                        type="number"
                                        id="amountNumeric"
                                        value={amountNumeric}
                                        onChange={(e) => setAmountNumeric(e.target.value)}
                                        placeholder="مثال: 500000"
                                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-base font-yekan"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="amountText" className="block text-sm font-medium text-gray-700 mb-1">مبلغ به حروف</label>
                                    <input
                                        type="text"
                                        id="amountText"
                                        value={amountText}
                                        onChange={(e) => setAmountText(e.target.value)}
                                        placeholder="مثال: پانصد هزار ریال"
                                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-base"
                                    />
                                </div>
                            </>
                        ) : (
                             <div>
                                <label htmlFor="inKindDescription" className="block text-sm font-medium text-gray-700 mb-1">شرح کمک غیرنقدی</label>
                                <textarea
                                    id="inKindDescription"
                                    value={inKindDescription}
                                    onChange={(e) => setInKindDescription(e.target.value)}
                                    placeholder="مثال: ۱۰ بسته مواد غذایی، لوازم التحریر و ..."
                                    rows={3}
                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-base"
                                />
                            </div>
                        )}
                        
                        <div>
                            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">بابت</label>
                            <input
                                type="text"
                                id="purpose"
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                placeholder="مثال: کمک به نیازمندان"
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-base"
                            />
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">تاریخ</label>
                            <input
                                type="text"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                placeholder="YYYY/MM/DD"
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-base font-yekan"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <button onClick={() => handleDownload('png')} disabled={isGenerating} className="w-full flex justify-center items-center bg-sky-600 text-white px-4 py-3 rounded-lg hover:bg-sky-700 transition-colors shadow text-base font-semibold disabled:bg-sky-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {isGenerating ? 'در حال آماده سازی...' : 'دانلود عکس (PNG)'}
                            </button>
                            <button onClick={() => handleDownload('pdf')} disabled={isGenerating} className="w-full flex justify-center items-center bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors shadow text-base font-semibold disabled:bg-emerald-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                {isGenerating ? 'در حال آماده سازی...' : 'دانلود PDF'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Receipt Preview */}
                <div className="lg:col-span-2">
                    <div id="printable-receipt" ref={receiptRef} className="bg-white p-8 rounded-lg shadow-xl border-2 border-dashed border-gray-300">
                        <div className="flex justify-between items-center pb-6 border-b-2 border-gray-200">
                            <div className="flex items-center">
                                <CharityIcon className="h-16 w-16 text-sky-600" />
                                <div className="mr-4">
                                    <h1 className="text-2xl font-titr font-bold text-sky-800">خیریه کارکنان شرکت</h1>
                                    <p className="text-sm text-gray-500">رسید کمک‌های نقدی و غیرنقدی</p>
                                </div>
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-700">تاریخ: <span className="font-yekan">{date || '[تاریخ]'}</span></p>
                                <p className="font-semibold text-gray-700 mt-1">شماره رسید: <span className="font-yekan">{receiptNumber || '...'}</span></p>
                            </div>
                        </div>

                        <div className="mt-8 leading-loose" style={{fontFamily: 'Nazanin, sans-serif', fontSize: '1.2rem'}}>
                             <div className="text-center mb-8">
                                <p className="font-semibold text-gray-700">
                                    امام علی <span className="text-sm">(علیه السلام)</span>
                                </p>
                                <p className="text-lg text-gray-600 italic mt-2 px-4">
                                    "هر کس در کار خیر پیشی بگیرد، خداوند او را در دنیا و آخرت یاری خواهد کرد."
                                </p>
                                <div className="w-24 h-px bg-gray-300 mx-auto mt-3"></div>
                            </div>
                            {renderReceiptBody()}
                            <p className="mt-6 text-gray-800">
                                خداوند به شما جزای خیر عطا فرماید.
                            </p>
                        </div>

                        <div className="mt-24 flex justify-end">
                             <div className="text-center">
                                <div className="border-t-2 border-dotted border-gray-400 w-48 pt-2">
                                    <p className="text-sm font-semibold text-gray-700">مهر خیریه</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DonationReceipts;