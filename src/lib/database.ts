import connectDB from './mongodb';
import {
  CategoryModel,
  ExpenseModel,
  IncomeModel,
  BudgetModel,
  SavingsGoalModel,
  SavingsRuleModel,
  NotificationModel,
  ReceiptModel
} from '@/models';
import {
  Expense,
  Income,
  Category,
  Budget,
  SavingsGoal,
  SavingsRule,
  Notification,
  Receipt
} from '@/types';
import { withTransaction } from './transactions';
import { AppError } from './errors';
import { ClientSession } from 'mongoose';

// Generic database operations
class DatabaseService {
  async connect() {
    await connectDB();
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    await this.connect();
    const categories = await CategoryModel.find({}).lean();
    return categories.map((cat: any) => {
      const { _id, __v, ...rest } = cat || {};
      return rest as Category;
    });
  }

  async saveCategories(categories: Category[]): Promise<void> {
    await this.connect();
    // Clear existing categories and insert new ones
    await CategoryModel.deleteMany({});
    await CategoryModel.insertMany(categories);
  }

  async addCategory(category: Category): Promise<Category> {
    await this.connect();
    const newCategory = new CategoryModel(category);
    await newCategory.save();
    return category;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    await this.connect();
    const updated = await CategoryModel.findOneAndUpdate(
      { id },
      updates,
      { new: true }
    ).lean();
    if (!updated) return null;
    const { _id, __v, ...rest } = updated as any;
    return rest as Category;
  }

  async deleteCategory(id: string): Promise<boolean> {
    await this.connect();
    const result = await CategoryModel.deleteOne({ id });
    return (result.deletedCount ?? 0) > 0;
  }

  // Expense operations
  async getExpenses(): Promise<Expense[]> {
    await this.connect();
    const expenses = await ExpenseModel.find({}).lean();
    return expenses.map((exp: any) => {
      const { _id, __v, ...rest } = exp || {};
      return { ...rest, date: new Date(exp.date) } as Expense;
    });
  }

  async saveExpenses(expenses: Expense[]): Promise<void> {
    await this.connect();
    await ExpenseModel.deleteMany({});
    await ExpenseModel.insertMany(expenses);
  }

