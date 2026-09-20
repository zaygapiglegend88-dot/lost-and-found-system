import React, { useState } from 'react';
import { Search, MapPin, CheckCircle2, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { ItemCategory } from '../types';

interface HeroSectionProps {
  onOpenReport: (type: 'lost' | 'found') => void;
  onSearch: (query: string, category: string) => void;
  totalActiveItemsCount: number;
}

export default function HeroSection({
  onOpenReport,
  onSearch,
  totalActiveItemsCount,
}: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<string>('All');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, searchCategory);
  };

  const categories: (ItemCategory | 'All')[] = ['All', 'Electronics', 'Documents', 'Keys', 'Clothing', 'Other'];

  return (
    <section id="hero-section" className="relative overflow-hidden bg-gradient-to-br from-blue-50/60 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 py-12 md:py-20 border-b border-blue-50 dark:border-slate-800 transition-colors">
      
      {/* Visual background details */}
      <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-blue-100/20 dark:bg-blue-900/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Block: Headline, CTAs, Search */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Trust badge */}
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/80 px-3 py-1 text-xs font-semibold text-blue-800 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/50">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
              <span>University Central Lost & Found Portal</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl lg:text-6xl leading-tight">
              Reuniting Your <br />
              <span className="text-blue-600 dark:text-blue-400">Lost Valuables</span> with You
            </h1>

            <p className="text-base text-slate-600 dark:text-slate-300 sm:text-lg max-w-xl leading-relaxed">
              Lost something on campus? Or found someone else's item? Report it instantly on our central, secure registry and help build a safer, more supportive university community.
            </p>

            {/* Core Action CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                id="cta-report-lost"
                onClick={() => onOpenReport('lost')}
                className="group inline-flex items-center justify-center space-x-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 hover:shadow-xl hover:translate-y-[-1px] transition-all"
              >
                <AlertCircle className="h-5 w-5 text-blue-100 group-hover:rotate-12 transition-transform" />
                <span>Report Lost Item</span>
              </button>
              
              <button
                id="cta-report-found"
                onClick={() => onOpenReport('found')}
                className="group inline-flex items-center justify-center space-x-2 rounded-xl border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-900 px-6 py-3.5 text-sm font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-700 transition-all"
              >
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <span>Report Found Item</span>
              </button>
            </div>

            {/* Quick Search Bar */}
            <div className="pt-6 max-w-2xl">
              <form 
                onSubmit={handleSearchSubmit}
                className="flex flex-col sm:flex-row items-stretch rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-md focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent transition-all"
              >
                {/* Text query */}
                <div className="relative flex-1">
                  <Search className="absolute top-3 left-3 h-5 w-5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for keys, phones, notebooks..."
                    className="w-full rounded-lg py-2.5 pr-4 pl-10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent focus:outline-none"
                  />
                </div>

                {/* Category selector */}
                <div className="border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 px-2 py-2 sm:py-0 flex items-center bg-slate-50/50 dark:bg-slate-900 sm:bg-white dark:sm:bg-slate-900">
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer py-1 px-2"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                        {cat === 'All' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search CTA */}
                <button
                  type="submit"
                  className="mt-2 sm:mt-0 rounded-xl bg-slate-900 dark:bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </form>
              
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <span className="flex items-center">
                  <MapPin className="h-3.5 w-3.5 text-blue-500 mr-1" />
                  Central Desk Location: Student Union Lobby
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/40">
                  {totalActiveItemsCount} active listings listed
                </span>
              </div>
            </div>

          </div>

          {/* Right Block: Image graphic */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-none">
              
              {/* Outer decorative ring */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 opacity-20 blur-lg" />
              
              {/* Image Frame */}
              <div className="relative overflow-hidden rounded-2xl border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
                <img
                  src="/src/assets/images/campus_lost_and_found_hero_1784479425650.jpg"
                  alt="Campus Lost and Found Center illustration"
                  referrerPolicy="no-referrer"
                  className="h-auto w-full object-cover"
                />
                
                {/* Interactive stats tag overlay */}
                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-blue-50/20 bg-slate-900/95 backdrop-blur-sm p-4 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">Trust Registry</p>
                      <p className="text-sm font-bold text-white">92% Return Rate this semester</p>
                    </div>
                    <div className="rounded-lg bg-blue-600 px-2.5 py-1 text-center">
                      <p className="text-[10px] font-bold uppercase leading-none">Security</p>
                      <p className="text-xs font-extrabold mt-0.5">Verified</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Little floating detail */}
              <div className="absolute -top-4 -left-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-lg hidden sm:flex items-center space-x-2">
                <div className="rounded-full bg-emerald-100 dark:bg-emerald-950 p-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase leading-none">Returned Just Now</p>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Space Grey MacBook Pro</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
