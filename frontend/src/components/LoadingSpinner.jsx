import React from 'react';
import { BookOpen } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading catalog...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-brand-500 animate-spin" />
        <BookOpen className="w-6 h-6 text-brand-400 absolute" />
      </div>
      <p className="mt-4 text-xs font-medium text-slate-400 tracking-wide uppercase">{message}</p>
    </div>
  );
}
