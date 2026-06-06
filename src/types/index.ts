export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: Date;
  paymentMode: PaymentMode;
  merchant?: string;
  receipt?: Receipt;
  tags?: string[];
  isRecurring?: boolean;
  location?: string;
}

export interface Income {
  id: string;
  amount: number;
  source: string;
  date: Date;
  isRecurring?: boolean;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
  isCustom?: boolean;
}

export interface Receipt {
  id: string;
  imageUrl: string;
  extractedData?: ExtractedReceiptData;
  ocrText?: string;
  processed: boolean;
}

export interface ExtractedReceiptData {
  merchant: string;
  amount: number;
  date: Date;
  items?: ReceiptItem[];
  paymentMode?: PaymentMode;
  category?: string;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export type PaymentMode = 
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'digital_wallet'
  | 'cheque';

export interface Budget {
  id: string;
  category: Category;
  amount: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: Date;
  endDate: Date;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  description?: string;
  isActive: boolean;
}

export interface SavingsRule {
  id: string;
  name: string;
  type: 'roundup' | 'rainy_day' | 'sunny_day' | 'naughty' | 'custom';
  amount: number;
  condition: string;
  isActive: boolean;
  totalSaved: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  date: Date;
  read: boolean;
  actionUrl?: string;
}

export interface PredictionData {
  category: string;
  predictedAmount: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendation?: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

export interface DashboardStats {
  totalExpenses: number;
  totalIncome: number;
  savingsThisMonth: number;
  budgetUtilization: number;
  topCategories: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

export interface WeatherData {
  condition: 'sunny' | 'rainy' | 'cloudy' | 'stormy';
  temperature: number;
  location: string;
}
