import React from 'react';

export function LoadingSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col gap-6 animate-pulse">
        <div className="h-24 bg-white rounded-xl border border-slate-200 p-6 shadow-sm"></div>
        <div className="h-64 bg-white rounded-xl border border-slate-200 shadow-sm"></div>
        <div className="h-64 bg-white rounded-xl border border-slate-200 shadow-sm"></div>
    </div>
  );
}
