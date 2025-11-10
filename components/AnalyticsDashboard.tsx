// Fix: Replaced invalid file content with a functional AnalyticsDashboard component.
import React, { useState, useEffect, useRef, useMemo } from 'react';
import moment from 'jalali-moment';
import { Transaction, TransactionFlow, IncomeCategory, ExpenseCategory } from '../types';
import { PERSIAN_TO_INCOME_CATEGORY, PERSIAN_TO_EXPENSE_CATEGORY } from '../constants';
import { GoogleGenAI } from '@google/genai';
import SparklesIcon from './icons/SparklesIcon';

// Mappings for category names
const INCOME_CATEGORY_TO_PERSIAN: Record<IncomeCategory, string> = Object.fromEntries(Object.entries(PERSIAN_TO_INCOME_CATEGORY).map(([k, v]) => [v, k])) as Record<IncomeCategory, string>;
const EXPENSE_CATEGORY_TO_PERSIAN: Record<ExpenseCategory, string> = Object.fromEntries(Object.entries(PERSIAN_TO_EXPENSE_CATEGORY).map(([k, v]) => [v, k])) as Record<ExpenseCategory, string>;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface AnalyticsDashboardProps {
  transactions: Transaction[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ transactions }) => {
    const defaultStart = moment().startOf('jYear');
    const defaultEnd = moment();
  
    const [startJalali, setStartJalali] = useState({
        year: defaultStart.jYear().toString(),
        month: (defaultStart.jMonth() + 1).toString(),
        day: defaultStart.jDate().toString(),
    });
    const [endJalali, setEndJalali] = useState({
        year: defaultEnd.jYear().toString(),
        month: (defaultEnd.jMonth() + 1).toString(),
        day: defaultEnd.jDate().toString(),
    });
    
    const [startDate, setStartDate] = useState(defaultStart.format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(defaultEnd.format('YYYY-MM-DD'));
    const [dateError, setDateError] = useState('');

    const [openingBalance, setOpeningBalance] = useState<number>(0);
    const [manualTotalIncome, setManualTotalIncome] = useState<number | null>(null);
    const [manualTotalExpense, setManualTotalExpense] = useState<number | null>(null);

    const [analysis, setAnalysis] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);

    const incomeChartRef = useRef<HTMLCanvasElement>(null);
    const expenseChartRef = useRef<HTMLCanvasElement>(null);
    const yearlyChartRef = useRef<HTMLCanvasElement>(null);
    const boardChartRef = useRef<HTMLCanvasElement>(null);
    const expenseBreakdownChartRef = useRef<HTMLCanvasElement>(null);

    const chartInstances = useRef<any>({});

    useEffect(() => {
        const startY = parseInt(startJalali.year);
        const startM = parseInt(startJalali.month);
        const startD = parseInt(startJalali.day);
        const endY = parseInt(endJalali.year);
        const endM = parseInt(endJalali.month);
        const endD = parseInt(endJalali.day);

        let error = '';
        const startMoment = moment(`${startY}/${startM}/${startD}`, 'jYYYY/jMM/jDD');
        if (!startMoment.isValid() || startY < 1300) {
            error = 'تاریخ شروع نامعتبر است.';
        } else {
            setStartDate(startMoment.format('YYYY-MM-DD'));
        }

        const endMoment = moment(`${endY}/${endM}/${endD}`, 'jYYYY/jMM/jDD');
        if (!endMoment.isValid() || endY < 1300) {
            error = error ? 'هر دو تاریخ نامعتبر هستند.' : 'تاریخ پایان نامعتبر است.';
        } else {
            setEndDate(endMoment.format('YYYY-MM-DD'));
        }
        
        if (!error && startMoment.isAfter(endMoment)) {
            error = 'تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.';
        }

        setDateError(error);
    }, [startJalali, endJalali]);

    const { filteredTransactions, calculatedTotalIncome, calculatedTotalExpense } = useMemo(() => {
        if (dateError) {
            return { filteredTransactions: [], calculatedTotalIncome: 0, calculatedTotalExpense: 0 };
        }
        const filtered = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            start.setHours(0, 0, 0, 0);
            return transactionDate >= start && transactionDate <= end;
        });

        const income = filtered.filter(t => t.flow === TransactionFlow.INCOME).reduce((sum, t) => sum + t.amount, 0);
        const expense = filtered.filter(t => t.flow === TransactionFlow.EXPENSE).reduce((sum, t) => sum + t.amount, 0);

        return { filteredTransactions: filtered, calculatedTotalIncome: income, calculatedTotalExpense: expense };
    }, [transactions, startDate, endDate, dateError]);

    useEffect(() => {
        // When filtered transactions change, reset manual overrides
        setManualTotalIncome(null);
        setManualTotalExpense(null);
    }, [filteredTransactions]);
    
    const totalIncome = manualTotalIncome ?? calculatedTotalIncome;
    const totalExpense = manualTotalExpense ?? calculatedTotalExpense;
    const closingBalance = openingBalance + totalIncome - totalExpense;

    const formatDate = (dateString: string) => moment(dateString).locale('fa').format('dddd، jD jMMMM jYYYY');
    
    const handleGenerateAnalysis = async () => {
        setIsGenerating(true);
        setAnalysis('');
        try {
            const prompt = `
                شما یک تحلیلگر مالی حرفه‌ای هستید. لطفاً یک تحلیل مدیریتی برای هیئت مدیره یک خیریه بر اساس داده‌های زیر به زبان فارسی تهیه کنید.
                این تحلیل باید شامل نکات کلیدی، بزرگترین منابع درآمد، بیشترین حوزه‌های هزینه، و یک ارزیابی کلی از وضعیت مالی باشد.

                اطلاعات مالی دوره:
                - تاریخ شروع گزارش: ${formatDate(startDate)}
                - تاریخ پایان گزارش: ${formatDate(endDate)}
                - مانده حساب در ابتدای دوره: ${openingBalance.toLocaleString('fa-IR')} ریال
                - مجموع درآمد در دوره: ${totalIncome.toLocaleString('fa-IR')} ریال
                - مجموع هزینه در دوره: ${totalExpense.toLocaleString('fa-IR')} ریال
                - مانده حساب در انتهای دوره: ${closingBalance.toLocaleString('fa-IR')} ریال

                خلاصه تراکنش‌ها (فقط چند نمونه برای درک بهتر):
                ${filteredTransactions.slice(0, 10).map(t =>
                `- ${t.flow === TransactionFlow.INCOME ? 'درآمد' : 'هزینه'}: ${t.description} به مبلغ ${t.amount.toLocaleString('fa-IR')} ریال در تاریخ ${formatDate(t.date)}`
                ).join('\n')}

                لطفاً تحلیل خود را در چند پاراگراف روان و قابل فهم برای مدیران ارائه دهید.
            `;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt
            });
            setAnalysis(response.text);

        } catch (error) {
            console.error("Error generating analysis:", error);
            setAnalysis("متاسفانه در تولید تحلیل مشکلی پیش آمد. لطفا دوباره تلاش کنید.");
        } finally {
            setIsGenerating(false);
        }
    };
  
    const formatCurrency = (amount: number) => new Intl.NumberFormat('fa-IR').format(amount);
    const getCategoryName = (category: IncomeCategory | ExpenseCategory, flow: TransactionFlow) => flow === TransactionFlow.INCOME
        ? INCOME_CATEGORY_TO_PERSIAN[category as IncomeCategory] || category
        : EXPENSE_CATEGORY_TO_PERSIAN[category as ExpenseCategory] || category;


    useEffect(() => {
        // Destroy all previous chart instances
        Object.values(chartInstances.current).forEach((chart: any) => chart?.destroy());
        chartInstances.current = {};

        const chartFont = { family: "'B Yekan', 'Iran Sans'", size: 14 };
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom' as const,
                    labels: { font: chartFont, padding: 20 }
                },
            }
        };

        // Doughnut Charts
        const incomeData = filteredTransactions.filter(t => t.flow === TransactionFlow.INCOME).reduce((acc, t) => ({...acc, [t.category]: (acc[t.category] || 0) + t.amount }), {} as Record<string, number>);
        if (incomeChartRef.current && Object.keys(incomeData).length > 0) {
            chartInstances.current.income = new (window as any).Chart(incomeChartRef.current, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(incomeData).map(cat => getCategoryName(cat as any, TransactionFlow.INCOME)),
                    datasets: [{ label: 'درآمد', data: Object.values(incomeData), backgroundColor: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'], borderColor: '#ffffff', borderWidth: 2 }]
                },
                options: commonOptions
            });
        }
        
        const expenseData = filteredTransactions.filter(t => t.flow === TransactionFlow.EXPENSE).reduce((acc, t) => ({...acc, [t.category]: (acc[t.category] || 0) + t.amount }), {} as Record<string, number>);
        if (expenseChartRef.current && Object.keys(expenseData).length > 0) {
            chartInstances.current.expense = new (window as any).Chart(expenseChartRef.current, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(expenseData).map(cat => getCategoryName(cat as any, TransactionFlow.EXPENSE)),
                    datasets: [{ label: 'هزینه', data: Object.values(expenseData), backgroundColor: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA'], borderColor: '#ffffff', borderWidth: 2 }]
                },
                options: commonOptions
            });
        }

        // Monthly Charts
        const monthlyData: { [key: string]: { income: number, expense: number } } = {};
        const monthLabels: string[] = [];
        
        if (!dateError) {
          const start = moment(startDate);
          const end = moment(endDate);
          for (let m = start.clone(); m.isBefore(end); m.add(1, 'month')) {
            const monthKey = m.format('jYYYY/jMM');
            const monthName = m.format('jMMMM jYYYY');
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { income: 0, expense: 0 };
                monthLabels.push(monthName);
            }
          }
        }
        
        filteredTransactions.forEach(t => {
            const monthKey = moment(t.date).format('jYYYY/jMM');
            if (monthlyData[monthKey]) {
                if (t.flow === TransactionFlow.INCOME) monthlyData[monthKey].income += t.amount;
                else monthlyData[monthKey].expense += t.amount;
            }
        });

        const monthlyIncome = monthLabels.map(label => monthlyData[Object.keys(monthlyData).find(key => moment(key, 'jYYYY/jMM').format('jMMMM jYYYY') === label) || '']?.income || 0);
        const monthlyExpense = monthLabels.map(label => monthlyData[Object.keys(monthlyData).find(key => moment(key, 'jYYYY/jMM').format('jMMMM jYYYY') === label) || '']?.expense || 0);
        
        if (yearlyChartRef.current) {
             chartInstances.current.yearly = new (window as any).Chart(yearlyChartRef.current, {
                type: 'bar',
                data: {
                    labels: monthLabels,
                    datasets: [
                        { label: 'درآمد', data: monthlyIncome, backgroundColor: 'rgba(16, 185, 129, 0.7)' },
                        { label: 'هزینه', data: monthlyExpense, backgroundColor: 'rgba(239, 68, 68, 0.7)' }
                    ]
                },
                options: {...commonOptions, scales: { y: { ticks: { font: chartFont } }, x: { ticks: { font: chartFont } } } }
             });
        }

        if (boardChartRef.current) {
            let runningBalance = openingBalance;
            const balanceData = monthlyIncome.map((income, index) => {
                runningBalance += income - monthlyExpense[index];
                return runningBalance;
            });

             chartInstances.current.board = new (window as any).Chart(boardChartRef.current, {
                type: 'bar',
                data: {
                    labels: monthLabels,
                    datasets: [
                        { label: 'درآمد', data: monthlyIncome, backgroundColor: 'rgba(16, 185, 129, 0.7)', order: 2 },
                        { label: 'هزینه', data: monthlyExpense, backgroundColor: 'rgba(239, 68, 68, 0.7)', order: 2 },
                        { type: 'line', label: 'مانده حساب', data: balanceData, borderColor: 'rgba(59, 130, 246, 1)', tension: 0.1, fill: false, order: 1 }
                    ]
                },
                 options: {...commonOptions, scales: { y: { ticks: { font: chartFont } }, x: { ticks: { font: chartFont } } } }
             });
        }
        
        // Expense Breakdown Bar Chart
        const specificExpenseCategories = [
            ExpenseCategory.STATIONERY, 
            ExpenseCategory.ANIMAL_SACRIFICE, 
            ExpenseCategory.BREAD, 
            ExpenseCategory.GROCERIES
        ];
        const expenseBreakdownData = filteredTransactions
            .filter(t => t.flow === TransactionFlow.EXPENSE && specificExpenseCategories.includes(t.category as ExpenseCategory))
            .reduce((acc, t) => {
                const categoryName = getCategoryName(t.category, t.flow);
                acc[categoryName] = (acc[categoryName] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);
        
        if (expenseBreakdownChartRef.current && Object.keys(expenseBreakdownData).length > 0) {
            chartInstances.current.expenseBreakdown = new (window as any).Chart(expenseBreakdownChartRef.current, {
                type: 'bar',
                data: {
                    labels: Object.keys(expenseBreakdownData),
                    datasets: [{
                        label: 'مبلغ هزینه (ریال)',
                        data: Object.values(expenseBreakdownData),
                        backgroundColor: [
                            'rgba(239, 68, 68, 0.7)',
                            'rgba(249, 115, 22, 0.7)',
                            'rgba(245, 158, 11, 0.7)',
                            'rgba(132, 204, 22, 0.7)',
                        ],
                        borderColor: [
                            'rgba(239, 68, 68, 1)',
                            'rgba(249, 115, 22, 1)',
                            'rgba(245, 158, 11, 1)',
                            'rgba(132, 204, 22, 1)',
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    ...commonOptions,
                    plugins: {
                        legend: {
                            display: false
                        },
                    },
                    scales: { 
                        y: { ticks: { font: chartFont, callback: (value) => new Intl.NumberFormat('fa-IR').format(Number(value)) } }, 
                        x: { ticks: { font: chartFont } } 
                    }
                }
            });
        }


        return () => {
            Object.values(chartInstances.current).forEach((chart: any) => chart?.destroy());
        };

    }, [filteredTransactions, openingBalance, dateError, startDate, endDate]);
  
    return (
        <div className="space-y-8">
            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <div>
                        <label className="block text-base font-medium text-gray-700 mb-1">تاریخ شروع</label>
                        <div className="flex gap-2">
                            <input type="number" placeholder="روز" value={startJalali.day} onChange={e => setStartJalali(p => ({...p, day: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-base font-yekan"/>
                            <input type="number" placeholder="ماه" value={startJalali.month} onChange={e => setStartJalali(p => ({...p, month: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-base font-yekan"/>
                            <input type="number" placeholder="سال" value={startJalali.year} onChange={e => setStartJalali(p => ({...p, year: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-base font-yekan"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-base font-medium text-gray-700 mb-1">تاریخ پایان</label>
                        <div className="flex gap-2">
                            <input type="number" placeholder="روز" value={endJalali.day} onChange={e => setEndJalali(p => ({...p, day: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-base font-yekan"/>
                            <input type="number" placeholder="ماه" value={endJalali.month} onChange={e => setEndJalali(p => ({...p, month: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-base font-yekan"/>
                            <input type="number" placeholder="سال" value={endJalali.year} onChange={e => setEndJalali(p => ({...p, year: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-base font-yekan"/>
                        </div>
                    </div>
                </div>
                 {dateError && <p className="text-red-500 text-sm mt-2">{dateError}</p>}
            </div>

            {/* Financial Summary Table */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">خلاصه عملکرد مالی دوره (قابل ویرایش)</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div>
                        <label htmlFor="openingBalance" className="block text-base font-medium text-gray-700 mb-1">مانده اول دوره (ریال)</label>
                        <input type="number" id="openingBalance" value={openingBalance} onChange={e => setOpeningBalance(Number(e.target.value) || 0)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-base font-yekan" placeholder="0" />
                    </div>
                    <div>
                        <label htmlFor="totalIncome" className="block text-base font-medium text-gray-700 mb-1">مجموع واریزی (ریال)</label>
                        <input type="number" id="totalIncome" value={totalIncome} onChange={e => setManualTotalIncome(Number(e.target.value) || 0)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-base font-yekan" />
                         {manualTotalIncome !== null && <button onClick={() => setManualTotalIncome(null)} className="text-xs text-blue-600 hover:underline mt-1">بازنشانی به {formatCurrency(calculatedTotalIncome)}</button>}
                    </div>
                    <div>
                        <label htmlFor="totalExpense" className="block text-base font-medium text-gray-700 mb-1">مجموع برداشت (ریال)</label>
                        <input type="number" id="totalExpense" value={totalExpense} onChange={e => setManualTotalExpense(Number(e.target.value) || 0)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-base font-yekan" />
                         {manualTotalExpense !== null && <button onClick={() => setManualTotalExpense(null)} className="text-xs text-blue-600 hover:underline mt-1">بازنشانی به {formatCurrency(calculatedTotalExpense)}</button>}
                    </div>
                     <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center h-full flex flex-col justify-center">
                        <p className="text-base text-blue-700">مانده پایان دوره</p>
                        <p className="text-2xl font-bold text-blue-800 font-yekan">{formatCurrency(closingBalance)}</p>
                    </div>
                </div>
            </div>

            {/* AI Analysis Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-semibold text-gray-800">تحلیل هوشمند گزارش</h3>
                    <button onClick={handleGenerateAnalysis} disabled={isGenerating || !!dateError} className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow disabled:bg-emerald-300 disabled:cursor-not-allowed text-base">
                        <SparklesIcon className="h-5 w-5 ml-2" />
                        <span>{isGenerating ? 'در حال تولید...' : 'ایجاد تحلیل گزارش'}</span>
                    </button>
                </div>
                {isGenerating && <div className="text-center text-gray-500 p-4 text-base">درحال پردازش اطلاعات و تولید تحلیل... لطفا منتظر بمانید.</div>}
                {analysis && <div className="bg-gray-50 p-4 rounded-md border text-gray-700 leading-relaxed whitespace-pre-wrap text-base">{analysis}</div>}
            </div>
            
            {/* Statistical Report */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">گزارش آماری</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="p-4 rounded-lg border">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">نمودار واریزی و برداشتی طی دوره</h4>
                        <div className="h-96"><canvas ref={yearlyChartRef}></canvas></div>
                    </div>
                     <div className="p-4 rounded-lg border">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">گزارش جامع هیئت مدیره</h4>
                        <div className="h-96"><canvas ref={boardChartRef}></canvas></div>
                    </div>
                    <div className="p-4 rounded-lg border">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">تفکیک درآمد</h4>
                        <div className="h-96"><canvas ref={incomeChartRef}></canvas></div>
                    </div>
                    <div className="p-4 rounded-lg border">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">تفکیک هزینه</h4>
                        <div className="h-96"><canvas ref={expenseChartRef}></canvas></div>
                    </div>
                    <div className="lg:col-span-2 p-4 rounded-lg border">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">نمودار هزینه‌ها (نوشت افزار، ذبح، نان، مواد غذایی)</h4>
                        <div className="h-96"><canvas ref={expenseBreakdownChartRef}></canvas></div>
                    </div>
                </div>
            </div>

            {/* Detailed Transactions */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">جزئیات تراکنش‌های دوره</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="border-b text-gray-500">
                            <tr>
                                <th className="p-3 text-base font-semibold text-gray-600 uppercase tracking-wider">نوع</th>
                                <th className="p-3 text-base font-semibold text-gray-600 uppercase tracking-wider">توضیحات/دسته بندی</th>
                                <th className="p-3 text-base font-semibold text-gray-600 uppercase tracking-wider">تاریخ</th>
                                <th className="p-3 text-base font-semibold text-gray-600 uppercase tracking-wider">مبلغ (ریال)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
                                <tr key={t.id} className="border-b hover:bg-gray-50">
                                    <td className={`p-3 text-base font-semibold ${t.flow === TransactionFlow.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.flow === TransactionFlow.INCOME ? 'ورودی' : 'خروجی'}
                                    </td>
                                    <td className="p-3 text-gray-800">
                                        <p className="font-semibold text-base text-gray-800">{t.description}</p>
                                        <p className="text-sm text-gray-500">{t.source || getCategoryName(t.category, t.flow)}</p>
                                    </td>
                                    <td className="p-3 text-base text-gray-600 font-yekan">{formatDate(t.date)}</td>
                                    <td className="p-3 text-base font-semibold text-gray-700 font-yekan">{formatCurrency(t.amount)}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="text-center p-6 text-gray-500 text-base">تراکنشی در این بازه زمانی یافت نشد.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;