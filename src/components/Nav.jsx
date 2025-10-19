import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-white/20 text-white shadow' : 'text-white/90 hover:bg-white/10'}`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Nav({ minimal = false }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <NavLink to="/dashboard" className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-3 flex items-center justify-center" style={{ width: 48, height: 48 }}>
                <span className="text-xl">🍽️</span>
              </div>
              <span className="text-white text-lg font-extrabold">Eatventory</span>
            </NavLink>
          </div>

          {/* Mobile menu button */}
          {!minimal && (
            <div className="flex items-center gap-2 md:hidden">
              <button onClick={() => setOpen(!open)} className="p-2 rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
              </button>
            </div>
          )}

          {/* Centered nav links */}
          <div className="flex-1 flex justify-center">
            {!minimal && (
              <nav className="hidden md:flex items-center space-x-4">
              {/* Dashboard link */}
              <NavLink to="/dashboard" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white/25 text-white shadow' : 'text-white/90 hover:bg-white/10'}`}>
                Dashboard
              </NavLink>
              {/* make Item look like a pill-button so it's more visible */}
              <NavLink to="/items" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white/25 text-white shadow' : 'text-white/90 hover:bg-white/10'}`}>
                Item
              </NavLink>
              <NavLink to="/sales" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white/25 text-white shadow' : 'text-white/90 hover:bg-white/10'}`}>
                Sales
              </NavLink>
              </nav>
              )}
          </div>

          {/* Right spacer for symmetry - reserved for future actions */}
          <div className="w-24 hidden sm:block" />
        </div>
      </div>

      {/* Mobile menu */}
      {!minimal && open && (
        <div className="md:hidden bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 px-4 pt-2 pb-4">
          <div className="space-y-1">
            <NavLink to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-white">Dashboard</NavLink>
            <NavLink to="/items" className="block px-3 py-2 rounded-md text-base font-medium text-white">Item</NavLink>
            <NavLink to="/sales" className="block px-3 py-2 rounded-md text-base font-medium text-white">Sales</NavLink>
          </div>
        </div>
      )}
    </header>
  )
}
