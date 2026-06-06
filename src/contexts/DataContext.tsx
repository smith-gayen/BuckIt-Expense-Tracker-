'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { Expense, Income, Budget, SavingsGoal, SavingsRule, Category, Notification } from '@/types'
import { api } from '@/lib/api'

// State interface
interface DataState {
  expenses: Expense[]
  income: Income[]
  budgets: Budget[]
  savingsGoals: SavingsGoal[]
  savingsRules: SavingsRule[]
  categories: Category[]
  notifications: Notification[]
  isLoading: boolean
}

// Action types
type DataAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: Partial<DataState> }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'ADD_INCOME'; payload: Income }
  | { type: 'UPDATE_INCOME'; payload: Income }
  | { type: 'DELETE_INCOME'; payload: string }
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'ADD_SAVINGS_GOAL'; payload: SavingsGoal }
  | { type: 'UPDATE_SAVINGS_GOAL'; payload: SavingsGoal }
  | { type: 'DELETE_SAVINGS_GOAL'; payload: string }
  | { type: 'ADD_SAVINGS_RULE'; payload: SavingsRule }
  | { type: 'UPDATE_SAVINGS_RULE'; payload: SavingsRule }
  | { type: 'DELETE_SAVINGS_RULE'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'DELETE_NOTIFICATION'; payload: string }

// Initial state
const initialState: DataState = {
  expenses: [],
  income: [],
  budgets: [],
  savingsGoals: [],
  savingsRules: [],
  categories: [],
  notifications: [],
  isLoading: true,
}

// Reducer
function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'LOAD_DATA':
      return { ...state, ...action.payload, isLoading: false }

    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] }

    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload : expense
        )
      }

    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload)
      }

    case 'ADD_INCOME':
      return { ...state, income: [...state.income, action.payload] }

    case 'UPDATE_INCOME':
      return {
        ...state,
        income: state.income.map(inc =>
          inc.id === action.payload.id ? action.payload : inc
        )
      }

    case 'DELETE_INCOME':
      return {
        ...state,
        income: state.income.filter(inc => inc.id !== action.payload)
      }

    case 'ADD_BUDGET':
      return { ...state, budgets: [...state.budgets, action.payload] }

    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map(budget =>
          budget.id === action.payload.id ? action.payload : budget
        )
      }

    case 'DELETE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.filter(budget => budget.id !== action.payload)
      }

    case 'ADD_SAVINGS_GOAL':
      return { ...state, savingsGoals: [...state.savingsGoals, action.payload] }

    case 'UPDATE_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.map(goal =>
          goal.id === action.payload.id ? action.payload : goal
        )
      }

    case 'DELETE_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.filter(goal => goal.id !== action.payload)
      }

    case 'ADD_SAVINGS_RULE':
      return { ...state, savingsRules: [...state.savingsRules, action.payload] }

    case 'UPDATE_SAVINGS_RULE':
      return {
        ...state,
        savingsRules: state.savingsRules.map(rule =>
          rule.id === action.payload.id ? action.payload : rule
        )
      }

    case 'DELETE_SAVINGS_RULE':
      return {
        ...state,
        savingsRules: state.savingsRules.filter(rule => rule.id !== action.payload)
      }

    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] }

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id ? action.payload : category
        )
      }

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload)
      }

    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] }

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        )
      }

    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload)
      }

    default:
      return state
  }
}

// Context
const DataContext = createContext<{
  state: DataState
  dispatch: React.Dispatch<DataAction>
  actions: {
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>
    updateExpense: (expense: Expense) => Promise<void>
    deleteExpense: (id: string) => Promise<void>
    addIncome: (income: Omit<Income, 'id'>) => Promise<void>
    updateIncome: (income: Income) => Promise<void>
    deleteIncome: (id: string) => Promise<void>
    addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => Promise<void>
    updateBudget: (budget: Budget) => Promise<void>
    deleteBudget: (id: string) => Promise<void>
    addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<void>
    updateSavingsGoal: (goal: SavingsGoal) => Promise<void>
    deleteSavingsGoal: (id: string) => Promise<void>
    addSavingsRule: (rule: Omit<SavingsRule, 'id'>) => Promise<void>
    updateSavingsRule: (rule: SavingsRule) => Promise<void>
    deleteSavingsRule: (id: string) => Promise<void>
    addCategory: (category: Omit<Category, 'id'>) => Promise<void>
    updateCategory: (category: Category) => Promise<void>
    deleteCategory: (id: string) => Promise<void>
    addNotification: (notification: Omit<Notification, 'id'>) => Promise<void>
    markNotificationRead: (id: string) => Promise<void>
    deleteNotification: (id: string) => Promise<void>
  }
} | null>(null)

