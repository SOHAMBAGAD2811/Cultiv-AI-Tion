import { createClient } from '../utils/supabase';

export interface InventoryItem {
  id: string;
  crop: string;
  quantity: number;
  unit: string;
  date: string;
}

export interface SaleRecord {
  id: string;
  crop: string;
  quantity: number;
  pricePerUnit: number;
  totalSale: number;
  date: string;
}

export interface ExpenseRecord {
  id: string;
  category: string;
  amount: number;
  date: string;
}

export interface AnalyticsData {
  inventory: InventoryItem[];
  sales: SaleRecord[];
  expenses: ExpenseRecord[];
}

export interface AIInsight {
  summary: string;
  recommendations: string[];
  concerns: string;
  profitMargin: number;
  healthStatus: 'good' | 'warning' | 'critical';
}

const BUCKET_NAME = 'analytics-data';

// Simple in-memory cache for AI insights (keyed by JSON string). Use localStorage as persistent cache in browser.
const insightsCache: Map<string, { value: any; expires: number }> = new Map();
const INSIGHTS_TTL_MS = 1000 * 60 * 60; // 1 hour

export const fetchAnalyticsData = async (userId: string): Promise<AnalyticsData | null> => {
  const supabase = createClient();
  const filePath = `${userId}.json`;
  
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath);

    if (error) {
      // If file doesn't exist, return null (new user)
      if (error.message.includes('not found') || error.message.includes('The resource was not found')) {
        return null;
      }
      throw error;
    }

    if (data) {
      const text = await data.text();
      return JSON.parse(text) as AnalyticsData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};

export const fetchAIInsights = async (data: {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  inventoryCount: number;
  salesCount: number;
  expensesCount: number;
  topCrops: string[];
  topExpenseCategories: string[];
}): Promise<AIInsight> => {
  const key = JSON.stringify(data);

  // Check in-memory cache first
  const now = Date.now();
  const cached = insightsCache.get(key);
  if (cached && cached.expires > now) {
    return cached.value as AIInsight;
  }

  // Check localStorage cache (browser only)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(`ai_insights_${btoa(key)}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.expires && parsed.expires > now) {
          insightsCache.set(key, { value: parsed.value, expires: parsed.expires });
          return parsed.value as AIInsight;
        }
      }
    } catch (e) {
      // ignore localStorage errors
    }
  }

  const response = await fetch('/api/analytics-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch insights');
  }

  const result = await response.json();

  const expires = Date.now() + INSIGHTS_TTL_MS;
  insightsCache.set(key, { value: result, expires });

  // Persist to localStorage if available
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(`ai_insights_${btoa(key)}`, JSON.stringify({ value: result, expires }));
    } catch (e) {
      // ignore storage errors
    }
  }

  return result as AIInsight;
};