import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import useAuth from "./User/AuthProvider"
import Button, { ButtonLink } from "./components/Button"
import { LogoutButton } from "./User/Logout"
import Loading from "./components/Loading"

function NavItem({ to, children, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive
          ? "bg-white/10 text-white shadow-sm"
          : "text-white/70 hover:bg-white/5 hover:text-white"
        }`}
    >
      {children}
    </Link>
  );
}

function NavBarUser({ user }) {
  return (
    <div className="flex items-center gap-4">
      <div className="hidden lg:flex items-center gap-1">
        <NavItem to="/board">Boards</NavItem>
        <NavItem to="/friends">Friends</NavItem>
        {user.role === "superadmin" && <NavItem to="/admin">Admin</NavItem>}
      </div>
      <div className="h-6 w-px bg-white/10 mx-2 hidden lg:block"></div>
      <div className="flex items-center gap-3">
        <Link to={`/user/${user.username}`} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-brand-400 flex items-center justify-center text-white font-bold text-xs border border-white/20 group-hover:bg-brand-300 transition-all">
            {user.username[0].toUpperCase()}
          </div>
          <span className="text-white text-sm font-semibold group-hover:text-brand-200 transition-colors hidden sm:inline">
            {user.username}
          </span>
        </Link>
        <LogoutButton
          className="!bg-white/10 !border-white/10 !text-white hover:!bg-white/20"
          variant="ghost"
          size="sm"
        />
      </div>
    </div>
  )
}

function NavBarLogin() {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden lg:block">
        <NavItem to="/board">Boards</NavItem>
      </div>
      <div className="h-6 w-px bg-white/10 mx-2 hidden lg:block"></div>
      <ButtonLink link="/login" variant="ghost" size="sm" className="!text-white hover:!bg-white/10">
        Login
      </ButtonLink>
      <ButtonLink link="/register" variant="outline" size="sm" className="!bg-white !text-brand-700 !border-transparent hover:!bg-brand-50">
        Sign Up
      </ButtonLink>
    </div>
  )
}

function MobileMenu({ user, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden bg-surface-800 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
        <NavItem to="/board" onClick={onClose}>Boards</NavItem>
        {user && (
          <>
            <NavItem to="/friends" onClick={onClose}>Friends</NavItem>
            {user.role === "superadmin" && <NavItem to="/admin" onClick={onClose}>Admin</NavItem>}
          </>
        )}
      </div>
    </div>
  );
}

export default function NavBar() {
  const { user, loading } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-surface-900/95 backdrop-blur-md shadow-soft-lg"
        : "bg-surface-900"
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between ${scrolled ? "h-14" : "h-16"} transition-all duration-300`}>
          <div className="flex items-center gap-4">
            {/* Hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:rotate-6 transition-transform">
                T
              </div>
              <span className="text-xl font-black text-white tracking-tight uppercase">
                Transcendence
              </span>
            </Link>
          </div>

          <div className="flex items-center">
            {loading ? (
              <div className="opacity-20"><Loading /></div>
            ) : user ? (
              <NavBarUser user={user} />
            ) : (
              <NavBarLogin />
            )}
          </div>
        </div>
      </div>
      <MobileMenu user={user} isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </nav>
  )
}
