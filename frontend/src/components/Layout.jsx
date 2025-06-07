import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const menuRef = useRef(null);

  const baseUrl = import.meta.env.VITE_API_URL;

  const nav = [
    { name: 'Explore', to: '/easyrent-explore' },
    { name: 'Post', to: '/easyrent-post' },
    { name: 'History', to: '/easyrent-history' },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    console.log('Logout initiated:', { user: user?.email, timestamp: new Date().toISOString() });
    logout();
    navigate('/easyrent-login');
  };

  const toggleMobileNav = () => {
    setIsMobileNavOpen((prev) => {
      console.log('Mobile nav toggled:', { isOpen: !prev, timestamp: new Date().toISOString() });
      return !prev;
    });
  };

  // Get the first letter of the user's name or fallback to 'U' (only used if user exists)
  const userInitial = user?.name?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6FA]">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg sm:text-xl text-[#3B5ED6]">EASY RENT</span>
          </div>
          <nav className="hidden md:flex gap-6 text-gray-700">
            {nav.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className={`hover:text-[#3B5ED6] pb-1 text-sm font-medium ${
                  location.pathname === item.to ? 'text-[#3B5ED6] border-b-2 border-[#3B5ED6]' : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileNav}
              className="md:hidden p-2 focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                {isMobileNavOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => {
                    setIsMenuOpen((prev) => !prev);
                    console.log('Avatar menu toggled:', {
                      isOpen: !isMenuOpen,
                      timestamp: new Date().toISOString(),
                    });
                  }}
                  className="flex items-center gap-2 focus:outline-none"
                  aria-label="Toggle profile menu"
                >
                  <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-[#3B5ED6] text-white text-lg sm:text-xl font-bold cursor-pointer hover:ring-2 hover:ring-[#3B5ED6] transition-all">
                    {userInitial}
                  </div>
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium truncate">{user?.name}</p>
                      <p className="text-gray-500 text-xs truncate">{user?.email}</p>
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
            ) : (
              <Link
                to="/easyrent-login"
                className="text-sm font-medium text-[#3B5ED6] hover:underline"
                aria-label="Sign in to your account"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
        {isMobileNavOpen && (
          <nav className="md:hidden bg-white border-t border-gray-200 px-4 py-3">
            <div className="flex flex-col gap-3">
              {nav.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className={`text-gray-700 hover:text-[#3B5ED6] text-base font-medium ${
                    location.pathname === item.to ? 'text-[#3B5ED6]' : ''
                  }`}
                  onClick={() => {
                    console.log('Nav item clicked:', { name: item.name, to: item.to, timestamp: new Date().toISOString() });
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      <footer className="bg-[#151F4B] text-white mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
          <div className="flex flex-col items-center md:flex-row md:justify-between gap-6 border-b border-[#B6B9D1]/20 pb-6">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-2 mb-2">
                <img src="/logo.png" alt="EasyRent Logo" className="h-6 sm:h-8 w-auto" />
                <span className="font-bold text-base sm:text-lg text-[#3B5ED6]">EASY RENT</span>
              </div>
              <p className="text-xs sm:text-sm text-[#B6B9D1] text-center md:text-left">
                Simplifying Your Rental Journey
              </p>
              <div className="flex gap-3 mt-4">
                {[
                  { href: 'https://instagram.com/easyrent', label: 'Instagram', path: 'M7.75 2A5.75 5.75 0 0 0 2 7.75v8.5A5.75 5.75 0 0 0 7.75 22h8.5A5.75 5.75 0 0 0 22 16.25v-8.5A5.75 5.75 0 0 0 16.25 2h-8.5zm0 1.5h8.5A4.25 4.25 0 0 1 20.5 7.75v8.5A4.25 4.25 0 0 1 16.25 20.5h-8.5A4.25 4.25 0 0 1 3.5 16.25v-8.5A4.25 4.25 0 0 1 7.75 3.5zm8.25 2.25a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z' },
                  { href: 'https://twitter.com/easyrent', label: 'Twitter', path: 'M22.46 5.92c-.8.36-1.66.6-2.56.7a4.48 4.48 0 0 0 1.97-2.48 8.94 8.94 0 0 1-2.83 1.08A4.48 4.48 0 0 0 11.2 9.03c0 .36.04.7.12 1.03-3.72-.18-7.02-1.97-9.23-4.68-.4.7-.62 1.5-.62 2.36 0 1.63.83 3.07 2.1 3.92-.77-.02-1.5-.23-2.13-.58v.06c0 2.28 1.62 4.18 3.77 4.6-.4.1-.82.16-1.26.16-.3 0-.6-.03-.88-.08.6 1.87 2.34 3.23 4.4 3.27A8.98 8.98 0 0 1 2 19.54c-.3 0-.6-.02-.9-.06A12.7 12.7 0 0 0 7.29 21c8.29 0 12.83-6.87 12.83-12.83 0-.2 0-.4-.01-.6.88-.64 1.65-1.44 2.25-2.35z' },
                  { href: 'https://facebook.com/easyrent', label: 'Facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                  { href: 'https://linkedin.com/company/easyrent', label: 'LinkedIn', path: 'M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="bg-[#232B4D] p-2.5 rounded-full hover:bg-[#3B5ED6] transition"
                  >
                    <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            <div className="w-full max-w-xs md:max-w-sm">
              <h3 className="font-semibold text-base sm:text-lg mb-2 text-center md:text-left">
                Stay Updated
              </h3>
              <p className="text-xs sm:text-sm text-[#B6B9D1] mb-3 text-center md:text-left">
                Subscribe for rental tips and updates
              </p>
              <div className="flex w-full">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 text-sm text-gray-900 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#3B5ED6]"
                />
                <button className="px-3 py-2 bg-[#3B5ED6] text-white text-sm rounded-r-md hover:bg-[#2746a3] transition">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-6">
            <div>
              <h4 className="font-semibold text-sm sm:text-base mb-2">About EasyRent</h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-[#B6B9D1]">
                <li><a href="/about" className="hover:text-[#3B5ED6] transition">Our Story</a></li>
                <li><a href="/blog" className="hover:text-[#3B5ED6] transition">Rental Tips</a></li>
                <li><a href="/careers" className="hover:text-[#3B5ED6] transition">Careers</a></li>
                <li><a href="/testimonials" className="hover:text-[#3B5ED6] transition">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base mb-2">Resources</h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-[#B6B9D1]">
                <li><a href="/help" className="hover:text-[#3B5ED6] transition">Help Center</a></li>
                <li><a href="/terms" className="hover:text-[#3B5ED6] transition">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-[#3B5ED6] transition">Privacy Policy</a></li>
                <li><a href="/faq" className="hover:text-[#3B5ED6] transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base mb-2">Get Started</h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-[#B6B9D1]">
                <li><a href="/easyrent-explore" className="hover:text-[#3B5ED6] transition">Find a Rental</a></li>
                <li><a href="/easyrent-post" className="hover:text-[#3B5ED6] transition">List Your Property</a></li>
                <li><a href="/easyrent-login" className="hover:text-[#3B5ED6] transition">Sign In</a></li>
                <li><a href="/easyrent-signup" className="hover:text-[#3B5ED6] transition">Sign Up</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base mb-2">Contact Us</h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-[#B6B9D1]">
                <li>Phone: +251 91 285 0202</li>
                <li className="truncate">Email: support@easyrent.com</li>
                <li className="truncate">Address: Bole Road, Addis Ababa, Ethiopia</li>
                <li>
                  <a href="/contact" className="hover:text-[#3B5ED6] transition">Contact Form</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 text-center text-xs sm:text-sm text-[#B6B9D1] border-t border-[#B6B9D1]/20 pt-4">
            Copyright © 2025 EasyRent Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}