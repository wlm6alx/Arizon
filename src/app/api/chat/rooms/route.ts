import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/lib/firebase/chat';
import { NotificationService } from '@/lib/firebase/notifications';

const chatService = ChatService.getInstance();
const notificationService = NotificationService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const { participants, participantNames, productId, productName } = await request.json();

    if (!participants || !Array.isArray(participants) || participants.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 participants are required' },
        { status: 400 }
      );
    }

    const chatId = await chatService.createChatRoom(
      participants,
      participantNames,
      productId,
      productName
    );

    // Send notification to other participants
    const otherParticipants = participants.slice(1);
    if (otherParticipants.length > 0) {
      await notificationService.sendNotificationToMultipleUsers(
        otherParticipants,
        {
          title: 'New Chat Started',
          body: `${participantNames[participants[0]]} started a chat${productName ? ` about ${productName}` : ''}`,
          data: {
            type: NotificationService.NotificationTypes.NEW_MESSAGE,
            chatId,
            productId: productId || ''
          }
        }
      );
    }

    return NextResponse.json({ chatId });
  } catch (error) {
    console.error('Error creating chat room:', error);
    return NextResponse.json(
      { error: 'Failed to create chat room' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you'd fetch from Firestore
    // For now, return a placeholder response
    return NextResponse.json({ 
      message: 'Use the client-side subscribeToUserChats method to get real-time chat rooms' 
    });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat rooms' },
      { status: 500 }
    );
  }
}
