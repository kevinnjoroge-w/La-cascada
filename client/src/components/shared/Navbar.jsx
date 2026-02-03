import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Rooms', path: '/#rooms' },
    { name: 'Sports Bar', path: '/#sports-bar' },
    { name: 'Garden', path: '/#garden' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isOpen
          ? 'bg-white shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isScrolled || isOpen ? 'bg-primary-600' : 'bg-white/90'
            }`}>
              <span className={`text-2xl ${isScrolled || isOpen ? 'text-white' : 'text-primary-600'}`}>🏨</span>
            </div>
            <span className={`text-xl font-display font-bold ${
              isScrolled || isOpen ? 'text-secondary-900' : 'text-white'
            }`}>
              Hotel Complex
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-medium transition-colors duration-200 ${
                  isScrolled || isOpen
                    ? 'text-secondary-600 hover:text-primary-600'
                    : 'text-white/90 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className={`font-medium ${
                    isScrolled || isOpen
                      ? 'text-secondary-600 hover:text-primary-600'
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`font-medium ${
                      isScrolled || isOpen
                        ? 'text-secondary-600 hover:text-primary-600'
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="btn-primary text-sm py-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`font-medium ${
                    isScrolled || isOpen
                      ? 'text-secondary-600 hover:text-primary-600'
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-lg ${
              isScrolled || isOpen ? 'text-secondary-900' : 'text-white'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-secondary-200">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="font-medium text-secondary-600 hover:text-primary-600"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-secondary-200">
                {isAuthenticated ? (
                  <div className="flex flex-col space-y-4">
                    <Link to="/dashboard" className="font-medium text-secondary-600">
                      Dashboard
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="font-medium text-secondary-600">
                        Admin
                      </Link>
                    )}
                    <button onClick={handleLogout} className="btn-primary w-full">
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link to="/login" className="btn-secondary w-full text-center">
                      Login
                    </Link>
                    <Link to="/register" className="btn-primary w-full text-center">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

