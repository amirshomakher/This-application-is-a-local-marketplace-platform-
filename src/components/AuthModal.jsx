import { useState } from 'react'
import supabase from '../services/supabase';

export default function AuthModal({ onClose, onLogin }) {
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const sendCode = async () => {
    setLoading(true)
    try {
      const verificationCode = Math.floor(1000 + Math.random() * 9000)
      localStorage.setItem(`verification_${phone}`, verificationCode.toString())
      
     
      alert(`کد تأیید: ${verificationCode} (برای تست کد 1234 را وارد کنید)`);
      
      setStep(2)
    } catch (error) {
      console.error('Error:', error)
      alert('خطا در ارسال کد')
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async () => {
    setLoading(true);
    try {
 
      if (code !== '1234') {
        alert('کد وارد شده اشتباه است. برای تست کد 1234 را وارد کنید.')
        return
      }

      const { data: existingUser } = await supabase
        .from('users')
        .select('id, name, phone')
        .eq('phone', phone)
        .maybeSingle();

      let userData;
      
      if (existingUser) {

        const { data } = await supabase
          .from('users')
          .update({
            name: name || existingUser.name,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)
          .select()
          .single();
        
        userData = {
          id: data.id,
          phone: data.phone,
          name: data.name
        };
      } else {

        const { data } = await supabase
          .from('users')
          .insert({
            phone: phone,
            name: name || `کاربر ${phone}`,
          })
          .select()
          .single();
        
        userData = {
          id: data.id,
          phone: data.phone,
          name: data.name
        };
      }

      console.log('✅ کاربر ساخته/یافت شد:', userData);


      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('✅ کاربر در localStorage ذخیره شد:');
      console.log('- user:', localStorage.getItem('user'));

      onLogin(userData);

      onClose();

      alert(`✅ خوش آمدید ${userData.name}!`);

    } catch (error) {
      console.error('Error:', error);
      alert('خطا در پردازش: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {step === 1 ? 'ورود با شماره موبایل' : 'تایید کد'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            &times;
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">شماره موبایل *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">نام و نام خانوادگی (اختیاری)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: علی محمدی"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={sendCode}
              disabled={!phone || loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'در حال ارسال...' : 'دریافت کد تأیید'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              با ثبت‌نام، قوانین و شرایط را پذیرفته‌اید.
            </p>
            
            <div className="text-center text-sm text-gray-600">
              <p>📝 برای تست:</p>
              <p>• شماره خود را وارد کنید</p>
              <p>• در مرحله بعد کد <strong>1234</strong> را وارد کنید</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-gray-600 mb-4">
                کد ۴ رقمی به شماره <span className="font-bold">{phone}</span> ارسال شد
              </p>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="1234"
                maxLength="4"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                برای تست کد <strong>1234</strong> را وارد کنید
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition"
              >
                ویرایش شماره
              </button>
              <button
                onClick={verifyCode}
                disabled={code.length !== 4 || loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
              >
                {loading ? 'در حال تأیید...' : 'تأیید و ورود'}
              </button>
            </div>

            <button
              onClick={sendCode}
              className="w-full text-blue-600 py-2 hover:text-blue-700 transition"
            >
              ارسال مجدد کد
            </button>
          </div>
        )}
      </div>
    </div>
  )
}