  async addExpense(expense: Expense): Promise<Expense> {
    await this.connect();
    const newExpense = new ExpenseModel(expense);
    await newExpense.save();
    return expense;
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense | null> {
    await this.connect();
    const updated = await ExpenseModel.findOneAndUpdate(
      { id },
      updates,
      { new: true }
    ).lean();
    if (!updated) return null;
    const { _id, __v, ...rest } = updated as any;
    return { ...rest, date: new Date((updated as any).date) } as Expense;
  }

  async deleteExpense(id: string): Promise<boolean> {
    await this.connect();
    const result = await ExpenseModel.deleteOne({ id });
    return (result.deletedCount ?? 0) > 0;
  }

  // Income operations
  async getIncome(): Promise<Income[]> {
    await this.connect();
    const income = await IncomeModel.find({}).lean();
    return income.map((inc: any) => {
      const { _id, __v, ...rest } = inc || {};
      return { ...rest, date: new Date(inc.date) } as Income;
    });
  }

  async saveIncome(income: Income[]): Promise<void> {
    await this.connect();
    await IncomeModel.deleteMany({});
    await IncomeModel.insertMany(income);
  }

  async addIncome(income: Income): Promise<Income> {
    await this.connect();
    const newIncome = new IncomeModel(income);
    await newIncome.save();
    return income;
  }

  async updateIncome(id: string, updates: Partial<Income>): Promise<Income | null> {
    await this.connect();
    const updated = await IncomeModel.findOneAndUpdate(
      { id },
      updates,
      { new: true }
    ).lean();
    if (!updated) return null;
    const { _id, __v, ...rest } = updated as any;
    return { ...rest, date: new Date((updated as any).date) } as Income;
  }

  async deleteIncome(id: string): Promise<boolean> {
    await this.connect();
    const result = await IncomeModel.deleteOne({ id });
    return (result.deletedCount ?? 0) > 0;
  }

  // Budget operations
  async getBudgets(): Promise<Budget[]> {
    await this.connect();
    const budgets = await BudgetModel.find({}).lean();
    return budgets.map((budget: any) => {
      const { _id, __v, ...rest } = budget || {};
      return {
        ...rest,
        startDate: new Date(budget.startDate),
        endDate: new Date(budget.endDate),
      } as Budget;
    });
  }

  async saveBudgets(budgets: Budget[]): Promise<void> {
    await this.connect();
    await withTransaction(async (session) => {
      await BudgetModel.deleteMany({}).session(session);
      await BudgetModel.insertMany(budgets, { session });
    });
  }

  async addBudget(budget: Budget): Promise<Budget> {
    await this.connect();
    try {
      const newBudget = new BudgetModel(budget);
      await withTransaction(async (session) => {
        // Check if budget already exists for the same period and category
        const existing = await BudgetModel.findOne({
          category: budget.category,
          startDate: budget.startDate,
          endDate: budget.endDate
        }).session(session);

        if (existing) {
          throw AppError.badRequest('Budget already exists for this period and category');
        }

        await newBudget.save({ session });
      });
      return budget;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.internal('Failed to create budget');
    }
  }

  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget | null> {
    await this.connect();
    const updated = await BudgetModel.findOneAndUpdate(
      { id },
      updates,
      { new: true }
    ).lean();
    if (!updated) return null;
    const { _id, __v, ...rest } = updated as any;
    return {
      ...rest,
      startDate: new Date((updated as any).startDate),
      endDate: new Date((updated as any).endDate),
    } as Budget;
  }

  async deleteBudget(id: string): Promise<boolean> {
    await this.connect();
    const result = await BudgetModel.deleteOne({ id });
    return (result.deletedCount ?? 0) > 0;
  }

  // Savings Goal operations
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    await this.connect();
    const goals = await SavingsGoalModel.find({}).lean();
    return goals.map((goal: any) => {
      const { _id, __v, ...rest } = goal || {};
      return { ...rest, deadline: new Date(goal.deadline) } as SavingsGoal;
    });
  }

  async saveSavingsGoals(goals: SavingsGoal[]): Promise<void> {
    await this.connect();
    await SavingsGoalModel.deleteMany({});
    await SavingsGoalModel.insertMany(goals);
  }

  async addSavingsGoal(goal: SavingsGoal): Promise<SavingsGoal> {
    await this.connect();
    const newGoal = new SavingsGoalModel(goal);
    await newGoal.save();
    return goal;
  }

  async updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal | null> {
    await this.connect();
    const updated = await SavingsGoalModel.findOneAndUpdate(
      { id },
      updates,
      { new: true }
    ).lean();
    if (!updated) return null;
    const { _id, __v, ...rest } = updated as any;
    return { ...rest, deadline: new Date((updated as any).deadline) } as SavingsGoal;
  }

  async deleteSavingsGoal(id: string): Promise<boolean> {
    await this.connect();
    const result = await SavingsGoalModel.deleteOne({ id });
    return (result.deletedCount ?? 0) > 0;
  }

  // Savings Rule operations
  async getSavingsRules(): Promise<SavingsRule[]> {
    await this.connect();
    const rules = await SavingsRuleModel.find({}).lean();
    return rules.map((rule: any) => {
      const { _id, __v, ...rest } = rule || {};
      return rest as SavingsRule;
    });
  }

  async saveSavingsRules(rules: SavingsRule[]): Promise<void> {
    await this.connect();
    await SavingsRuleModel.deleteMany({});
    await SavingsRuleModel.insertMany(rules);
  }

  async addSavingsRule(rule: SavingsRule): Promise<SavingsRule> {
    await this.connect();
    const newRule = new SavingsRuleModel(rule);
    await newRule.save();
    return rule;
  }

  async updateSavingsRule(id: string, updates: Partial<SavingsRule>): Promise<SavingsRule | null> {
    await this.connect();
    const updated = await SavingsRuleModel.findOneAndUpdate(
      { id },
      updates,
      { new: true }
    ).lean();
    if (!updated) return null;
    const { _id, __v, ...rest } = updated as any;
    return rest as SavingsRule;
  }

