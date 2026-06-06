// Local storage utilities for data persistence

export const STORAGE_KEYS = {
  EXPENSES: 'trackify_expenses',
  INCOME: 'trackify_income',
  BUDGETS: 'trackify_budgets',
  SAVINGS_GOALS: 'trackify_savings_goals',
  SAVINGS_RULES: 'trackify_savings_rules',
  CATEGORIES: 'trackify_categories',
  NOTIFICATIONS: 'trackify_notifications',
} as const

// Generic storage functions
export const storage = {
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error)
      return null
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting ${key} to localStorage:`, error)
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    
    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return
    
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        window.localStorage.removeItem(key)
      })
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }
}

// Data-specific storage functions
export const expenseStorage = {
  getAll: () => storage.get(STORAGE_KEYS.EXPENSES) || [],
  save: (expenses: any[]) => storage.set(STORAGE_KEYS.EXPENSES, expenses),
}

export const incomeStorage = {
  getAll: () => storage.get(STORAGE_KEYS.INCOME) || [],
  save: (income: any[]) => storage.set(STORAGE_KEYS.INCOME, income),
}

export const budgetStorage = {
  getAll: () => storage.get(STORAGE_KEYS.BUDGETS) || [],
  save: (budgets: any[]) => storage.set(STORAGE_KEYS.BUDGETS, budgets),
}

export const savingsGoalStorage = {
  getAll: () => storage.get(STORAGE_KEYS.SAVINGS_GOALS) || [],
  save: (goals: any[]) => storage.set(STORAGE_KEYS.SAVINGS_GOALS, goals),
}

export const savingsRuleStorage = {
  getAll: () => storage.get(STORAGE_KEYS.SAVINGS_RULES) || [],
  save: (rules: any[]) => storage.set(STORAGE_KEYS.SAVINGS_RULES, rules),
}

export const categoryStorage = {
  getAll: () => storage.get(STORAGE_KEYS.CATEGORIES) || getDefaultCategories(),
  save: (categories: any[]) => storage.set(STORAGE_KEYS.CATEGORIES, categories),
}

export const notificationStorage = {
  getAll: () => storage.get(STORAGE_KEYS.NOTIFICATIONS) || [],
  save: (notifications: any[]) => storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications),
}

// Default categories
export function getDefaultCategories() {
  return [
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
  ]
}

// Initialize default data
export function initializeDefaultData() {
  // Only initialize if no data exists
  if (!storage.get(STORAGE_KEYS.CATEGORIES)) {
    categoryStorage.save(getDefaultCategories())
  }
  
  if (!storage.get(STORAGE_KEYS.EXPENSES)) {
    expenseStorage.save([])
  }
  
  if (!storage.get(STORAGE_KEYS.BUDGETS)) {
    budgetStorage.save([])
  }
  
  if (!storage.get(STORAGE_KEYS.SAVINGS_GOALS)) {
    savingsGoalStorage.save([])
  }
  
  if (!storage.get(STORAGE_KEYS.SAVINGS_RULES)) {
    savingsRuleStorage.save([])
  }
}
