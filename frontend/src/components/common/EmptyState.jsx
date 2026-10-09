import React from 'react';
import { BookOpen } from 'lucide-react';

export default function EmptyState({
  title = 'No Records Found',
  message = 'No relevant Ayurvedic information is currently documented for this query.',
  icon: Icon = BookOpen,
  action,
}) {
  return (
    <div className="glass-card rounded-xl p-8 text-center max-w-md mx-auto my-6 border-slate-800">
      <div className="w-12 h-12 rounded-full bg-slate-800/80 text-amber-400 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-slate-400 text-xs md:text-sm mb-4 leading-relaxed">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
