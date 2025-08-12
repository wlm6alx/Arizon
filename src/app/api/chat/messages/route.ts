import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/lib/firebase/chat';
import { NotificationService } from '@/lib/firebase/notifications';

const chatService = ChatService.getInstance();
const notificationService = NotificationService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const { chatId, senderId, senderName, message, messageType, bargainData } = await request.json();

    if (!chatId || !senderId || !senderName || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await chatService.sendMessage(
      chatId,
      senderId,
      senderName,
      message,
      messageType || 'text',
      bargainData
    );

    // Send notification to other participants
    // In a real app, you'd get the chat participants from Firestore
    // For now, we'll skip the notification part in this endpoint
    // The notification will be handled by the real-time listener

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { chatId, userId } = await request.json();

    if (!chatId || !userId) {
      return NextResponse.json(
        { error: 'Chat ID and User ID are required' },
        { status: 400 }
      );
    }

    await chatService.markMessagesAsRead(chatId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}
