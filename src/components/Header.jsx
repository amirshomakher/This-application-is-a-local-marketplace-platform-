import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthModal from './AuthModal'
import { Filter, LogOut, Plus, Search, User } from 'lucide-react'
import  logo from '../assets/logo.png'

function Header({ user, logout, login, handleShowFilter  }) {
  const [showAuth, setShowAuth] = useState(false)
  const [city, setCity] = useState('تهران')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const cities = ['تهران', 'مشهد', 'اصفهان', 'شیراز', 'تبریز', 'کرج']

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/?search=${search}&city=${city}`)
    }
  }
  return (
    <>
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-10">


            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="logo" class='w-42 ' />
            </Link>
            <div className="relative">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="border border-green-700 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-800"
              >
                {cities.map(c => (
                  <option key={c} value={c} >{c}</option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                📍
              </div>
            </div>
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <button onClick={handleShowFilter} class="flex gap-0.5 border-1 border-green-700 items-center px-5 py-2.5 rounded-2xl text-green-600"> <Filter class="text-green-700"/> فیلتر جستوجو</button>
            </form>


            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link to="/create" className="bg-green-900 flex items-center justify-center text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                    <Plus /> ثبت آگهی
                  </Link>
                  <Link to="/profile" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-slate-700/50 rounded-full flex items-center justify-center">
                      <User class='text-green-700' />
                    </div>
                    <span className="hidden md:inline">{user.name || user.phone}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-red-500 border p-2 rounded-2xl hover:text-red-600"
                  >
                   <LogOut className='text-red-500'/>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  ورود / ثبت‌نام
                </button>
              )}
            </div>
          </div>
        </div>
      </header>


      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={login}  />}
    </>
  )
}

export default Header