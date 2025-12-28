import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from './components/Header'
import Home from './pages/Home'
import AdDetail from './pages/AdDetail'
import CreateAd from './pages/CreateAd'
import Profile from './pages/Profile'

function App() {
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

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ad/:id" element={<AdDetail />} />
          <Route path="/create" element={
            user ? <CreateAd user={user} /> : <Navigate to="/" />
          } />
          <Route path="/profile" element={
            user ? <Profile user={user} /> : <Navigate to="/" />
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App