  async deleteSavingsRule(id: string): Promise<boolean> {
    await this.connect();
    const result = await SavingsRuleModel.deleteOne({ id });
    return (result.deletedCount ?? 0) > 0;
  }

  // Notification operations
  async getNotifications(): Promise<Notification[]> {
    await this.connect();
    const notifications = await NotificationModel.find({}).lean();
    return notifications.map((notif: any) => {
      const { _id, __v, ...rest } = notif || {};
      return { ...rest, date: new Date(notif.date) } as Notification;
    });
  }

  async saveNotifications(notifications: Notification[]): Promise<void> {
    await this.connect();
    await NotificationModel.deleteMany({});
    await NotificationModel.insertMany(notifications);
  }

  async addNotification(notification: Notification): Promise<Notification> {
    await this.connect();
    const newNotification = new NotificationModel(notification);
    await newNotification.save();
    return notification;
  }

  async updateNotification(id: string, updates: Partial<Notification>): Promise<Notification | null> {
    await this.connect();
    const updated = await NotificationModel.findOneAndUpdate(
      { id },
      updates,
      { new: true }
    ).lean();
    if (!updated) return null;
    const { _id, __v, ...rest } = updated as any;
    return { ...rest, date: new Date((updated as any).date) } as Notification;
  }

  async deleteNotification(id: string): Promise<boolean> {
    await this.connect();
    const result = await NotificationModel.deleteOne({ id });
    return (result.deletedCount ?? 0) > 0;
  }

  // Receipt operations
  async getReceipts(): Promise<Receipt[]> {
    await this.connect();
    const receipts = await ReceiptModel.find({}).lean();
    return receipts.map((rec: any) => {
      const { _id, __v, ...rest } = rec || {};
      return rest as Receipt;
    });
  }

  async addReceipt(receipt: Receipt): Promise<Receipt> {
    await this.connect();
    const newReceipt = new ReceiptModel(receipt);
    await newReceipt.save();
    return receipt;
  }

  async updateReceipt(id: string, updates: Partial<Receipt>): Promise<Receipt | null> {
    await this.connect();
    const updated = await ReceiptModel.findOneAndUpdate(
      { id },
      updates,
      { new: true }
    ).lean();
    if (!updated) return null;
    const { _id, __v, ...rest } = updated as any;
    return rest as Receipt;
  }

  async deleteReceipt(id: string): Promise<boolean> {
    await this.connect();
    const result = await ReceiptModel.deleteOne({ id });
    return (result.deletedCount ?? 0) > 0;
  }

  // Initialize default data
  async initializeDefaultData(): Promise<void> {
    await this.connect();
    
    // Check if categories exist, if not, create default ones
    const existingCategories = await CategoryModel.countDocuments();
    if (existingCategories === 0) {
      const defaultCategories = [
        { id: '1', name: 'Food & Dining', icon: '🍔', color: '#2ECC71', isCustom: false },
        { id: '2', name: 'Transportation', icon: '🚗', color: '#3498DB', isCustom: false },
        { id: '3', name: 'Shopping', icon: '🛍️', color: '#9B59B6', isCustom: false },
        { id: '4', name: 'Entertainment', icon: '🎬', color: '#F39C12', isCustom: false },
        { id: '5', name: 'Utilities', icon: '⚡', color: '#E74C3C', isCustom: false },
        { id: '6', name: 'Healthcare', icon: '🏥', color: '#E67E22', isCustom: false },
        { id: '7', name: 'Education', icon: '📚', color: '#1ABC9C', isCustom: false },
        { id: '8', name: 'Travel', icon: '✈️', color: '#8E44AD', isCustom: false },
        { id: '9', name: 'Fitness', icon: '💪', color: '#27AE60', isCustom: false },
        { id: '10', name: 'Other', icon: '📋', color: '#95A5A6', isCustom: false },
      ];
      await CategoryModel.insertMany(defaultCategories);
    }
  }
}

// Export singleton instance
export const db = new DatabaseService();
