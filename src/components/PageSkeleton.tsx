"use client";

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200/60 p-4 sm:p-6 lg:p-8 animate-pulse">
      <div className="h-6 sm:h-7 bg-slate-200 rounded w-1/3 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 sm:h-20 bg-slate-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function BalanceCardSkeleton() {
  return (
    <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200/60 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-24" />
          <div className="h-8 sm:h-9 bg-slate-200 rounded w-28" />
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}

export function MemberPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
      <div className="text-center">
        <div className="h-8 sm:h-9 bg-slate-200 rounded w-3/4 mx-auto mb-2 animate-pulse" />
        <div className="h-5 bg-slate-100 rounded w-2/3 mx-auto animate-pulse" />
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200/60 p-4 sm:p-6 lg:p-8 animate-pulse">
        <div className="flex justify-between mb-6">
          <div className="h-7 bg-slate-200 rounded w-40" />
          <div className="h-10 bg-slate-200 rounded-xl w-40" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <BalanceCardSkeleton />
        <BalanceCardSkeleton />
        <BalanceCardSkeleton />
      </div>

      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

export function AdminPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 space-y-6 sm:space-y-8">
      <div className="text-center">
        <div className="h-8 sm:h-9 bg-slate-200 rounded w-3/4 mx-auto mb-2 animate-pulse" />
        <div className="h-5 bg-slate-100 rounded w-2/3 mx-auto animate-pulse" />
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200/60 p-4 sm:p-6 lg:p-8 animate-pulse">
        <div className="flex justify-between mb-6">
          <div className="h-7 bg-slate-200 rounded w-44" />
          <div className="h-10 bg-slate-200 rounded-xl w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <BalanceCardSkeleton />
          <BalanceCardSkeleton />
          <BalanceCardSkeleton />
        </div>
      </div>

      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
