import React, { useState, useRef } from 'react';
import SendIcon from './icons/SendIcon';

const SmsSystem: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [recipients, setRecipients] = useState('');
  const [message, setMessage] = useState('با سلام، [نام] گرامی\nکمک شما به مبلغ [مبلغ] ریال دریافت گردید.\nاجرکم عندالله\nخیریه کارکنان شرکت');
  const [sendResult, setSendResult] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertPlaceholder = (placeholder: string) => {
    const textarea = messageTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + placeholder + text.substring(end);
      setMessage(newText);
      textarea.focus();
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
      }, 0);
    }
  };

  // This is a mock API call function.
  // In a real application, you would replace this with a fetch request to the sibsms.com API.
  const mockSendSmsAPI = (payload: any): Promise<{ success: boolean; message: string }> => {
    console.log("Simulating SMS send with payload:", payload);
    return new Promise(resolve => {
      setTimeout(() => {
        // Simulate a failure if API key is a specific value for testing
        if (payload.apiKey === 'fail') {
          resolve({ success: false, message: 'کلید API نامعتبر است. (خطای شبیه‌سازی شده)' });
        } else {
          resolve({ success: true, message: 'پیامک‌ها با موفقیت در صف ارسال قرار گرفتند.' });
        }
      }, 1500);
    });
  };

  const handleSendSms = async () => {
    if (!apiKey || !senderNumber || !recipients || !message) {
      setSendResult({ type: 'error', text: 'لطفاً تمام فیلدهای لازم را پر کنید.' });
      return;
    }

    setIsSending(true);
    setSendResult({ type: 'info', text: 'در حال ارسال پیامک‌ها...' });

    const recipientList = recipients.split(/[\n,]+/).map(num => num.trim()).filter(Boolean);

    const payload = {
        apiKey,
        senderNumber,
        recipients: recipientList,
        message,
    };

    const result = await mockSendSmsAPI(payload);

    if (result.success) {
      setSendResult({ type: 'success', text: result.message });
      setRecipients('');
    } else {
      setSendResult({ type: 'error', text: `خطا در ارسال: ${result.message}` });
    }
    setIsSending(false);
  };

  const characterCount = message.length;
  const isPersian = /[^\x00-\x7F]/.test(message); // Simple check for non-ASCII characters
  const smsLimit = isPersian ? 70 : 160;
  const smsParts = Math.ceil(characterCount / (characterCount > smsLimit ? (isPersian ? 67 : 153) : smsLimit));


  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">تنظیمات اتصال به سامانه پیامکی</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              کلید API (API Key)
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="کلید API خود را از sibsms.com وارد کنید"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-base"
            />
          </div>
          <div>
            <label htmlFor="senderNumber" className="block text-sm font-medium text-gray-700 mb-1">
              شماره فرستنده
            </label>
            <input
              type="text"
              id="senderNumber"
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              placeholder="مثال: 3000xxxx"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-base font-yekan"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
         <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">ارسال پیامک جدید</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 mb-1">
                    گیرندگان
                </label>
                <textarea
                    id="recipients"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    placeholder="شماره‌ها را با کاما (,) یا در خطوط جدید جدا کنید..."
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-base font-yekan"
                />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    متن پیام
                </label>
                <textarea
                    id="message"
                    ref={messageTextareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-base"
                />
                <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <div>
                        <span className="font-yekan">{characterCount}</span> حرف ({smsParts} پیامک)
                    </div>
                    <div>
                        <span className="ml-2">افزودن متغیر:</span>
                        <button onClick={() => handleInsertPlaceholder(' [نام] ')} className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors text-xs mx-1">نام</button>
                        <button onClick={() => handleInsertPlaceholder(' [مبلغ] ')} className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors text-xs">مبلغ</button>
                    </div>
                </div>
            </div>
         </div>
         <div className="mt-6 flex flex-col items-center">
             <button
                onClick={handleSendSms}
                disabled={isSending}
                className="w-full md:w-auto flex justify-center items-center bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors shadow text-base font-semibold disabled:bg-emerald-300 disabled:cursor-wait"
             >
                <SendIcon className="h-5 w-5 ml-2" />
                {isSending ? 'در حال ارسال...' : 'ارسال پیامک'}
             </button>
             {sendResult && (
                <div className={`mt-4 text-center p-3 rounded-md text-base w-full md:w-1/2 ${
                    sendResult.type === 'success' ? 'bg-green-100 text-green-800' : 
                    sendResult.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                    {sendResult.text}
                </div>
             )}
         </div>
      </div>
    </div>
  );
};

export default SmsSystem;
