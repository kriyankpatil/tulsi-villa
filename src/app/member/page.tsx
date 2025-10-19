"use client";
import { useEffect, useState } from "react";

type Receipt = {
  id: number;
  name: string;
  rhNo: string;
  amount: string | number;
  description?: string | null;
  screenshotPath?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  date?: string;
};

type Balances = {
  received: number;
  expense: number;
  total: number;
  adjustments: { received: number; expense: number };
};

type Expense = {
  id: number;
  name: string;
  amount: string | number;
  description?: string | null;
  chequeNo?: string | null;
  date?: string | null;
  createdAt: string;
  attachmentPath?: string | null;
};

export default function MemberPage() {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [balances, setBalances] = useState<Balances | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    const load = async () => {
      async function safeJson<T>(input: Promise<Response>, fallback: T): Promise<T> {
        try {
          const res = await input;
          if (!res.ok) return fallback;
          const text = await res.text();
          if (!text) return fallback;
          return JSON.parse(text) as T;
        } catch {
          return fallback;
        }
      }

      const b = await safeJson<Balances | null>(fetch("/api/balances"), null);
      setBalances(b);
      const e = await safeJson<Expense[]>(fetch("/api/expenses"), []);
      setExpenses(e);
      const r = await safeJson<Receipt[]>(fetch("/api/receipts?scope=me"), []);
      setReceipts(r);
    };
    load();
  }, []);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/receipts", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to submit");
      setShowForm(false);
      alert("Submitted. Awaiting approval.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Welcome to Tulsi Villa</h1>
        <p className="text-slate-600 text-base sm:text-lg">Manage your receipts and track expenses</p>
      </div>

      {/* Submit Receipt Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200/60 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Submit Receipt</h2>
          <button
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base ${
              showForm 
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
            onClick={() => setShowForm((s) => !s)}
          >
            {showForm ? 'Cancel' : 'Submit New Receipt'}
          </button>
        </div>

        {showForm && (
          <form
            className="space-y-4 sm:space-y-6"
            action={async (fd) => {
              await handleSubmit(fd);
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input 
                  name="name" 
                  placeholder="Enter your full name" 
                  required 
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-slate-900 placeholder-slate-500 text-sm sm:text-base" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">RH Number</label>
                <input 
                  name="rhNo" 
                  placeholder="Enter RH number" 
                  required 
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-slate-900 placeholder-slate-500 text-sm sm:text-base" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Amount (₹)</label>
                <input
                  name="amount"
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-slate-900 placeholder-slate-500 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                <input 
                  name="date" 
                  type="date" 
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-slate-900 text-sm sm:text-base" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea 
                name="description" 
                placeholder="Describe the receipt purpose..." 
                rows={3}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none bg-white text-slate-900 placeholder-slate-500 text-sm sm:text-base" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Payment Screenshot</label>
              <input 
                name="upload" 
                type="file" 
                accept="image/*" 
                required 
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-sm sm:text-base" 
              />
            </div>
            <div className="flex justify-end">
              <button 
                disabled={submitting} 
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Receipt'
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Balances Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {balances ? (
          <>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-200/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-green-600">Total Received</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-900">₹{balances.received.toFixed(2)}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-red-200/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-red-600">Total Expenses</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-900">₹{balances.expense.toFixed(2)}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200/60 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-blue-600">Net Balance</p>
                  <p className={`text-2xl sm:text-3xl font-bold ${balances.total >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                    ₹{balances.total.toFixed(2)}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Expense Log Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200/60 p-4 sm:p-6 lg:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Expense Log</h2>
        <div className="h-80 overflow-y-scroll space-y-3 sm:space-y-4 pr-2 scrollable-section" style={{scrollbarWidth: 'thin', scrollbarGutter: 'stable'}}>
          {expenses.map((x: Expense) => (
            <div key={x.id} className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200/60 hover:shadow-md transition-all duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 text-base sm:text-lg">{x.name}</div>
                  <div className="text-xl sm:text-2xl font-bold text-red-600">₹{Number(x.amount).toFixed(2)}</div>
                  {x.date && (
                    <div className="text-xs sm:text-sm text-slate-500 mt-1">
                      {new Date(x.date).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  )}
                  {x.description && (
                    <div className="text-slate-600 mt-2 text-sm sm:text-base">{x.description}</div>
                  )}
                </div>
                {x.attachmentPath && (
                  <a 
                    className="px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 font-medium text-xs sm:text-sm text-center sm:text-left" 
                    href={`/preview?src=${encodeURIComponent(x.attachmentPath)}`}
                  >
                    View Receipt
                  </a>
                )}
              </div>
            </div>
          ))}
          {expenses.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-slate-500 text-base sm:text-lg">No expenses recorded yet</p>
              <p className="text-slate-400 text-sm">Expenses will appear here when added by admin</p>
            </div>
          )}
        </div>
      </div>

      {/* Received Log Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200/60 p-4 sm:p-6 lg:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Your Receipts</h2>
        <div className="h-80 overflow-y-scroll space-y-3 sm:space-y-4 pr-2 scrollable-section" style={{scrollbarWidth: 'thin', scrollbarGutter: 'stable'}}>
          {receipts.map((r) => (
            <div key={r.id} className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200/60 hover:shadow-md transition-all duration-200">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <div className="font-semibold text-slate-900 text-base sm:text-lg">{r.name}</div>
                    <div className="text-xs sm:text-sm text-slate-500">({r.rhNo})</div>
                    <div className="text-xl sm:text-2xl font-bold text-green-600">₹{Number(r.amount).toFixed(2)}</div>
                  </div>
                  {r.date && (
                    <div className="text-xs sm:text-sm text-slate-500 mb-2">
                      {new Date(r.date).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  )}
                  {r.description && (
                    <div className="text-slate-600 mb-3 text-sm sm:text-base">{r.description}</div>
                  )}
                  {r.screenshotPath && (
                    <a 
                      className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 font-medium text-xs sm:text-sm" 
                      href={`/preview?src=${encodeURIComponent(r.screenshotPath)}`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Screenshot
                    </a>
                  )}
                </div>
                <span
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto ${
                    r.status === "APPROVED"
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : r.status === "REJECTED"
                      ? "bg-red-100 text-red-800 border border-red-200"
                      : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            </div>
          ))}
          {receipts.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <p className="text-slate-500 text-base sm:text-lg">No receipts submitted yet</p>
              <p className="text-slate-400 text-sm">Submit your first receipt using the form above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


