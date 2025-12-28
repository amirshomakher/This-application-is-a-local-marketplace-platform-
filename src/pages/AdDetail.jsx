import React, { useEffect, useState } from 'react'
import supabase from '../services/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { Phone, MapPin, Calendar, User, ChevronLeft, Share2, Heart, ImageOffIcon } from 'lucide-react';

function AdDetail() {
  const { id } = useParams()
  const [ad, setAd] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const navigate = useNavigate()

  const fetchAdDetails = async () => {
    if (!id) return
    setLoading(true)

    try {
      const { data: adData, error: adError } = await supabase
        .from('ads')
        .select('*')
        .eq('id', id)
        .eq('active', true)
        .single()

      if (adError) throw adError

      if (!adData) {
        alert('آگهی یافت نشد!')
        navigate('/')
        return
      }

      setAd(adData)

      if (adData.userid) {
        const { data: userData } = await supabase
          .from('users')
          .select('name, phone, created_at')
          .eq('id', adData.userid)
          .single()

        setUser(userData || { name: 'ناشناس', phone: 'نامشخص' })
      }
    } catch (error) {
      console.error('خطا در دریافت آگهی:', error)
      alert('مشکلی در بارگذاری آگهی پیش آمده است')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdDetails()
  }, [id])

  const formatPrice = (price) => {
    if (!price) return 'قیمت توافقی'
    return `${price.toLocaleString('fa-IR')} تومان`
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'تاریخ نامعتبر'
    }
  }

  const nextImage = () => {
    if (ad?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % ad.images.length)
    }
  }

  const prevImage = () => {
    if (ad?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + ad.images.length) % ad.images.length)
    }
  }


  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: ad.title,
          text: ad.text,
          url: window.location.href,
        })
      } catch (error) {
        console.error('خطا در اشتراک‌گذاری:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('لینک آگهی در کلیپ‌بورد کپی شد!')
    }
  }


  const handleSave = () => {
    setIsLiked(!isLiked)

    const savedAds = JSON.parse(localStorage.getItem('savedAds') || '[]')

    if (isLiked) {
      const newSaved = savedAds.filter(savedId => savedId !== id)
      localStorage.setItem('savedAds', JSON.stringify(newSaved))
    } else {
      localStorage.setItem('savedAds', JSON.stringify([...savedAds, id]))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری آگهی...</p>
        </div>
      </div>
    )
  }

  if (!ad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">آگهی یافت نشد</h2>
          <p className="text-gray-600 mb-6">آگهی مورد نظر وجود ندارد یا حذف شده است.</p>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    )

  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-200">

      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft className="ml-1" size={20} />
              بازگشت
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
              >
                <Share2 size={20} />
                <span className="hidden sm:inline">اشتراک‌گذاری</span>
              </button>

              <button
                onClick={handleSave}
                className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
              >
                <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                <span className="hidden sm:inline">ذخیره</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50">
              <div className="relative h-96 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50">
                {ad.images && ad.images.length > 0 ? (
                  <>
                    <img
                      src={ad.images[currentImageIndex]}
                      alt={ad.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5YzljOWMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5Gg8J+agPCfkqY8L3RleHQ+PC9zdmc+'
                      }}
                    />


                    {ad.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg rotate-180"
                        >
                          <ChevronLeft size={24} />
                        </button>
                      </>
                    )}


                    {ad.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {ad.images.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <div className="text-5xl mb-4"><ImageOffIcon /></div>
                    <span className="text-lg">بدون عکس</span>
                  </div>
                )}
              </div>

              {ad.images && ad.images.length > 1 && (
                <div className="p-4 border-t">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {ad.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${currentImageIndex === index ? 'border-blue-500' : 'border-transparent'}`}
                      >
                        <img
                          src={img}
                          alt={`${ad.title} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>


            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 rounded-xl shadow-lg p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-200">{ad.title}</h1>
                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                    {ad.category}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-gray-600 mb-6">
                  <div className="flex items-center">
                    <Calendar size={18} className="ml-1" />
                    <span>{formatDate(ad.created_at)}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={18} className="ml-1" />
                    <span>{ad.city}</span>
                  </div>
                </div>

                <div className="text-3xl font-bold text-green-600 mb-6">
                  {formatPrice(ad.price)}
                </div>
              </div>


              <div>
                <h2 className="text-xl font-bold text-gray-200 mb-4">توضیحات</h2>
                <div className="prose max-w-none text-gray-300 whitespace-pre-line">
                  {ad.description}
                </div>
              </div>


              <div className="mt-8 pt-8 border-t">
                <h2 className="text-xl font-bold text-gray-200 mb-4">مشخصات</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-slate-700/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">دسته‌بندی</div>
                    <div className="font-medium">{ad.category}</div>
                  </div>
                  <div className="bg-slate-700/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">شهر</div>
                    <div className="font-medium">{ad.city}</div>
                  </div>
                  <div className="bg-slate-700/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">وضعیت</div>
                    <div className="font-medium text-green-600">فعال</div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div className="space-y-6">

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-400 mb-4">اطلاعات فروشنده</h2>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center text-green-600 text-2xl">
                  <User size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-500">{user?.name || 'ناشناس'}</h3>
                  <p className="text-gray-600 text-sm">عضویت از {user?.created_at ? formatDate(user.created_at).split('،')[0] : 'نامشخص'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition">
                  <Phone size={20} />
                  نمایش شماره تماس
                </button>

                <button className="w-full border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-blue-100 py-3 rounded-lg font-bold transition">
                  ارسال پیام
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h3 className="font-bold text-yellow-800 mb-2">⚠️ نکات ایمنی</h3>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• پیش از خرید، کالا را از نزدیک بررسی کنید</li>
                <li>• از پرداخت پیش‌پرداخت خودداری کنید</li>
                <li>• در مکان‌های عمومی معامله کنید</li>
                <li>• از ارائه اطلاعات شخصی خودداری کنید</li>
              </ul>
            </div>


            <div className="text-center">
              <button className="text-gray-500 hover:text-gray-700 text-sm">
                ⚠️ گزارش این آگهی
              </button>
            </div>
          </div>
        </div>


        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">آگهی‌های مشابه</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div className="text-center py-8 text-gray-500">
              <p>آگهی مشابهی یافت نشد</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



export default AdDetail