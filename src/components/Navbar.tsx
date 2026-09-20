import React from 'react';
import { Search, PlusCircle, Shield, User, LogOut, Bell, HelpCircle, Sun, Moon } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  currentUser: UserType | null;
  currentTab: 'home' | 'browse' | 'dashboard' | 'admin';
  setCurrentTab: (tab: 'home' | 'browse' | 'dashboard' | 'admin') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenReport: (type: 'lost' | 'found') => void;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

export default function Navbar({
  currentUser,
  currentTab,
  setCurrentTab,
  onOpenAuth,
  onLogout,
  onOpenReport,
  theme = 'light',
  toggleTheme,
}: NavbarProps) {
  return (
    <header id="app-header" className="sticky top-0 z-50 w-full border-b border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand logo */}
        <div 
          id="navbar-brand"
          className="flex cursor-pointer items-center space-x-2" 
          onClick={() => setCurrentTab('home')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-lg font-bold tracking-tight text-blue-900 dark:text-blue-100 sm:text-xl">
              Campus <span className="text-blue-600 dark:text-blue-400">SafeReturn</span>
            </span>
            <span className="block -mt-1 text-[10px] font-medium tracking-widest text-slate-400 dark:text-slate-500 uppercase">
              Lost & Found Portal
            </span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav id="navbar-links" className="hidden md:flex items-center space-x-1">
          <button
            id="nav-link-home"
            onClick={() => setCurrentTab('home')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              currentTab === 'home'
                ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Home
          </button>
          
          <button
            id="nav-link-browse"
            onClick={() => setCurrentTab('browse')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              currentTab === 'browse'
                ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Browse Listings
          </button>

          {currentUser && (
            <button
              id="nav-link-dashboard"
              onClick={() => setCurrentTab('dashboard')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              My Dashboard
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button
              id="nav-link-admin"
              onClick={() => setCurrentTab('admin')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                currentTab === 'admin'
                  ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Admin Controls
            </button>
          )}
        </nav>

        {/* Right: Theme Toggle, Auth & Report Actions */}
        <div id="navbar-actions" className="flex items-center space-x-2.5">

          {/* Theme Toggle Button */}
          {toggleTheme && (
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600" />
              )}
            </button>
          )}

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            {currentUser ? (
              <>
                <div className="flex items-center space-x-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 bg-slate-50 dark:bg-slate-800">
                  <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 leading-none">{currentUser.name}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 capitalize">{currentUser.role === 'admin' ? 'Primary Admin' : 'Normal User'}</p>
                  </div>
                </div>
                
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="flex md:hidden items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2">
        <div className="flex space-x-2">
          <button 
            onClick={() => setCurrentTab('home')}
            className={`text-xs font-medium px-2 py-1 rounded ${currentTab === 'home' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
          >
            Home
          </button>
          <button 
            onClick={() => setCurrentTab('browse')}
            className={`text-xs font-medium px-2 py-1 rounded ${currentTab === 'browse' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
          >
            Browse
          </button>
          {currentUser && (
            <button 
              onClick={() => setCurrentTab('dashboard')}
              className={`text-xs font-medium px-2 py-1 rounded ${currentTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
            >
              Dashboard
            </button>
          )}
          {currentUser?.role === 'admin' && (
            <button 
              onClick={() => setCurrentTab('admin')}
              className={`text-xs font-medium px-2 py-1 rounded ${currentTab === 'admin' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
            >
              Admin
            </button>
          )}
        </div>
        {toggleTheme && (
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-300 bg-slate-200 dark:bg-slate-800"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>
        )}
      </div>
    </header>
  );
}
