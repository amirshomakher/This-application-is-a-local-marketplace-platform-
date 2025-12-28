import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import supabase from '../services/supabase';
import {
  User, LogOut, PlusCircle, List, Heart, Settings,
  Phone, UserCircle, Calendar, MapPin, Shield,
  MessageSquare, Bell, CreditCard, HelpCircle,
  Eye, Edit2, Trash2, Power, ExternalLink, Tag
} from 'lucide-react'
import Modal from '../components/Modal';

function Profile({ user }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('my-ads')
  const [userAds, setUserAds] = useState([])
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true)
  const [selectedAd, setSelectedAd] = useState(null);
  const [selectedAction, setSelectedAction] = useState('');
  const [stats, setStats] = useState({
    active: 0,
    pending: 0,
    sold: 0,
    totalViews: 0
  })

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  const fetchUserAds = async (userId) => {
    try {
      setLoading(true)
      console.log(`📡 در حال دریافت آگهی‌های کاربر (userid: ${userId})`)

      if (!userId || userId === 'null' || userId === 'undefined') {
        console.error('❌ userId نامعتبر:', userId)
        setUserAds([])
        setLoading(false)
        return
      }


      let query = supabase
        .from('ads')
        .select('*')
        .eq('userid', userId)
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('❌ خطای Supabase در دریافت آگهی‌ها:', error)


        const { data: data2, error: error2 } = await supabase
          .from('ads')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error2) {
          console.error('❌ خطا با ستون user_id هم:', error2)
          setUserAds([])
        } else {
          console.log(`✅ آگهی‌ها با ستون user_id دریافت شد (${data2?.length || 0} مورد)`)
          setUserAds(data2 || [])
          calculateStats(data2 || [])
        }
      } else {
        console.log(`✅ آگهی‌ها دریافت شدند: ${data?.length || 0} مورد`)
        setUserAds(data || [])
        calculateStats(data || [])
      }

    } catch (error) {
      console.error('❌ خطا در fetchUserAds:', error)
      setUserAds([])
    } finally {
      setLoading(false)
    }
  }

  const confirmAction = async () => {
    if (!selectedAd || !selectedAction) return

    try {
      if (selectedAction === 'toggle') {
        const newActiveStatus = !selectedAd.active

        const { error } = await supabase
          .from('ads')
          .update({ active: newActiveStatus })
          .eq('id', selectedAd.id)

        if (error) throw error

        setUserAds(prev => prev.map(ad =>
          ad.id === selectedAd.id ? { ...ad, active: newActiveStatus } : ad
        ))

        alert(`آگهی ${newActiveStatus ? 'فعال' : 'غیرفعال'} شد`)

      } else if (selectedAction === 'delete') {
        const { error } = await supabase
          .from('ads')
          .delete()
          .eq('id', selectedAd.id)

        if (error) throw error


        setUserAds(prev => prev.filter(ad => ad.id !== selectedAd.id))
        alert('آگهی با موفقیت حذف شد')
      }
    } catch (error) {
      console.error('❌ خطا در انجام عملیات:', error)
      alert('خطا در انجام عملیات')
    } finally {

      setModal(false)
      setSelectedAd(null)
      setSelectedAction('')
    }
  }

  const calculateStats = (ads) => {
    const active = ads.filter(ad => ad.active).length
    const pending = ads.filter(ad => ad.status === 'pending').length
    const sold = ads.filter(ad => ad.status === 'sold').length
    const totalViews = ads.reduce((sum, ad) => sum + (ad.views || 0), 0)

    setStats({
      active,
      pending,
      sold,
      totalViews
    })
  }

  const handleAdAction = async (adId, action) => {
    try {
      if (action === 'toggle') {

        const ad = userAds.find(a => a.id === adId)
        setSelectedAd(ad)
        setSelectedAction('toggle')
        setModal(true)

      } else if (action === 'delete') {

        const ad = userAds.find(a => a.id === adId)
        setSelectedAd(ad)
        setSelectedAction('delete')
        setModal(true)
      }
    } catch (error) {
      console.error('❌ خطا در انجام عملیات:', error)
      alert('خطا در انجام عملیات')
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchUserAds(user.id)
    }
  }, [user])

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fa-IR')
    } catch {
      return 'نامشخص'
    }
  }

  const formatPrice = (price) => {
    if (!price) return 'توافقی'
    return `${parseInt(price).toLocaleString('fa-IR')} تومان`
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 border border-slate-700/50 max-w-md mx-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-700/50 mb-6">
            <Shield className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">دسترسی محدود شده</h2>
          <p className="text-slate-300 mb-8">برای مشاهده پروفایل باید وارد حساب کاربری خود شوید.</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
            >
              ورود به حساب
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
            >
              صفحه اصلی
            </button>
          </div>
        </div>
      </div>
    )
  }


  const tabs = [
    { id: 'dashboard', label: 'داشبورد', icon: UserCircle },
    { id: 'my-ads', label: 'آگهی‌های من', icon: List },
    { id: 'favorites', label: 'علاقه‌مندی‌ها', icon: Heart },
    { id: 'messages', label: 'پیام‌ها', icon: MessageSquare },
    { id: 'notifications', label: 'اعلان‌ها', icon: Bell },
    { id: 'payments', label: 'تراکنش‌ها', icon: CreditCard },
    { id: 'settings', label: 'تنظیمات', icon: Settings },
    { id: 'support', label: 'پشتیبانی', icon: HelpCircle },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">

      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{user.name}</h1>
                <p className="text-sm text-slate-400">خوش آمدید!</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="text-slate-300 hover:text-white text-sm font-medium flex items-center gap-2"
            >
              <span>بازگشت به صفحه اصلی</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          <div className="lg:w-1/4">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">

              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{user.name}</h2>
                    <p className="text-sm text-slate-400 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {user.phone}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    عضویت از {formatDate(new Date().toISOString())}
                  </div>
                </div>
              </div>


              <nav className="p-2">
                {tabs.map(tab => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-300 ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-emerald-600/30 to-green-600/30 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>


              <div className="p-4 border-t border-slate-700/50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" />
                  خروج از حساب
                </button>
              </div>
            </div>

            <div className="mt-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <h3 className="font-bold text-white mb-4">آمار سریع</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">آگهی‌های فعال</span>
                  <span className="text-emerald-400 font-bold">{stats.active}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">آگهی‌های فروخته‌شده</span>
                  <span className="text-emerald-400 font-bold">{stats.sold}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">کل بازدیدها</span>
                  <span className="text-emerald-400 font-bold">{stats.totalViews}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">کل آگهی‌ها</span>
                  <span className="text-emerald-400 font-bold">{userAds.length}</span>
                </div>
              </div>
            </div>
          </div>


          <div className="lg:w-3/4">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">

              {activeTab === 'dashboard' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white">داشبورد کاربری</h2>
                    <Link
                      to="/create"
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2"
                    >
                      <PlusCircle className="w-5 h-5" />
                      ثبت آگهی جدید
                    </Link>
                  </div>


                  <div className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-2xl p-6 border border-slate-700/50 mb-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">سلام {user.name} 👋</h3>
                        <p className="text-slate-300">از بازگشت شما خوشحالیم! وضعیت حساب کاربری شما در زیر آمده است.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400">آگهی‌های فعال</span>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <List className="w-5 h-5 text-emerald-400" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-white">{stats.active}</div>
                      <div className="text-sm text-slate-400 mt-2">آگهی در حال نمایش</div>
                    </div>

                    <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400">کل بازدیدها</span>
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Eye className="w-5 h-5 text-blue-400" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-white">{stats.totalViews}</div>
                      <div className="text-sm text-slate-400 mt-2">بازدید از آگهی‌های شما</div>
                    </div>

                    <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400">کل آگهی‌ها</span>
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Tag className="w-5 h-5 text-purple-400" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-white">{userAds.length}</div>
                      <div className="text-sm text-slate-400 mt-2">آگهی ثبت شده</div>
                    </div>
                  </div>


                  <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-bold text-white mb-6">آگهی‌های اخیر</h3>
                    {userAds.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-slate-400">هنوز آگهی‌ای ثبت نکرده‌اید</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userAds.slice(0, 5).map(ad => (
                          <div key={ad.id} className="flex items-center justify-between py-3 border-b border-slate-700/30 last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-slate-700 overflow-hidden flex-shrink-0">
                                {ad.images?.[0] ? (
                                  <img
                                    src={ad.images[0]}
                                    alt={ad.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null
                                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhMWIyYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjcyN2UiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5Gg8J+agPCfkqY8L3RleHQ+PC9zdmc+'
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Tag className="w-5 h-5 text-slate-500" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-white">{ad.title}</div>
                                <div className="text-sm text-slate-400">{formatPrice(ad.price)}</div>
                              </div>
                            </div>
                            <div className="text-sm text-slate-500">{formatDate(ad.created_at)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'my-ads' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white">آگهی‌های من</h2>
                    <Link
                      to="/create"
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2"
                    >
                      <PlusCircle className="w-5 h-5" />
                      ثبت آگهی جدید
                    </Link>
                  </div>

                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                      <p className="mt-4 text-slate-400">در حال بارگذاری آگهی‌ها...</p>
                    </div>
                  ) : userAds.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/50 mb-6">
                        <List className="w-10 h-10 text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">هنوز آگهی‌ای ثبت نکرده‌اید</h3>
                      <p className="text-slate-400 mb-6">اولین آگهی خود را ثبت کنید و فروش خود را شروع کنید!</p>
                      <Link
                        to="/create"
                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 inline-flex items-center gap-2"
                      >
                        <PlusCircle className="w-5 h-5" />
                        ثبت اولین آگهی
                      </Link>
                    </div>
                  ) : (
                    <>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-800/30 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-white">{stats.active}</div>
                          <div className="text-sm text-slate-400">فعال</div>
                        </div>
                        <div className="bg-slate-800/30 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-white">{stats.pending}</div>
                          <div className="text-sm text-slate-400">در انتظار</div>
                        </div>
                        <div className="bg-slate-800/30 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-white">{stats.sold}</div>
                          <div className="text-sm text-slate-400">فروخته شده</div>
                        </div>
                        <div className="bg-slate-800/30 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-white">{userAds.length}</div>
                          <div className="text-sm text-slate-400">کل آگهی‌ها</div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {userAds.map(ad => (
                          <div key={ad.id} className="bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden hover:border-emerald-500/30 transition-all duration-300">
                            <div className="p-6">
                              <div className="flex flex-col lg:flex-row gap-6">

                                <div className="lg:w-48 h-48 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0">
                                  {ad.images?.[0] ? (
                                    <img
                                      src={ad.images[0]}
                                      alt={ad.title}
                                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                      onError={(e) => {
                                        e.target.onerror = null
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhMWIyYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjcyN2UiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5Gg8J+agPCfkqY8L3RleHQ+PC9zdmc+'
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Tag className="w-12 h-12 text-slate-600" />
                                    </div>
                                  )}
                                </div>


                                <div className="flex-1">
                                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-3">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${ad.active
                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                          : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                                          }`}>
                                          {ad.active ? 'فعال' : 'غیرفعال'}
                                        </span>
                                        <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm font-medium">
                                          {ad.category}
                                        </span>
                                      </div>

                                      <h3 className="text-xl font-bold text-white mb-2">{ad.title}</h3>

                                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
                                        <div className="flex items-center gap-1">
                                          <MapPin className="w-4 h-4" />
                                          <span>{ad.city}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Calendar className="w-4 h-4" />
                                          <span>{formatDate(ad.created_at)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Eye className="w-4 h-4" />
                                          <span>{ad.views || 0} بازدید</span>
                                        </div>
                                      </div>

                                      <div className="text-2xl font-bold text-emerald-400 mb-6">
                                        {formatPrice(ad.price)}
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      <Link
                                        to={`/ad/${ad.id}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl transition-all duration-300"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                        مشاهده
                                      </Link>
                                      <Link
                                        to={`/edit/${ad.id}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 border border-yellow-500/30 rounded-xl transition-all duration-300"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                        ویرایش
                                      </Link>
                                      <button
                                        onClick={() => handleAdAction(ad.id, 'toggle')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 border ${ad.active
                                          ? 'bg-slate-600/20 hover:bg-slate-600/30 text-slate-300 border-slate-500/30'
                                          : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/30'
                                          }`}
                                      >
                                        <Power className="w-4 h-4" />
                                        {ad.active ? 'غیرفعال' : 'فعال'}
                                      </button>
                                      <button
                                        onClick={() => handleAdAction(ad.id, 'delete')}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl transition-all duration-300"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        حذف
                                      </button>
                                    </div>
                                  </div>


                                  {ad.description && (
                                    <div className="text-slate-300 text-sm line-clamp-2">
                                      {ad.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}


              {!['dashboard', 'my-ads'].includes(activeTab) && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </h2>
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/50 mb-6">
                      {(() => {
                        const Icon = tabs.find(t => t.id === activeTab)?.icon || Settings
                        return <Icon className="w-10 h-10 text-emerald-400" />
                      })()}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">به زودی...</h3>
                    <p className="text-slate-400">این بخش در حال توسعه است و به زودی در دسترس قرار خواهد گرفت.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {modal && selectedAd && (
        <Modal
          title={selectedAction === 'delete' ? 'آیا از حذف آگهی مطمئن هستید؟' : 'آیا از تغییر وضعیت آگهی مطمئن هستید؟'}
          description={selectedAction === 'delete'
            ? `آگهی "${selectedAd.title}" به طور دائمی حذف خواهد شد. این عمل غیرقابل بازگشت است.`
            : `آگهی "${selectedAd.title}" ${selectedAd.active ? 'غیرفعال' : 'فعال'} خواهد شد.`
          }
          onConfirm={confirmAction}
          onCancel={() => {
            setModal(false)
            setSelectedAd(null)
            setSelectedAction('')
          }}
          type={selectedAction === 'delete' ? 'danger' : 'warning'}
        />
      )}
    </div>



  )
}

export default Profile