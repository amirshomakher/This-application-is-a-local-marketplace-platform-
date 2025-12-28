import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../services/supabase';

function CreateAd({ user }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    city: 'تهران',
    images: []
  })
  const [imageInputs, setImageInputs] = useState([''])

  useEffect(() => {
    if (!user) {
      alert('لطفاً ابتدا وارد حساب کاربری خود شوید.')
      navigate('/login')
      return
    }
    setCurrentUser(user)
    console.log('کاربر فعلی:', user)
  }, [user, navigate])

  const categories = ['املاک', 'خودرو', 'موبایل', 'لپ‌تاپ', 'خانه', 'دیگر']

  const addImageField = () => {
    setImageInputs([...imageInputs, ''])
  }

  const removeImageField = (index) => {
    const newInputs = imageInputs.filter((_, i) => i !== index)
    setImageInputs(newInputs)
    const filteredImages = newInputs.filter(url => url.trim() !== '')
    setForm({ ...form, images: filteredImages })
  }

  const handleImageChange = (index, value) => {
    const newInputs = [...imageInputs]
    newInputs[index] = value
    setImageInputs(newInputs)
    const filteredImages = newInputs.filter(url => url.trim() !== '')
    setForm({ ...form, images: filteredImages })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!currentUser) {
      alert('لطفاً ابتدا وارد حساب کاربری خود شوید.')
      return
    }

  
    if (!form.title.trim() || !form.desc.trim() || !form.category.trim()) {
      alert('لطفاً فیلدهای ضروری (عنوان، توضیحات، دسته‌بندی) را پر کنید.')
      return
    }

    setLoading(true)

    try {
  
      const adData = {
        title: form.title.trim(),
        description: form.desc.trim(),
        category: form.category,
        city: form.city.trim(),
        images: form.images,
        user_id: currentUser.id, 
        active: true,
        created_at: new Date().toISOString()
      }


      if (form.price.trim()) {
        const priceNum = parseFloat(form.price)
        if (!isNaN(priceNum) && priceNum > 0) {
          adData.price = priceNum
        }
      }

      console.log('📤 در حال ارسال آگهی با داده:', adData)

      const { data, error } = await supabase
        .from('ads')
        .insert([adData])
        .select()

      if (error) {
        console.error('❌ خطای Supabase:', error)

    
        if (error.message.includes('uuid') || error.message.includes('userid')) {
         
          alert('خطا در شناسه کاربر. لطفاً به پشتیبانی اطلاع دهید.')
        }

        throw error
      }

      console.log('✅ آگهی ثبت شد:', data)
      alert('✅ آگهی با موفقیت ثبت شد!')
      navigate('/')

    } catch (error) {
      console.error('❌ خطای ثبت آگهی:', error)
      alert(`❌ خطا در ثبت آگهی: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">در حال بررسی وضعیت ورود...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">ثبت آگهی جدید</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">عنوان آگهی *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="مثال: آیفون 13 پرو max"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">دسته‌بندی *</label>
          <select
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">انتخاب کنید</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">توضیحات *</label>
          <textarea
            required
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
            rows="4"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="شرح کامل آگهی..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">قیمت (تومان)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مثال: 50000000"
              min="0"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">شهر *</label>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="تهران"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">آدرس عکس‌ها</label>
          <div className="space-y-3">
            {imageInputs.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
                {imageInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 rounded-lg transition-colors"
                  >
                    حذف
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addImageField}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + افزودن عکس دیگر
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            می‌توانید چندین آدرس عکس وارد کنید (اختیاری)
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors"
        >
          {loading ? 'در حال ثبت...' : 'ثبت آگهی'}
        </button>
      </form>
    </div>
  )
}

export default CreateAd