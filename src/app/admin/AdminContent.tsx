"use client";
import { useEffect, useState } from "react";
import ExcelJS from 'exceljs';

type Receipt = {
  id: number;
  name: string;
  rhNo: string;
  amount: string;
  description?: string | null;
  screenshotPath?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  date?: string;
};

export default function AdminPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [expenses, setExpenses] = useState<{
    id: number;
    name: string;
    amount: string;
    description?: string | null;
    chequeNo?: string | null;
    date?: string | null;
    createdAt: string;
    attachmentPath?: string | null;
  }[]>([]);
  const [balances, setBalances] = useState<{
    received: number;
    expense: number;
    total: number;
    adjustments?: { received: number; expense: number };
  } | null>(null);
  const [isEditingBalances, setIsEditingBalances] = useState(false);
  const [editedReceived, setEditedReceived] = useState<string>("0");
  const [editedExpense, setEditedExpense] = useState<string>("0");
  const [filterRh, setFilterRh] = useState("");
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  async function loadAll() {
    const [r, e, b] = await Promise.all([
      fetch("/api/receipts").then((r) => r.json()),
      fetch("/api/expenses").then((r) => r.json()),
      fetch("/api/balances").then((r) => r.json()),
    ]);
    setReceipts(r);
    setExpenses(e);
    setBalances(b);
    setEditedReceived(String(b?.received ?? 0));
    setEditedExpense(String(b?.expense ?? 0));
  }
  useEffect(() => {
    loadAll();
  }, []);

  async function approve(id: number) {
    await fetch(`/api/receipts/${id}/approve`, { method: "POST" });
    await loadAll();
  }
  async function reject(id: number) {
    await fetch(`/api/receipts/${id}/reject`, { method: "POST" });
    await loadAll();
  }

  async function saveBalanceEdits() {
    const approvedReceivedBase = receipts
      .filter((r) => r.status === "APPROVED")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const expensesBase = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const targetReceived = Number(editedReceived || 0);
    const targetExpense = Number(editedExpense || 0);

    const receivedAdjustment = targetReceived - approvedReceivedBase;
    const expenseAdjustment = targetExpense - expensesBase;

    await fetch("/api/balances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receivedAdjustment, expenseAdjustment }),
    });
    setIsEditingBalances(false);
    await loadAll();
  }

  async function submitExpense(fd: FormData) {
    await fetch("/api/expenses", { method: "POST", body: fd });
    await loadAll();
    setShowExpenseForm(false);
  }

  // Export functions
  async function exportReceiptsToExcel() {
    const exportData = receipts.map(r => ({
      'Name': r.name,
      'RH Number': r.rhNo,
      'Amount (₹)': Number(r.amount || 0).toFixed(2),
      'Description': r.description || '',
      'Status': r.status,
      'Date': r.date ? new Date(r.date).toLocaleDateString('en-IN') : '',
      'Created At': new Date(r.createdAt).toLocaleDateString('en-IN'),
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Receipts');
    
    // Add headers
    const headers = Object.keys(exportData[0] || {});
    worksheet.addRow(headers);
    
    // Add data
    exportData.forEach(row => {
      worksheet.addRow(Object.values(row));
    });
    
    // Auto-size columns
    worksheet.columns.forEach(column => {
      column.width = 20;
    });

    // Generate and download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tulsi_Villa_Receipts_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async function exportExpensesToExcel() {
    const exportData = expenses.map(x => ({
      'Name': x.name,
      'Amount (₹)': Number(x.amount || 0).toFixed(2),
      'Description': x.description || '',
      'Cheque Number': x.chequeNo || '',
      'Date': x.date ? new Date(x.date).toLocaleDateString('en-IN') : '',
      'Created At': new Date(x.createdAt).toLocaleDateString('en-IN'),
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expenses');
    
    // Add headers
    const headers = Object.keys(exportData[0] || {});
    worksheet.addRow(headers);
    
    // Add data
    exportData.forEach(row => {
      worksheet.addRow(Object.values(row));
    });
    
    // Auto-size columns
    worksheet.columns.forEach(column => {
      column.width = 20;
    });

    // Generate and download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tulsi_Villa_Expenses_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Tulsi Villa Admin Dashboard</h1>
        <p className="text-slate-600 text-lg">Manage receipts, expenses, and financial balances</p>
      </div>

      {/* Balances Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Financial Balances</h2>
          {!isEditingBalances ? (
            <button 
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              onClick={() => setIsEditingBalances(true)}
            >
              Edit Balances
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                onClick={saveBalanceEdits}
              >
                Save Changes
              </button>
              <button 
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-200"
                onClick={() => {
                  setIsEditingBalances(false);
                  setEditedReceived(String(balances?.received ?? 0));
                  setEditedExpense(String(balances?.expense ?? 0));
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {balances ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Received</p>
                  {!isEditingBalances ? (
                    <p className="text-3xl font-bold text-green-900">₹{balances.received.toFixed(2)}</p>
                  ) : (
                    <input
                      className="text-3xl font-bold text-green-900 bg-transparent border-b-2 border-green-300 focus:border-green-500 outline-none w-full"
                      type="number"
                      step="0.01"
                      value={editedReceived}
                      onChange={(e) => setEditedReceived(e.target.value)}
                    />
                  )}
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border border-red-200/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Total Expenses</p>
                  {!isEditingBalances ? (
                    <p className="text-3xl font-bold text-red-900">₹{balances.expense.toFixed(2)}</p>
                  ) : (
                    <input
                      className="text-3xl font-bold text-red-900 bg-transparent border-b-2 border-red-300 focus:border-red-500 outline-none w-full"
                      type="number"
                      step="0.01"
                      value={editedExpense}
                      onChange={(e) => setEditedExpense(e.target.value)}
                    />
                  )}
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Net Balance</p>
                  <p className={`text-3xl font-bold ${balances.total >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                    ₹{balances.total.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Pending Receipts Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Pending Receipts</h2>
        <div className="space-y-4">
          {receipts
            .filter((r) => r.status === "PENDING")
            .map((r) => (
              <div key={r.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200/60 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="font-semibold text-slate-900 text-lg">{r.name}</div>
                      <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">RH: {r.rhNo}</div>
                      <div className="text-2xl font-bold text-green-600">₹{Number(r.amount).toFixed(2)}</div>
                    </div>
                    {r.date && (
                      <div className="text-sm text-slate-500 mb-2">
                        {new Date(r.date).toLocaleDateString('en-IN', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    )}
                    {r.description && (
                      <div className="text-slate-600 mb-3">{r.description}</div>
                    )}
                    {r.screenshotPath && (
                      <a 
                        className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 font-medium text-sm" 
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
                  <div className="flex gap-3 ml-6">
                    <button 
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      onClick={() => approve(r.id)}
                    >
                      Approve
                    </button>
                    <button 
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      onClick={() => reject(r.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          {receipts.filter((r) => r.status === "PENDING").length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-500 text-lg">No pending receipts</p>
              <p className="text-slate-400 text-sm">All receipts have been processed</p>
            </div>
          )}
        </div>
      </div>

      {/* Received Log Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Receipt History</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                value={filterRh}
                onChange={(e) => setFilterRh(e.target.value)}
                placeholder="Filter by RH Number..."
                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-slate-900 placeholder-slate-500 w-64"
              />
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={exportReceiptsToExcel}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to Excel
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {receipts
            .filter((r) => (filterRh ? r.rhNo.toLowerCase().includes(filterRh.toLowerCase()) : true))
            .map((r) => (
              <div key={r.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-semibold text-slate-900 text-lg">{r.name}</div>
                      <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">RH: {r.rhNo}</div>
                      <div className="text-2xl font-bold text-green-600">₹{Number(r.amount).toFixed(2)}</div>
                    </div>
                    {r.date && (
                      <div className="text-sm text-slate-500 mb-2">
                        {new Date(r.date).toLocaleDateString('en-IN', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    )}
                    {r.description && (
                      <div className="text-slate-600 mb-3">{r.description}</div>
                    )}
                    {r.screenshotPath && (
                      <a 
                        className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 font-medium text-sm" 
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
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
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
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <p className="text-slate-500 text-lg">No receipts yet</p>
              <p className="text-slate-400 text-sm">Receipts will appear here when submitted by members</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Add New Expense</h2>
          <button
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              showExpenseForm 
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
            onClick={() => setShowExpenseForm((s) => !s)}
          >
            {showExpenseForm ? 'Cancel' : 'Add New Expense'}
          </button>
        </div>

        {showExpenseForm && (
          <form
            className="space-y-6"
            action={async (fd) => {
              await submitExpense(fd);
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Expense Name</label>
                <input 
                  name="name" 
                  placeholder="Enter expense name" 
                  required 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cheque Number</label>
                <input 
                  name="chequeNo" 
                  placeholder="Enter cheque number (optional)" 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                <input 
                  name="date" 
                  type="date" 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea 
                name="description" 
                placeholder="Describe the expense..." 
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Receipt/Invoice</label>
              <input 
                name="upload" 
                type="file" 
                accept="image/*,.pdf" 
                required 
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
              />
            </div>
            <div className="flex justify-end">
              <button 
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Save Expense
              </button>
            </div>
          </form>
        )}
      </div>

      {/* All Expenses Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">All Expenses</h2>
          <button
            onClick={exportExpensesToExcel}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export to Excel
          </button>
        </div>
        <div className="space-y-4">
          {expenses.map((x) => (
            <div key={x.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 text-lg">{x.name}</div>
                  <div className="text-2xl font-bold text-red-600">₹{Number(x.amount).toFixed(2)}</div>
                  {x.description && (
                    <div className="text-slate-600 mt-2">{x.description}</div>
                  )}
                  {x.attachmentPath && (
                    <a 
                      className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 font-medium text-sm mt-3" 
                      href={`/preview?src=${encodeURIComponent(x.attachmentPath)}`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Attachment
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          {expenses.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-slate-500 text-lg">No expenses recorded yet</p>
              <p className="text-slate-400 text-sm">Add your first expense using the form above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


