import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { id: 'about', title: 'About', path: '/about' },
  { id: 'projects', title: 'Projects', path: '/projects' },
  { id: 'profile', title: 'Profile', path: '/profile' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav
      className="fixed top-0 left-0 z-50 w-full transition-all duration-300"
      style={{
        background: 'rgba(5, 5, 5, 0.4)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 sm:px-12">
        {/* Logo — left side */}
        <Link
          to="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
          onClick={() => window.scrollTo(0, 0)}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 border border-white/20">
            <div className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-widest text-white">
            AI ARCH
          </span>
        </Link>

        {/* Desktop nav — right side */}
        <ul className="hidden list-none items-center gap-2 sm:flex">
          {navItems.map((item) => (
            <li key={item.id}>
              <Link
                to={item.path}
                className={`relative px-4 py-2 text-[14px] font-semibold tracking-wide transition-all duration-300 rounded-full ${
                  location.pathname === item.path
                    ? 'text-white bg-white/10'
                    : 'text-[#888] hover:text-white hover:bg-white/5'
                }`}
              >
                {item.title}
                {location.pathname === item.path && (
                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Custom Hamburger Button for mobile */}
        <div className="flex h-8 w-8 cursor-pointer flex-col items-center justify-center gap-[5px] sm:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          <span className={`block h-[1.5px] w-5 bg-white transition-all duration-300 ${mobileOpen ? 'translate-y-[6.5px] rotate-45' : ''}`} />
          <span className={`block h-[1.5px] w-5 bg-white transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-[1.5px] w-5 bg-white transition-all duration-300 ${mobileOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
        </div>
      </div>

      {/* Mobile dropdown */}
      <div className={`overflow-hidden transition-all duration-300 sm:hidden ${mobileOpen ? 'max-h-60' : 'max-h-0'}`} style={{ background: 'rgba(5, 5, 5, 0.95)' }}>
        <ul className="flex flex-col gap-4 px-6 pb-6 pt-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <Link
                to={item.path}
                className={`block text-[15px] font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-white'
                    : 'text-[#888] hover:text-white'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
