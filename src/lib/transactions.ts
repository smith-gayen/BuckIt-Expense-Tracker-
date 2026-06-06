import { ClientSession } from 'mongoose';
import { AppError } from './errors';

export async function withTransaction<T>(
  operation: (session: ClientSession) => Promise<T>
): Promise<T> {
  const mongoose = (await import('mongoose')).default;
  const session = await mongoose.startSession();
  
  try {
    let result: T;
    await session.withTransaction(async () => {
      result = await operation(session);
    });
    return result!;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.internal('Transaction failed');
  } finally {
    await session.endSession();
  }
}

// Example usage:
/*
async function transferMoney(fromUserId: string, toUserId: string, amount: number) {
  return await withTransaction(async (session) => {
    const fromUser = await UserModel.findById(fromUserId).session(session);
    if (!fromUser) throw AppError.notFound('Source user not found');
    
    const toUser = await UserModel.findById(toUserId).session(session);
    if (!toUser) throw AppError.notFound('Target user not found');
    
    if (fromUser.balance < amount) {
      throw AppError.badRequest('Insufficient funds');
    }
    
    await UserModel.findByIdAndUpdate(
      fromUserId,
      { $inc: { balance: -amount } },
      { session }
    );
    
    await UserModel.findByIdAndUpdate(
      toUserId,
      { $inc: { balance: amount } },
      { session }
    );
    
    return { success: true };
  });
}
*/