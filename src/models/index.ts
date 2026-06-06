import mongoose, { Schema, Document } from 'mongoose';
import { 
  Expense, 
  Income, 
  Category, 
  Budget, 
  SavingsGoal, 
  SavingsRule, 
  Notification,
  Receipt,
  ExtractedReceiptData,
  PaymentMode
} from '@/types';

// Category Schema
const CategorySchema = new Schema<Category & Document>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  budget: { type: Number },
  isCustom: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Receipt Schema
const ReceiptSchema = new Schema({
  id: { type: String, required: true, unique: true },
  imageUrl: { type: String, required: true },
  extractedData: {
    merchant: String,
    amount: Number,
    date: Date,
    items: [{
      name: String,
      quantity: Number,
      price: Number
    }],
    paymentMode: {
      type: String,
      enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'cheque']
    },
    category: String
  },
  ocrText: String,
  processed: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Expense Schema
const ExpenseSchema = new Schema<Expense & Document>({
  id: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  category: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    budget: Number,
    isCustom: { type: Boolean, default: false }
  },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  paymentMode: {
    type: String,
    required: true,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'cheque']
  },
  merchant: String,
  receipt: {
    id: String,
    imageUrl: String,
    extractedData: {
      merchant: String,
      amount: Number,
      date: Date,
      items: [{
        name: String,
        quantity: Number,
        price: Number
      }],
      paymentMode: {
        type: String,
        enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'cheque']
      },
      category: String
    },
    ocrText: String,
    processed: { type: Boolean, default: false }
  },
  tags: [String],
  isRecurring: { type: Boolean, default: false },
  location: String
}, {
  timestamps: true
});

// Income Schema
const IncomeSchema = new Schema<Income & Document>({
  id: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  source: { type: String, required: true },
  date: { type: Date, required: true },
  isRecurring: { type: Boolean, default: false },
  description: String
}, {
  timestamps: true
});

// Budget Schema
const BudgetSchema = new Schema<Budget & Document>({
  id: { type: String, required: true, unique: true },
  category: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    budget: Number,
    isCustom: { type: Boolean, default: false }
  },
  amount: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  period: {
    type: String,
    required: true,
    enum: ['monthly', 'weekly', 'yearly']
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
}, {
  timestamps: true
});

// Savings Goal Schema
const SavingsGoalSchema = new Schema<SavingsGoal & Document>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  description: String,
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Savings Rule Schema
const SavingsRuleSchema = new Schema<SavingsRule & Document>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['roundup', 'rainy_day', 'sunny_day', 'naughty', 'custom']
  },
  amount: { type: Number, required: true },
  condition: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  totalSaved: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Notification Schema
const NotificationSchema = new Schema<Notification & Document>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['info', 'warning', 'error', 'success']
  },
  date: { type: Date, required: true },
  read: { type: Boolean, default: false },
  actionUrl: String
}, {
  timestamps: true
});

// Create models
export const CategoryModel = mongoose.models.Category || mongoose.model('Category', CategorySchema);
export const ExpenseModel = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
export const IncomeModel = mongoose.models.Income || mongoose.model('Income', IncomeSchema);
export const BudgetModel = mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);
export const SavingsGoalModel = mongoose.models.SavingsGoal || mongoose.model('SavingsGoal', SavingsGoalSchema);
export const SavingsRuleModel = mongoose.models.SavingsRule || mongoose.model('SavingsRule', SavingsRuleSchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export const ReceiptModel = mongoose.models.Receipt || mongoose.model('Receipt', ReceiptSchema);

// User Schema
interface UserDoc extends Document {
  email: string
  name: string
  passwordHash: string
  avatar?: string
  preferences?: {
    currency?: string
    locale?: string
    theme?: 'light' | 'dark' | 'system'
  }
}

const UserSchema = new Schema<UserDoc>({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  avatar: String,
  preferences: {
    currency: { type: String, default: 'INR' },
    locale: { type: String, default: 'en-IN' },
    theme: { type: String, enum: ['light','dark','system'], default: 'system' },
  }
}, {
  timestamps: true
});

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
