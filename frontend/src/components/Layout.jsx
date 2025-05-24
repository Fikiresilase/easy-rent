import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const nav = [
    { name: 'Explore', to: '/easyrent-explore' },
    { name: 'Post', to: '/easyrent-post' },
    { name: 'History', to: '/easyrent-history' },
  ]

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/easyrent-login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6FA]">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="EasyRent Logo" className="h-10 w-auto" />
            <span className="font-bold text-xl text-[#3B5ED6]">EASY RENT</span>
          </div>
          {/* Navigation */}
          <nav className="flex gap-8 text-gray-700">
            {nav.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className={`hover:text-[#3B5ED6] pb-1 text-base font-medium ${location.pathname === item.to ? 'text-[#3B5ED6] border-b-2 border-[#3B5ED6]' : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          {/* Avatar with Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <img 
                src={user?.profile?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"} 
                alt="Profile" 
                className="h-10 w-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-[#3B5ED6] transition-all" 
              />
            </button>
            
            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#151F4B] text-white mt-12">
        <div className="max-w-7xl mx-auto py-12 px-6">
          {/* Top Section: Logo, Tagline, Newsletter */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 border-b border-[#B6B9D1]/20 pb-8">
            {/* Logo & Tagline */}
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-2 mb-2">
                <img src="/logo.png" alt="EasyRent Logo" className="h-8 w-auto" />
                <span className="font-bold text-lg text-[#3B5ED6]">EASY RENT</span>
              </div>
              <p className="text-sm text-[#B6B9D1] text-center md:text-left">
                Simplifying Your Rental Journey
              </p>
              <div className="flex gap-3 mt-4">
                <a href="https://instagram.com/easyrent" aria-label="Instagram" className="bg-[#232B4D] p-2 rounded-full hover:bg-[#3B5ED6] transition">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.75 2A5.75 5.75 0 0 0 2 7.75v8.5A5.75 5.75 0 0 0 7.75 22h8.5A5.75 5.75 0 0 0 22 16.25v-8.5A5.75 5.75 0 0 0 16.25 2h-8.5zm0 1.5h8.5A4.25 4.25 0 0 1 20.5 7.75v8.5A4.25 4.25 0 0 1 16.25 20.5h-8.5A4.25 4.25 0 0 1 3.5 16.25v-8.5A4.25 4.25 0 0 1 7.75 3.5zm8.25 2.25a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z" />
                  </svg>
                </a>
                <a href="https://twitter.com/easyrent" aria-label="Twitter" className="bg-[#232B4D] p-2 rounded-full hover:bg-[#3B5ED6] transition">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 5.92c-.8.36-1.66.6-2.56.7a4.48 4.48 0 0 0 1.97-2.48 8.94 8.94 0 0 1-2.83 1.08A4.48 4.48 0 0 0 11.2 9.03c0 .36.04.7.12 1.03-3.72-.18-7.02-1.97-9.23-4.68-.4.7-.62 1.5-.62 2.36 0 1.63.83 3.07 2.1 3.92-.77-.02-1.5-.23-2.13-.58v.06c0 2.28 1.62 4.18 3.77 4.6-.4.1-.82.16-1.26.16-.3 0-.6-.03-.88-.08.6 1.87 2.34 3.23 4.4 3.27A8.98 8.98 0 0 1 2 19.54c-.3 0-.6-.02-.9-.06A12.7 12.7 0 0 0 7.29 21c8.29 0 12.83-6.87 12.83-12.83 0-.2 0-.4-.01-.6.88-.64 1.65-1.44 2.25-2.35z" />
                  </svg>
                </a>
                <a href="https://facebook.com/easyrent" aria-label="Facebook" className="bg-[#232B4D] p-2 rounded-full hover:bg-[#3B5ED6] transition">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="https://linkedin.com/company/easyrent" aria-label="LinkedIn" className="bg-[#232B4D] p-2 rounded-full hover:bg-[#3B5ED6] transition">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                  </svg>
                </a>
              </div>
            </div>
            {/* Newsletter Signup */}
            <div className="w-full md:w-auto">
              <h3 className="font-semibold text-lg mb-3 text-center md:text-left">Stay Updated</h3>
              <p className="text-sm text-[#B6B9D1] mb-3 text-center md:text-left">
                Subscribe for rental tips and updates
              </p>
              <div className="flex w-full max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-l-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
                />
                <button className="px-4 py-2 bg-[#3B5ED6] text-white rounded-r-md hover:bg-[#2746a3] transition">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          {/* Bottom Section: Links & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
            {/* About EasyRent */}
            <div>
              <h4 className="font-semibold mb-3">About EasyRent</h4>
              <ul className="space-y-2 text-sm text-[#B6B9D1]">
                <li><a href="/about" className="hover:text-[#3B5ED6] transition">Our Story</a></li>
                <li><a href="/blog" className="hover:text-[#3B5ED6] transition">Rental Tips</a></li>
                <li><a href="/careers" className="hover:text-[#3B5ED6] transition">Careers</a></li>
                <li><a href="/testimonials" className="hover:text-[#3B5ED6] transition">Testimonials</a></li>
              </ul>
            </div>
            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-[#B6B9D1]">
                <li><a href="/help" className="hover:text-[#3B5ED6] transition">Help Center</a></li>
                <li><a href="/terms" className="hover:text-[#3B5ED6] transition">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-[#3B5ED6] transition">Privacy Policy</a></li>
                <li><a href="/faq" className="hover:text-[#3B5ED6] transition">FAQ</a></li>
              </ul>
            </div>
            {/* Get Started */}
            <div>
              <h4 className="font-semibold mb-3">Get Started</h4>
              <ul className="space-y-2 text-sm text-[#B6B9D1]">
                <li><a href="/easyrent-explore" className="hover:text-[#3B5ED6] transition">Find a Rental</a></li>
                <li><a href="/easyrent-post" className="hover:text-[#3B5ED6] transition">List Your Property</a></li>
                <li><a href="/easyrent-login" className="hover:text-[#3B5ED6] transition">Sign In</a></li>
                <li><a href="/easyrent-signup" className="hover:text-[#3B5ED6] transition">Sign Up</a></li>
              </ul>
            </div>
            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-3">Contact Us</h4>
              <ul className="space-y-2 text-sm text-[#B6B9D1]">
                <li>Phone: +251 91 285 0202</li>
                <li>Email: support@easyrent.com</li>
                <li>Address: Bole Road, Addis Ababa, Ethiopia</li>
                <li>
                  <a href="/contact" className="hover:text-[#3B5ED6] transition">Contact Form</a>
                </li>
              </ul>
            </div>
          </div>
          {/* Copyright */}
          <div className="mt-8 text-center text-sm text-[#B6B9D1] border-t border-[#B6B9D1]/20 pt-6">
            Copyright © 2025 EasyRent Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}