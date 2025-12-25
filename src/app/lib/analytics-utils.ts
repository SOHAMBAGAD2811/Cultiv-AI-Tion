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
  const response = await fetch('/api/analytics-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch insights');
  }

  return await response.json();
};