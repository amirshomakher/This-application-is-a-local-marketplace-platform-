import React, { useEffect, useState } from 'react'
import supabase from '../services/supabase';
import { Link } from 'react-router-dom';
import {
  Filter, Search, DollarSign, Calendar,
  MapPin, Tag, Grid3x3, List, Loader2
} from 'lucide-react';
import Header from '../components/Header';


function Home() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [Viewmode, setViewMode] = useState('list')
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest'
  });

  const [user, setUser] = useState(null)
  const [showfilters, setShowfilters] = useState(false)

  useEffect(() => {
    console.log('🚀 App component mounted - checking localStorage')

    const savedUser = localStorage.getItem('user')
    console.log('📦 localStorage user:', savedUser)

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        console.log('✅ کاربر از localStorage لود شد:', parsedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('❌ خطا در پارس کردن user:', error)
        localStorage.removeItem('user')
      }
    } else {
      console.log('ℹ️ کاربری در localStorage یافت نشد')
    }
  }, [])

  const handleShowFilter = () => {
    setShowfilters(prev => !prev)
  }

  const login = (userData) => {
    console.log('🟢 login فراخوانی شد با:', userData)


    localStorage.setItem('user', JSON.stringify(userData))


    setUser(userData)

    console.log('✅ کاربر لاگین شد و ذخیره شد')
    console.log('localStorage user:', localStorage.getItem('user'))
  }

  const logout = () => {
    console.log('🔴 logout فراخوانی شد')

    localStorage.removeItem('user')

    setUser(null)

    console.log('✅ کاربر خارج شد')
  }



  useEffect(() => {
    fetchAds();
  }, [filters])


  const fetchAds = async () => {
    setLoading(true);

    try {


      let query = supabase
        .from('ads')
        .select('id, title, description, category, price, city, images, created_at, active')
        .eq('active', true);

      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.minPrice) {
        query = query.gte('price', Number(filters.minPrice))
      }
      if (filters.maxPrice) {
        query = query.lte('price', Number(filters.maxPrice))
      }

      if (filters.sortBy === 'newest') {
        query = query.order('created_at', { ascending: false })
      } else if (filters.sortBy === 'cheapest') {
        query = query.order('price', { ascending: true })
      }

      const { data, error } = await query.limit(20)

      if (error) {
        console.error('Supabase error:', error)
        return
      }

      let filteredData = data || [];
      if (searchQuery.trim()) {
        filteredData = filteredData.filter(ad =>
          ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ad.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setAds(data || [])

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResetFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest'
    })
    setSearchQuery('')
  }

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAds();
  }

  const formatPrice = (price) => {
    if (!price) return 'قیمت توافقی';
    return `${price.toLocaleString('fa-IR')} تومان`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const categories = ['املاک', 'خودرو', 'موبایل', 'لپ‌تاپ', 'خانه']



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-200">
      <Header
        user={user}
        logout={logout}
        login={login}
        handleShowFilter={handleShowFilter}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی آگهی‌ها..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-12 text-right placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r  from-emerald-700  hover:from-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
          
            </button>
          </form>
        </div>


        {showfilters && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold text-white">فیلترها</h2>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex bg-gray-900 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${Viewmode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${Viewmode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={handleResetFilters}
                  className="text-gray-400 hover:text-white text-sm flex items-center gap-2"
                >
                  بازنشانی فیلترها
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  دسته‌بندی
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-right focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                >
                  <option value="">همه دسته‌ها</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
                  ))}
                </select>
              </div>


              <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  حداقل قیمت
                </label>
                <input
                  type="number"
                  placeholder="مثلاً 100000"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-right placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  حداکثر قیمت
                </label>
                <input
                  type="number"
                  placeholder="مثلاً 5000000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-right placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>


              <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  مرتب‌سازی
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-right focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                >
                  <option value="newest" className="bg-gray-900">جدیدترین</option>
                  <option value="cheapest" className="bg-gray-900">ارزان‌ترین</option>
                </select>
              </div>
            </div>
          </div>
        )}


        <div className="mb-6 flex justify-between items-center">
          <div className="text-gray-400">
            <span className="text-white font-bold">{ads.length}</span> آگهی یافت شد
          </div>
          <div className="text-sm text-gray-400">
            {loading && (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                در حال بارگذاری...
              </div>
            )}
          </div>
        </div>


        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-700" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-700 rounded" />
                  <div className="h-4 bg-gray-700 rounded w-3/4" />
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-700 rounded w-24" />
                    <div className="h-4 bg-gray-700 rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700/50">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800/50 mb-6">
              <Search className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">آگهی‌ای یافت نشد</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              هیچ آگهی‌ای با فیلترهای انتخاب‌شده وجود ندارد. لطفاً فیلترها را تغییر دهید یا عبارت جستجو را بررسی کنید.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              نمایش همه آگهی‌ها
            </button>
          </div>
        ) : Viewmode === 'grid' ? (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ads.map(ad => (
              <Link
                key={ad.id}
                to={`/ad/${ad.id}`}
                className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 hover:border-green-600 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              >
                <div className="h-56 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
                  {ad.images?.[0] ? (
                    <img
                      src={ad.images[0]}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                      <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mb-3">
                        <Tag className="w-8 h-8" />
                      </div>
                      بدون عکس
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 rounded-full text-xs font-medium border border-orange-500/30">
                      {ad.category}
                    </span>
                    {ad.price && (
                      <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 rounded-full text-xs font-medium border border-emerald-500/30">
                        قیمت ثابت
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-white mb-3 line-clamp-2 text-right h-14">
                    {ad.title}
                  </h3>

                  <div className="flex flex-col gap-3 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <DollarSign className="w-4 h-4" />
                        <span>قیمت:</span>
                      </div>
                      <span className="text-lg font-bold text-emerald-400">
                        {formatPrice(ad.price)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>موقعیت:</span>
                      </div>
                      <span className="text-white">{ad.city}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>تاریخ:</span>
                      </div>
                      <span className="text-gray-300">{formatDate(ad.created_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (

          <div className="space-y-4">
            {ads.map(ad => (
              <Link
                key={ad.id}
                to={`/ad/${ad.id}`}
                className="group flex flex-col md:flex-row bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 hover:border-green-500/50 overflow-hidden transition-all duration-300 hover:shadow-2xl"
              >
                <div className="md:w-64 h-48 md:h-auto bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
                  {ad.images?.[0] ? (
                    <img
                      src={ad.images[0]}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      بدون عکس
                    </div>
                  )}
                </div>
                <div className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 rounded-full text-sm font-medium border border-orange-500/30">
                          {ad.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 text-right">
                        {ad.title}
                      </h3>
                      <p className="text-gray-400 text-right line-clamp-2 mb-4">
                        {ad.description}
                      </p>
                    </div>

                    <div className="bg-gradient-to-b from-gray-900/50 to-transparent rounded-xl p-4 min-w-[180px]">
                      <div className="text-2xl font-bold text-emerald-400 mb-2 text-center">
                        {formatPrice(ad.price)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-700/50 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{ad.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(ad.created_at)}</span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      شناسه: {ad.id}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home