// Provider component
export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState)

  // Unique ID generator
  const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  // Helper to fix dates coming from API JSON
  const parseDates = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') {
      // Simple check for ISO date strings
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
        return new Date(obj);
      }
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(parseDates);
    }
    if (typeof obj === 'object') {
      const result: any = {};
      for (const key in obj) {
        result[key] = parseDates(obj[key]);
      }
      return result;
    }
    return obj;
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          expenses,
          income,
          budgets,
          savingsGoals,
          savingsRules,
          categories,
          notifications
        ] = await Promise.all([
          api.get<Expense[]>('/expenses').catch(() => []),
          api.get<Income[]>('/income').catch(() => []),
          api.get<Budget[]>('/budgets').catch(() => []),
          api.get<SavingsGoal[]>('/savings-goals').catch(() => []),
          api.get<SavingsRule[]>('/savings-rules').catch(() => []),
          api.get<Category[]>('/categories').catch(() => []),
          api.get<Notification[]>('/notifications').catch(() => [])
        ]);

        dispatch({
          type: 'LOAD_DATA',
          payload: {
            expenses: parseDates(expenses),
            income: parseDates(income),
            budgets: parseDates(budgets),
            savingsGoals: parseDates(savingsGoals),
            savingsRules: parseDates(savingsRules),
            categories: parseDates(categories),
            notifications: parseDates(notifications),
          }
        })
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    }

    loadData()
  }, [])

  // Action creators
  const actions = {
    addExpense: async (expense: Omit<Expense, 'id'>) => {
      const newExpense = { ...expense, id: genId() } as Expense
      // Optimistic upate
      dispatch({ type: 'ADD_EXPENSE', payload: newExpense })

      try {
        await api.post('/expenses', newExpense);

        // Auto-Saver Rules Engine: apply active rules
        let totalSavedAdded = 0
        const now = new Date()
        state.savingsRules.forEach((rule) => {
          if (!rule.isActive) return
          let add = 0
          if (rule.type === 'roundup') {
            const ceil = Math.ceil(newExpense.amount)
            add = Math.max(ceil - newExpense.amount, 0)
          } else if (rule.type === 'rainy_day' || rule.type === 'sunny_day' || rule.type === 'naughty' || rule.type === 'custom') {
            add = Math.max(Number(rule.amount) || 0, 0)
          }
          if (add > 0) {
            totalSavedAdded += add
            const updatedRule = { ...rule, totalSaved: rule.totalSaved + add };
            // Update rule locally and on server
            dispatch({ type: 'UPDATE_SAVINGS_RULE', payload: updatedRule })
            api.put('/savings-rules', { id: rule.id, totalSaved: rule.totalSaved + add }).catch(console.error);
          }
        })

        if (totalSavedAdded > 0) {
          const notifId = genId()
          const newNotif: Notification = {
            id: notifId,
            title: 'Auto-Saver Applied',
            message: `Saved ₹${totalSavedAdded.toFixed(2)} via Auto-Saver rules`,
            type: 'success',
            date: now,
            read: false,
          }
          dispatch({ type: 'ADD_NOTIFICATION', payload: newNotif })
          api.post('/notifications', newNotif).catch(console.error);
        }

      } catch (error) {
        console.error('Failed to add expense:', error);
        // Could dispatch a rollback action here
      }
    },

    updateExpense: async (expense: Expense) => {
      dispatch({ type: 'UPDATE_EXPENSE', payload: expense })
      try {
        await api.put('/expenses', expense);
      } catch (error) {
        console.error('Failed to update expense:', error);
      }
    },

    deleteExpense: async (id: string) => {
      dispatch({ type: 'DELETE_EXPENSE', payload: id })
      try {
        await api.delete(`/expenses?id=${id}`);
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    },

    addIncome: async (income: Omit<Income, 'id'>) => {
      const newIncome = { ...income, id: genId() } as Income
      dispatch({ type: 'ADD_INCOME', payload: newIncome })
      try {
        await api.post('/income', newIncome);
      } catch (error) {
        console.error('Failed to add income:', error);
      }
    },

    updateIncome: async (income: Income) => {
      dispatch({ type: 'UPDATE_INCOME', payload: income })
      try {
        await api.put('/income', income);
      } catch (error) {
        console.error('Failed to update income:', error);
      }
    },

    deleteIncome: async (id: string) => {
      dispatch({ type: 'DELETE_INCOME', payload: id })
      try {
        await api.delete(`/income?id=${id}`);
      } catch (error) {
        console.error('Failed to delete income:', error);
      }
    },

    addBudget: async (budget: Omit<Budget, 'id' | 'spent'>) => {
      const newBudget = {
        ...budget,
        id: genId(),
        spent: 0
      } as Budget
      dispatch({ type: 'ADD_BUDGET', payload: newBudget })
      try {
        await api.post('/budgets', newBudget);
      } catch (error) {
        console.error('Failed to add budget:', error);
      }
    },

    updateBudget: async (budget: Budget) => {
      dispatch({ type: 'UPDATE_BUDGET', payload: budget })
      try {
        await api.put('/budgets', budget);
      } catch (error) {
        console.error('Failed to update budget:', error);
      }
    },

    deleteBudget: async (id: string) => {
      dispatch({ type: 'DELETE_BUDGET', payload: id })
      try {
        await api.delete(`/budgets?id=${id}`);
      } catch (error) {
        console.error('Failed to delete budget:', error);
      }
    },

    addSavingsGoal: async (goal: Omit<SavingsGoal, 'id'>) => {
      const newGoal = {
        ...goal,
        id: genId(),
        currentAmount: goal.currentAmount || 0,
        isActive: true
      } as SavingsGoal
      dispatch({ type: 'ADD_SAVINGS_GOAL', payload: newGoal })
      try {
        await api.post('/savings-goals', newGoal);
      } catch (error) {
        console.error('Failed to add savings goal:', error);
      }
    },

    updateSavingsGoal: async (goal: SavingsGoal) => {
      dispatch({ type: 'UPDATE_SAVINGS_GOAL', payload: goal })
      try {
        await api.put('/savings-goals', goal);
      } catch (error) {
        console.error('Failed to update savings goal:', error);
      }
    },

    deleteSavingsGoal: async (id: string) => {
      dispatch({ type: 'DELETE_SAVINGS_GOAL', payload: id })
      try {
        await api.delete(`/savings-goals?id=${id}`);
      } catch (error) {
        console.error('Failed to delete savings goal:', error);
      }
    },

    addSavingsRule: async (rule: Omit<SavingsRule, 'id'>) => {
      const newRule = {
        ...rule,
        id: genId(),
        isActive: true,
        totalSaved: 0
      } as SavingsRule
      dispatch({ type: 'ADD_SAVINGS_RULE', payload: newRule })
      try {
        await api.post('/savings-rules', newRule);
      } catch (error) {
        console.error('Failed to add savings rule:', error);
      }
    },

    updateSavingsRule: async (rule: SavingsRule) => {
      dispatch({ type: 'UPDATE_SAVINGS_RULE', payload: rule })
      try {
        await api.put('/savings-rules', rule);
      } catch (error) {
        console.error('Failed to update savings rule:', error);
      }
    },

    deleteSavingsRule: async (id: string) => {
      dispatch({ type: 'DELETE_SAVINGS_RULE', payload: id })
      try {
        await api.delete(`/savings-rules?id=${id}`);
      } catch (error) {
        console.error('Failed to delete savings rule:', error);
      }
    },

    addCategory: async (category: Omit<Category, 'id'>) => {
      const newCategory = {
        ...category,
        id: genId(),
        isCustom: true
      } as Category
      dispatch({ type: 'ADD_CATEGORY', payload: newCategory })
      try {
        await api.post('/categories', newCategory);
      } catch (error) {
        console.error('Failed to add category:', error);
      }
    },

    updateCategory: async (category: Category) => {
      dispatch({ type: 'UPDATE_CATEGORY', payload: category })
      try {
        await api.put('/categories', category);
      } catch (error) {
        console.error('Failed to update category:', error);
      }
    },

    deleteCategory: async (id: string) => {
      dispatch({ type: 'DELETE_CATEGORY', payload: id })
      try {
        await api.delete(`/categories?id=${id}`);
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    },

    addNotification: async (notification: Omit<Notification, 'id'>) => {
      const newNotification = {
        ...notification,
        id: genId(),
        read: false,
        date: new Date()
      } as Notification
      dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification })
      try {
        await api.post('/notifications', newNotification);
      } catch (error) {
        console.error('Failed to add notification:', error);
      }
    },

    markNotificationRead: async (id: string) => {
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id })
      try {
        // Assuming there's an endpoint to mark read, or just update the notification
        const notif = state.notifications.find(n => n.id === id);
        if (notif) {
          await api.put('/notifications', { ...notif, read: true });
        }
      } catch (error) {
        console.error('Failed to mark notification read:', error);
      }
    },

    deleteNotification: async (id: string) => {
      dispatch({ type: 'DELETE_NOTIFICATION', payload: id })
      try {
        await api.delete(`/notifications?id=${id}`);
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    },
  }

  return (
    <DataContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </DataContext.Provider>
  )
}

// Custom hook to use the context
export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
