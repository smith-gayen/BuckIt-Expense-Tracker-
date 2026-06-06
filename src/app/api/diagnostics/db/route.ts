import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import { 
  UserModel,
  ExpenseModel,
  IncomeModel,
  BudgetModel,
  CategoryModel,
  SavingsGoalModel,
  SavingsRuleModel,
  NotificationModel,
  ReceiptModel,
} from '@/models'

export const runtime = 'nodejs'

export async function GET() {
  try {
    await connectDB()

    const readyState = mongoose.connection.readyState // 1 = connected
    const connectionOk = readyState === 1

    const [
      users,
      expenses,
      income,
      budgets,
      categories,
      savingsGoals,
      savingsRules,
      notifications,
      receipts,
    ] = await Promise.all([
      UserModel.countDocuments().catch(() => -1),
      ExpenseModel.countDocuments().catch(() => -1),
      IncomeModel.countDocuments().catch(() => -1),
      BudgetModel.countDocuments().catch(() => -1),
      CategoryModel.countDocuments().catch(() => -1),
      SavingsGoalModel.countDocuments().catch(() => -1),
      SavingsRuleModel.countDocuments().catch(() => -1),
      NotificationModel.countDocuments().catch(() => -1),
      ReceiptModel.countDocuments().catch(() => -1),
    ])

    return NextResponse.json({
      connection: {
        readyState,
        ok: connectionOk,
      },
      collections: {
        users,
        expenses,
        income,
        budgets,
        categories,
        savingsGoals,
        savingsRules,
        notifications,
        receipts,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Diagnostics failed' }, { status: 500 })
  }
}
