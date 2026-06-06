import { z } from 'zod'

// Expense validation schema
export const expenseSchema = z.object({
  id: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.date(),
  paymentMode: z.enum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'cheque']),
  merchant: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
  location: z.string().optional(),
})

export type ExpenseFormData = z.infer<typeof expenseSchema>

// Income validation schema
export const incomeSchema = z.object({
  id: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  source: z.string().min(1, 'Source is required'),
  date: z.date(),
  isRecurring: z.boolean().optional(),
  description: z.string().optional(),
})

export type IncomeFormData = z.infer<typeof incomeSchema>

// Budget validation schema
export const budgetSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  period: z.enum(['monthly', 'weekly', 'yearly']),
  startDate: z.date(),
  endDate: z.date(),
})

export type BudgetFormData = z.infer<typeof budgetSchema>

// Savings Goal validation schema
export const savingsGoalSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Goal name is required'),
  targetAmount: z.number().positive('Target amount must be positive'),
  currentAmount: z.number().min(0, 'Current amount cannot be negative').optional(),
  deadline: z.date(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
})

export type SavingsGoalFormData = z.infer<typeof savingsGoalSchema>

// Category validation schema
export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Category name is required'),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Valid hex color is required'),
  budget: z.number().positive().optional(),
  isCustom: z.boolean().optional(),
})

export type CategoryFormData = z.infer<typeof categorySchema>

// Savings Rule validation schema
export const savingsRuleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Rule name is required'),
  type: z.enum(['roundup', 'rainy_day', 'sunny_day', 'naughty', 'custom']),
  amount: z.number().positive('Amount must be positive'),
  condition: z.string().min(1, 'Condition is required'),
  isActive: z.boolean().optional(),
  totalSaved: z.number().min(0).optional(),
})

export type SavingsRuleFormData = z.infer<typeof savingsRuleSchema>

// Form validation helper
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validData = schema.parse(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: 'Validation failed' } }
  }
}
