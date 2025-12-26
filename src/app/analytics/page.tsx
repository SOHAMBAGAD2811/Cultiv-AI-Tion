"use client";

import React, { useState, useMemo, useEffect, useCallback, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, TrendingUp, Plus, TrendingDown, Minus, Wallet, Loader2, Save, AlertCircle, RefreshCw, Lightbulb, Sparkles, Trash2, Edit2, Check, X, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { createClient } from '../utils/supabase';
import { fetchAIInsights } from '../lib/analytics-utils';
import '../i18n';

interface InventoryItem {
  id: string;
  crop: string;
  quantity: number;
  unit: string;
  date: string;
}

interface SaleRecord {
  id: string;
  crop: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalSale: number;
  date: string;
}

interface ExpenseRecord {
  id: string;
  category: string;
  amount: number;
  date: string;
}

interface AnalyticsData {
  inventory: InventoryItem[];
  sales: SaleRecord[];
  expenses: ExpenseRecord[];
}

interface AIInsight {
  summary: string;
  recommendations: string[];
  concerns: string;
  profitMargin: number;
  healthStatus: 'good' | 'warning' | 'critical';
}

const BUCKET_NAME = 'analytics-data';

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [supabase] = useState(() => createClient());
  const router = useRouter();

  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('analytics');
  const [user, setUser] = useState<User | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('all');
  const [isResetting, setIsResetting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ crop: '', quantity: 0, unit: '' });
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [editSaleFormData, setEditSaleFormData] = useState({ crop: '', quantity: 0, unit: '', price: 0, date: '' });
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editExpenseFormData, setEditExpenseFormData] = useState({ category: '', amount: 0, date: '' });

  // --- Mock Data & State ---
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // --- State for new entries ---
  const [newCrop, setNewCrop] = useState({ name: '', quantity: '', unit: 'tons', date: today });
  const [newSale, setNewSale] = useState({ cropId: '', quantity: '', unit: '', price: '', date: today });
  const [newExpense, setNewExpense] = useState({ category: 'Fertilizer', amount: '', date: today });

  const getFilePath = (userId: string) => `${userId}.json`;

  // --- Data Persistence Logic ---
  const saveData = useCallback(async () => {
    if (!user || initialLoading) return;
    setIsSaving(true);
    setError(null);

    const filePath = getFilePath(user.id);
    const dataToSave: AnalyticsData = { inventory, sales, expenses };

    try {
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, JSON.stringify(dataToSave), {
          cacheControl: '3600',
          upsert: true, // Overwrite if exists
        });

      if (uploadError) throw uploadError;
      setLastSaved(new Date());
    } catch (err) {
      const e = err as Error;
      setError(`Failed to save data: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [user, inventory, sales, expenses, initialLoading, supabase.storage]);

  // --- Initial Data Load ---
  useEffect(() => {
    const loadData = async (currentUser: User) => {
      try {
        const filePath = getFilePath(currentUser.id);
        const { data, error: downloadError } = await supabase.storage
          .from(BUCKET_NAME)
          .download(filePath);

        if (downloadError) {
          if (downloadError.message.includes('not found')) {
            // This is fine, it's a new user.
            return;
          }
          throw downloadError;
        }

        if (data) {
          const savedData: AnalyticsData = JSON.parse(await data.text());
          setInventory(savedData.inventory || []);
          setSales(savedData.sales || []);
          setExpenses(savedData.expenses || []);
        }
      } catch (err) {
        const e = err as Error;
        setError(`Failed to load data: ${e.message}`);
      } finally {
        setInitialLoading(false);
      }
    };

    const checkUserAndLoadData = async () => {
      const { getSessionSafe } = await import('../utils/auth');
      const session = await getSessionSafe(supabase);
      if (!session) {
        router.push('/signin');
      } else {
        setUser(session.user);
        await loadData(session.user);
      }
    };

    checkUserAndLoadData();
  }, [router, supabase.auth, supabase.storage]);

  // --- Auto-save on data change ---
  useEffect(() => {
    if (initialLoading) return;

    const handler = setTimeout(() => {
      saveData();
    }, 2000); // Debounce saving

    return () => {
      clearTimeout(handler);
    };
  }, [inventory, sales, expenses, initialLoading, saveData]);

  const handleAddCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCrop.name && newCrop.quantity) {
      const newItem: InventoryItem = {
        id: `inv${Date.now()}`,
        crop: newCrop.name,
        quantity: parseFloat(newCrop.quantity),
        unit: newCrop.unit,
        date: newCrop.date,
      };
      setInventory([...inventory, newItem]);
      setNewCrop({ name: '', quantity: '', unit: 'tons', date: today }); // Reset form
    }
  };


  const handleLogSale = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCrop = inventory.find(item => item.id === newSale.cropId);
    if (selectedCrop && newSale.quantity && newSale.price) {
      const saleQuantity = parseFloat(newSale.quantity);
      const pricePerUnit = parseFloat(newSale.price);
      const saleUnit = newSale.unit || selectedCrop.unit;

      // Add to sales record
      const saleRecord: SaleRecord = {
        id: `sale${Date.now()}`,
        crop: selectedCrop.crop,
        quantity: saleQuantity,
        unit: saleUnit,
        pricePerUnit: pricePerUnit,
        totalSale: saleQuantity * pricePerUnit,
        date: newSale.date,
      };
      setSales([...sales, saleRecord]);

      // Calculate deduction based on unit conversion
      let deductionQuantity = saleQuantity;
      if (saleUnit === 'kg' && selectedCrop.unit === 'tons') deductionQuantity = saleQuantity / 1000;
      else if (saleUnit === 'tons' && selectedCrop.unit === 'kg') deductionQuantity = saleQuantity * 1000;
      // For other combinations, assume 1:1 or incompatible (deduct as is)

      // Update inventory
      setInventory(inventory.map(item =>
        item.id === newSale.cropId
          ? { ...item, quantity: Math.max(0, item.quantity - deductionQuantity) }
          : item
      ));

      setNewSale({ cropId: '', quantity: '', unit: '', price: '', date: today }); // Reset form
    }
  };

  const handleLogExpense = (e: React.FormEvent) => { // Removed duplicate function
    e.preventDefault();
    if (newExpense.category && newExpense.amount) {
      const expenseRecord: ExpenseRecord = {
        id: `exp${Date.now()}`,
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date,
      };
      setExpenses([...expenses, expenseRecord]);
      setNewExpense({ category: 'Fertilizer', amount: '', date: today }); // Reset form
    }
  };

  const handleDeleteInventoryItem = (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setInventory(inventory.filter(item => item.id !== id));
    }
  };

  const handleDeleteSale = (id: string) => {
    if (window.confirm("Are you sure you want to delete this sale record?")) {
      setSales(sales.filter(item => item.id !== id));
    }
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm("Are you sure you want to delete this expense record?")) {
      setExpenses(expenses.filter(item => item.id !== id));
    }
  };

  const startEditing = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditFormData({ crop: item.crop, quantity: item.quantity, unit: item.unit });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEditing = () => {
    if (!editingId) return;
    setInventory(inventory.map(item => 
      item.id === editingId 
        ? { ...item, crop: editFormData.crop, quantity: editFormData.quantity, unit: editFormData.unit }
        : item
    ));
    setEditingId(null);
  };

  const startEditingSale = (sale: SaleRecord) => {
    setEditingSaleId(sale.id);
    setEditSaleFormData({ crop: sale.crop, quantity: sale.quantity, unit: sale.unit || 'tons', price: sale.pricePerUnit, date: sale.date });
  };

  const cancelEditingSale = () => {
    setEditingSaleId(null);
  };

  const saveEditingSale = () => {
    if (!editingSaleId) return;
    setSales(sales.map(item => 
      item.id === editingSaleId 
        ? { 
            ...item, 
            crop: editSaleFormData.crop,
            quantity: editSaleFormData.quantity, 
            unit: editSaleFormData.unit,
            pricePerUnit: editSaleFormData.price,
            totalSale: editSaleFormData.quantity * editSaleFormData.price,
            date: editSaleFormData.date
          }
        : item
    ));
    setEditingSaleId(null);
  };

  const startEditingExpense = (expense: ExpenseRecord) => {
    setEditingExpenseId(expense.id);
    setEditExpenseFormData({ category: expense.category, amount: expense.amount, date: expense.date });
  };

  const cancelEditingExpense = () => {
    setEditingExpenseId(null);
  };

  const saveEditingExpense = () => {
    if (!editingExpenseId) return;
    setExpenses(expenses.map(item => 
      item.id === editingExpenseId 
        ? { ...item, category: editExpenseFormData.category, amount: editExpenseFormData.amount, date: editExpenseFormData.date }
        : item
    ));
    setEditingExpenseId(null);
  };

  const handleResetData = async () => {
    if (!user) {
      setError("You must be logged in to reset data.");
      return;
    }

    if (!window.confirm("Are you sure you want to reset all your analytics data? This action cannot be undone.")) {
      return;
    }

    setIsResetting(true);
    setError(null);

    const filePath = getFilePath(user.id);

    try {
      const { error: removeError } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      if (removeError && removeError.message !== 'The resource was not found') {
        throw removeError;
      }

      // Clear local state
      setInventory([]);
      setSales([]);
      setExpenses([]);
      setLastSaved(new Date()); // Reflect the change
    } catch (err) {
      setError(`Failed to reset data: ${(err as Error).message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleExportData = () => {
    const downloadFile = (data: any[], filename: string) => {
      if (!data.length) return;
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
          const val = row[header];
          return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    if (inventory.length > 0) downloadFile(inventory, `inventory_${today}.csv`);
    if (sales.length > 0) downloadFile(sales, `sales_${today}.csv`);
    if (expenses.length > 0) downloadFile(expenses, `expenses_${today}.csv`);
  };

  const totalRevenue = useMemo(() => sales.reduce((sum, sale) => sum + sale.totalSale, 0), [sales]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
  const netProfit = useMemo(() => totalRevenue - totalExpenses, [totalRevenue, totalExpenses]);

  // --- Fetch AI Insights (uses cached helper) ---
  const fetchInsights = useCallback(async () => {
    setIsLoadingInsights(true);
    try {
      // Get top crops
      const cropCount: Record<string, number> = {};
      sales.forEach(sale => {
        cropCount[sale.crop] = (cropCount[sale.crop] || 0) + 1;
      });
      const topCrops = Object.entries(cropCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([crop]) => crop);

      // Get top expense categories
      const expenseCount: Record<string, number> = {};
      expenses.forEach(exp => {
        expenseCount[exp.category] = (expenseCount[exp.category] || 0) + 1;
      });
      const topExpenseCategories = Object.entries(expenseCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([cat]) => cat);

      const insights = await fetchAIInsights({
        totalRevenue,
        totalExpenses,
        netProfit,
        inventoryCount: inventory.length,
        salesCount: sales.length,
        expensesCount: expenses.length,
        topCrops,
        topExpenseCategories,
      });

      setAiInsights(insights);
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate AI insights');
    } finally {
      setIsLoadingInsights(false);
    }
  }, [inventory, sales, expenses, totalRevenue, totalExpenses, netProfit]);

  const getGroupKey = (date: string, range: string) => {
    if (range === 'this_month' || range === 'last_month') {
      return date; // Group by day (YYYY-MM-DD)
    }
    return date.substring(0, 7); // Group by month (YYYY-MM)
  };

  const chartTitle = useMemo(() => {
    switch (timeRange) {
      case 'all':
        return 'All Time Performance';
      case 'this_month':
        return "This Month's Performance";
      case 'last_month':
        return "Last Month's Performance";
      case 'current_quarter':
        return 'Current Quarter Performance';
      case 'last_quarter':
        return 'Last Quarter Performance';
      case 'current_fy':
        return 'Current Financial Year Performance';
      default:
        return 'Monthly Performance';
    }
  }, [timeRange]);

  const formatXAxis = (tickItem: string) => {
    if (timeRange === 'this_month' || timeRange === 'last_month') {
      return new Date(tickItem).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }
    return new Date(tickItem + '-02').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const profitData = useMemo(() => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    switch (timeRange) {
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'current_quarter': {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      }
      case 'last_quarter': {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
        endDate = new Date(now.getFullYear(), quarter * 3, 0);
        break;
      }
      case 'current_fy': {
        // Assuming Financial Year starts in April
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
        startDate = new Date(fyStartYear, 3, 1); // April 1st
        endDate = new Date(fyStartYear + 1, 2, 31); // March 31st
        break;
      }
      case 'all':
      default:
        // No date filtering
        break;
    }

    const filteredSales = sales.filter(sale => {
      if (!startDate || !endDate) return true;
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });

    const filteredExpenses = expenses.filter(expense => {
      if (!startDate || !endDate) return true;
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    const dataMap = new Map<string, { Revenue: number; Expenses: number }>();

    filteredSales.forEach(sale => {
      const groupKey = getGroupKey(sale.date, timeRange);
      const entry = dataMap.get(groupKey) || { Revenue: 0, Expenses: 0 };
      entry.Revenue += sale.totalSale;
      dataMap.set(groupKey, entry);
    });

    filteredExpenses.forEach(expense => {
      const groupKey = getGroupKey(expense.date, timeRange);
      const entry = dataMap.get(groupKey) || { Revenue: 0, Expenses: 0 };
      entry.Expenses += expense.amount;
      dataMap.set(groupKey, entry);
    });

    if (dataMap.size === 0 && (startDate && endDate)) {
      const startGroup = getGroupKey(startDate.toISOString().split('T')[0], timeRange);
      return [{ group: startGroup, Revenue: 0, Expenses: 0, Profit: 0 }];
    }

    return Array.from(dataMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, { Revenue, Expenses }]) => ({
        group,
        Revenue,
        Expenses,
        Profit: Revenue - Expenses,
      }));
  }, [sales, expenses, timeRange]);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        <p className="ml-2 text-gray-600">Loading Analytics...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-100 font-sans md:flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        <Header isOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} title={t('sidebar_analytics')} user={user} />

        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
          {/* Save Status Indicator */}
          <div className="flex justify-end items-center gap-4 text-sm text-gray-500">
            <button
              onClick={handleResetData}
              disabled={isResetting}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>{isResetting ? 'Resetting...' : 'Reset Data'}</span>
            </button>
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <div className="flex items-center">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 text-green-500 mr-2" />}
              <span>{isSaving ? 'Saving...' : lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : 'All changes saved'}</span>
              {error && <div className="ml-4 flex items-center text-red-600"><AlertCircle className="w-4 h-4 mr-1" /> {error}</div>}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-green-200">
              <div className="bg-green-100 p-3 rounded-full"><DollarSign className="w-6 h-6 text-green-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-red-200">
              <div className="bg-red-100 p-3 rounded-full"><TrendingDown className="w-6 h-6 text-red-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalExpenses.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-blue-200">
              <div className="bg-blue-100 p-3 rounded-full"><Wallet className="w-6 h-6 text-blue-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Net Profit</p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>₹{netProfit.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* AI Insights Section */}
          <section className={`rounded-lg shadow-md p-4 md:p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-transparent ${
            aiInsights?.healthStatus === 'critical' ? 'bg-red-50 hover:border-red-200' :
            aiInsights?.healthStatus === 'warning' ? 'bg-yellow-50 hover:border-yellow-200' :
            'bg-blue-50 hover:border-blue-200'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  aiInsights?.healthStatus === 'critical' ? 'bg-red-100' :
                  aiInsights?.healthStatus === 'warning' ? 'bg-yellow-100' :
                  'bg-blue-100'
                }`}>
                  <Sparkles className={`w-6 h-6 ${
                    aiInsights?.healthStatus === 'critical' ? 'text-red-600' :
                    aiInsights?.healthStatus === 'warning' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">AI Insights & Recommendations</h3>
              </div>
              <button
                onClick={() => fetchInsights()}
                disabled={isLoadingInsights || sales.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                  isLoadingInsights || sales.length === 0
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoadingInsights ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4" />
                    Generate Insights
                  </>
                )}
              </button>
            </div>

            {sales.length === 0 ? (
              <p className="text-gray-600 text-sm">Add some sales records to generate AI insights.</p>
            ) : aiInsights ? (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-white bg-opacity-70 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Summary
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{aiInsights.summary}</p>
                  {aiInsights.profitMargin !== undefined && (
                    <div className="mt-2 text-xs text-gray-600">
                      Profit Margin: <span className="font-semibold">{aiInsights.profitMargin.toFixed(1)}%</span>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                {aiInsights.recommendations.length > 0 && (
                  <div className="bg-white bg-opacity-70 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {aiInsights.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-gray-700">
                          <span className="font-bold text-blue-600 flex-shrink-0">{idx + 1}.</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Concerns */}
                {aiInsights.concerns && (
                  <div className="bg-white bg-opacity-70 rounded-lg p-4 border-l-4 border-orange-500">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      Areas of Concern
                    </h4>
                    <p className="text-gray-700 text-sm">{aiInsights.concerns}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-sm italic">Click "Generate Insights" to get AI-powered recommendations.</p>
            )}
          </section>

          {/* Profit/Revenue Chart */}
          <section className="bg-white p-4 md:p-5 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
              <h3 className="text-lg font-bold text-gray-900">{chartTitle}</h3>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select a time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="current_quarter">Current Quarter</SelectItem>
                  <SelectItem value="last_quarter">Last Quarter</SelectItem>
                  <SelectItem value="current_fy">Current Financial Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="group" tickFormatter={formatXAxis} />
                  <YAxis tickFormatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                  <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`} />
                  <Legend />
                  <Line type="monotone" dataKey="Revenue" stroke="#16a34a" strokeWidth={2} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="Expenses" stroke="#dc2626" strokeWidth={2} />
                  <Line type="monotone" dataKey="Profit" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Inventory Management */}
            <section className="bg-white p-4 md:p-5 rounded-lg shadow-md space-y-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Crop Inventory</h3>
              {/* Add new crop form */}
              <form onSubmit={handleAddCrop} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                <input
                  type="text"
                  placeholder="Crop Name"
                  value={newCrop.name}
                  onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })}
                  className="border-gray-300 rounded-md shadow-sm p-2 text-gray-900 placeholder:text-gray-500"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={newCrop.quantity}
                  onChange={(e) => setNewCrop({ ...newCrop, quantity: e.target.value })}
                  className="border-gray-300 rounded-md shadow-sm p-2 text-gray-900 placeholder:text-gray-500"
                />
                <select
                  value={newCrop.unit}
                  onChange={(e) => setNewCrop({ ...newCrop, unit: e.target.value })}
                  className="border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                >
                  <option value="tons">Tons</option>
                  <option value="kg">Kg</option>
                  <option value="dozen">Dozen</option>
                  <option value="liter">Liter</option>
                </select>
                <input
                  type="date"
                  value={newCrop.date}
                  onChange={(e) => setNewCrop({ ...newCrop, date: e.target.value })}
                  className="col-span-1 border-gray-300 rounded-md shadow-sm p-2 text-gray-900 placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  className="col-span-1 sm:col-span-4 bg-green-600 text-white rounded-md p-2 flex items-center justify-center gap-2 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>
              {/* Inventory Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-2">Crop</th>
                      <th scope="col" className="px-4 py-2">Date Added</th>
                      <th scope="col" className="px-4 py-2">Quantity</th>
                      <th scope="col" className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.slice(-5).reverse().map(item => (
                      <tr key={item.id} className="bg-white border-b">
                        <td className="px-4 py-2 font-medium text-gray-900">
                          {editingId === item.id ? (
                            <input 
                              type="text" 
                              value={editFormData.crop} 
                              onChange={e => setEditFormData({...editFormData, crop: e.target.value})}
                              className="w-full border rounded px-1 py-0.5"
                            />
                          ) : item.crop}
                        </td>
                        <td className="px-4 py-2 text-gray-600">{item.date}</td>
                        <td className="px-4 py-2 font-medium text-gray-900">
                          {editingId === item.id ? (
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                value={editFormData.quantity} 
                                onChange={e => setEditFormData({...editFormData, quantity: parseFloat(e.target.value) || 0})}
                                className="w-20 border rounded px-1 py-0.5"
                              />
                              <select
                                value={editFormData.unit}
                                onChange={e => setEditFormData({...editFormData, unit: e.target.value})}
                                className="border rounded px-1 py-0.5 text-xs"
                              >
                                <option value="tons">Tons</option>
                                <option value="kg">Kg</option>
                                <option value="dozen">Dozen</option>
                                <option value="liter">Liter</option>
                              </select>
                            </div>
                          ) : `${item.quantity.toLocaleString()} ${item.unit}`}
                        </td>
                        <td className="px-4 py-2">
                          {editingId === item.id ? (
                            <div className="flex gap-2">
                              <button onClick={saveEditing} className="text-green-600 hover:text-green-800"><Check className="w-4 h-4" /></button>
                              <button onClick={cancelEditing} className="text-gray-600 hover:text-gray-800"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button onClick={() => startEditing(item)} className="text-blue-500 hover:text-blue-700"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteInventoryItem(item.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Sales Log */}
            <section className="bg-white p-4 md:p-5 rounded-lg shadow-md space-y-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Log a Sale</h3>
              {/* Log sale form */}
              <form onSubmit={handleLogSale} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-end">
                <select
                  value={newSale.cropId}
                  onChange={(e) => {
                    const cropId = e.target.value;
                    const crop = inventory.find(c => c.id === cropId);
                    setNewSale({ ...newSale, cropId, unit: crop ? crop.unit : 'tons' });
                  }}
                  className={`col-span-1 sm:col-span-2 border-gray-300 rounded-md shadow-sm p-2 ${!newSale.cropId ? 'text-gray-500' : 'text-gray-900'}`}
                >
                  <option value="">Select Crop</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.id} className="text-gray-900">{item.crop}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Quantity Sold"
                  value={newSale.quantity}
                  onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value })}
                  className="border-gray-300 rounded-md shadow-sm p-2 text-gray-900 placeholder:text-gray-500"
                />
                <select
                  value={newSale.unit}
                  onChange={(e) => setNewSale({ ...newSale, unit: e.target.value })}
                  className="border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                >
                  <option value="tons">Tons</option>
                  <option value="kg">Kg</option>
                  <option value="dozen">Dozen</option>
                  <option value="liter">Liter</option>
                </select>
                <input
                  type="number"
                  placeholder="Price / unit"
                  value={newSale.price}
                  onChange={(e) => setNewSale({ ...newSale, price: e.target.value })}
                  className="border-gray-300 rounded-md shadow-sm p-2 text-gray-900 placeholder:text-gray-500"
                />
                <input
                  type="date"
                  value={newSale.date}
                  onChange={(e) => setNewSale({ ...newSale, date: e.target.value })}
                  className="border-gray-300 rounded-md shadow-sm p-2 text-gray-900 placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  className="col-span-1 sm:col-span-6 bg-green-600 text-white rounded-md p-2 flex items-center justify-center gap-2 hover:bg-green-700">
                  <Plus className="w-4 h-4" /> Log
                </button>
              </form>
              {/* Recent Sales Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-2">Crop</th>
                      <th scope="col" className="px-4 py-2">Date</th>
                      <th scope="col" className="px-4 py-2 text-right">Quantity</th>
                      <th scope="col" className="px-4 py-2 text-right">Total Sale</th>
                      <th scope="col" className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.slice(-5).reverse().map(sale => (
                      <tr key={sale.id} className="bg-white border-b">
                        <td className="px-4 py-2 font-medium">
                          {editingSaleId === sale.id ? (
                            <input 
                              type="text" 
                              value={editSaleFormData.crop} 
                              onChange={e => setEditSaleFormData({...editSaleFormData, crop: e.target.value})}
                              className="w-full border rounded px-1 py-0.5"
                            />
                          ) : sale.crop}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {editingSaleId === sale.id ? (
                            <input 
                              type="date" 
                              value={editSaleFormData.date} 
                              onChange={e => setEditSaleFormData({...editSaleFormData, date: e.target.value})}
                              className="w-full border rounded px-1 py-0.5"
                            />
                          ) : sale.date}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-600">
                          {editingSaleId === sale.id ? (
                            <div className="flex justify-end gap-1">
                              <input 
                                type="number" 
                                value={editSaleFormData.quantity} 
                                onChange={e => setEditSaleFormData({...editSaleFormData, quantity: parseFloat(e.target.value) || 0})}
                                className="w-16 border rounded px-1 py-0.5 text-right"
                              />
                              <select
                                value={editSaleFormData.unit}
                                onChange={e => setEditSaleFormData({...editSaleFormData, unit: e.target.value})}
                                className="w-16 border rounded px-1 py-0.5 text-xs"
                              >
                                <option value="tons">Tons</option>
                                <option value="kg">Kg</option>
                                <option value="dozen">Dozen</option>
                                <option value="liter">Liter</option>
                              </select>
                            </div>
                          ) : `${sale.quantity} ${sale.unit || 'tons'}`}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-green-700">
                          {editingSaleId === sale.id ? (
                            <input 
                              type="number" 
                              placeholder="Price"
                              value={editSaleFormData.price} 
                              onChange={e => setEditSaleFormData({...editSaleFormData, price: parseFloat(e.target.value) || 0})}
                              className="w-20 border rounded px-1 py-0.5 text-right"
                            />
                          ) : `₹${sale.totalSale.toLocaleString('en-IN')}`}
                        </td>
                        <td className="px-4 py-2">
                          {editingSaleId === sale.id ? (
                            <div className="flex gap-2">
                              <button onClick={saveEditingSale} className="text-green-600 hover:text-green-800"><Check className="w-4 h-4" /></button>
                              <button onClick={cancelEditingSale} className="text-gray-600 hover:text-gray-800"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button onClick={() => startEditingSale(sale)} className="text-blue-500 hover:text-blue-700"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteSale(sale.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Expense Log */}
            <section className="bg-white p-4 md:p-5 rounded-lg shadow-md space-y-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Log an Expense</h3>
              <form onSubmit={handleLogExpense} className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="col-span-2 border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                >
                  <option>Fertilizer</option>
                  <option>Seeds</option>
                  <option>Labor</option>
                  <option>Fuel</option>
                  <option>Maintenance</option>
                  <option>Other</option>
                </select>
                <input
                  type="number"
                  placeholder="Amount (₹)"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="border-gray-300 rounded-md shadow-sm p-2 text-gray-900 placeholder:text-gray-500"
                />
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="border-gray-300 rounded-md shadow-sm p-2 text-gray-900 placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  className="col-span-2 sm:col-span-1 bg-blue-600 text-white rounded-md p-2 flex items-center justify-center gap-2 hover:bg-blue-700">
                  <Minus className="w-4 h-4" /> Log
                </button>
              </form>
              {/* Recent Expenses Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-2">Category</th>
                      <th scope="col" className="px-4 py-2">Date</th>
                      <th scope="col" className="px-4 py-2 text-right">Amount</th>
                      <th scope="col" className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.slice(-5).reverse().map(exp => (
                      <tr key={exp.id} className="bg-white border-b">
                        <td className="px-4 py-2 font-medium">
                          {editingExpenseId === exp.id ? (
                            <select
                              value={editExpenseFormData.category}
                              onChange={e => setEditExpenseFormData({...editExpenseFormData, category: e.target.value})}
                              className="w-full border rounded px-1 py-0.5"
                            >
                              <option>Fertilizer</option>
                              <option>Seeds</option>
                              <option>Labor</option>
                              <option>Fuel</option>
                              <option>Maintenance</option>
                              <option>Other</option>
                            </select>
                          ) : exp.category}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {editingExpenseId === exp.id ? (
                            <input 
                              type="date" 
                              value={editExpenseFormData.date} 
                              onChange={e => setEditExpenseFormData({...editExpenseFormData, date: e.target.value})}
                              className="w-full border rounded px-1 py-0.5"
                            />
                          ) : exp.date}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-red-700">
                          {editingExpenseId === exp.id ? (
                            <input 
                              type="number" 
                              value={editExpenseFormData.amount} 
                              onChange={e => setEditExpenseFormData({...editExpenseFormData, amount: parseFloat(e.target.value) || 0})}
                              className="w-full border rounded px-1 py-0.5 text-right"
                            />
                          ) : `₹${exp.amount.toLocaleString('en-IN')}`}
                        </td>
                        <td className="px-4 py-2">
                          {editingExpenseId === exp.id ? (
                            <div className="flex gap-2">
                              <button onClick={saveEditingExpense} className="text-green-600 hover:text-green-800"><Check className="w-4 h-4" /></button>
                              <button onClick={cancelEditingExpense} className="text-gray-600 hover:text-gray-800"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button onClick={() => startEditingExpense(exp)} className="text-blue-500 hover:text-blue-700"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteExpense(exp.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
