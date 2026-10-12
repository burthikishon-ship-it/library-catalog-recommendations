import React from 'react';
import { BookX, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title = 'No books found',
  description = 'Try changing your search terms or adjusting the active filters.',
  actionText = 'Browse All Books',
  actionLink = '/catalog',
  onAction,
}) {
  return (
    <div className="glass-panel rounded-3xl p-10 text-center max-w-md mx-auto my-12 border border-slate-800">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500 mb-4 shadow-inner">
        <BookX className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-slate-400 mb-6 leading-relaxed">{description}</p>
      {onAction ? (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/30 hover:bg-brand-500 hover:text-slate-950 font-semibold text-xs transition-all"
        >
          {actionText}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ) : actionLink ? (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/30 hover:bg-brand-500 hover:text-slate-950 font-semibold text-xs transition-all"
        >
          {actionText}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      ) : null}
    </div>
  );
}
