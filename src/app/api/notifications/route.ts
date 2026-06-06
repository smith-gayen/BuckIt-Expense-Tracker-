import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { Notification } from '@/types';

export async function GET() {
  try {
    const notifications = await db.getNotifications();
    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const notification: Notification = await request.json();
    const newNotification = await db.addNotification(notification);
    return NextResponse.json({ success: true, data: newNotification });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    const updatedNotification = await db.updateNotification(id, updates);

    if (!updatedNotification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedNotification });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const deleted = await db.deleteNotification(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
