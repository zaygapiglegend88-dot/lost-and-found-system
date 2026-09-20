import React from 'react';
import { Shield, Mail, Phone, Clock, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="app-footer" className="mt-auto border-t border-slate-100 dark:border-slate-800 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Campus <span className="text-blue-400">SafeReturn</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              The official centralized platform for returning lost items to their rightful owners at the University Campus.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center"><MapPin className="h-3.5 w-3.5 text-blue-400 mr-1.5" /> Student Union, Room 104</span>
              <span className="flex items-center"><Clock className="h-3.5 w-3.5 text-blue-400 mr-1.5" /> Mon - Fri, 8AM - 5PM</span>
            </div>
          </div>

          {/* Quick Support Info */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Campus Resources</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="#rules" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-white transition-colors">
                  Lost & Found Policies
                </a>
              </li>
              <li>
                <a href="#union" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-white transition-colors">
                  Student Union Services
                </a>
              </li>
              <li>
                <a href="#security" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-white transition-colors">
                  Campus Public Safety
                </a>
              </li>
              <li>
                <a href="#faq" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-white transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Get Support</h3>
            <div className="mt-4 space-y-3 text-sm">
              <p className="flex items-center text-slate-400">
                <Mail className="h-4 w-4 text-blue-400 mr-2" />
                <a href="mailto:support-lostfound@university.edu" className="hover:text-white transition-colors">
                  lostfound@university.edu
                </a>
              </p>
              <p className="flex items-center text-slate-400">
                <Phone className="h-4 w-4 text-blue-400 mr-2" />
                <span className="hover:text-white transition-colors">+1 (555) 019-2000</span>
              </p>
              <div className="mt-4 rounded-lg bg-slate-800 p-3 border border-slate-700/50">
                <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-widest">Immediate Help?</p>
                <p className="text-xs text-slate-300 mt-1">Visit our walk-in desk or contact Security Dispatch after hours.</p>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 University Central Administration. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-slate-300 transition-colors">Terms of Use</a>
            <a href="#accessibility" onClick={(e) => e.preventDefault()} className="hover:text-slate-300 transition-colors">Accessibility Statement</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
