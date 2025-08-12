import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/lib/firebase/chat';
import { NotificationService } from '@/lib/firebase/notifications';

const chatService = ChatService.getInstance();
const notificationService = NotificationService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const { 
      chatId, 
      senderId, 
      senderName, 
      productId, 
      productName, 
      originalPrice, 
      offeredPrice, 
      quantity 
    } = await request.json();

    if (!chatId || !senderId || !senderName || !productId || !productName || !originalPrice || !offeredPrice || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields for bargain offer' },
        { status: 400 }
      );
    }

    const bargainOffer = {
      productId,
      productName,
      originalPrice,
      offeredPrice,
      quantity,
      status: 'pending' as const,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    };

    await chatService.sendBargainOffer(chatId, senderId, senderName, bargainOffer);

    // Send notification to other participants
    // In a real app, you'd get the chat participants and send to others
    // For demo purposes, we'll create a placeholder notification

    return NextResponse.json({ success: true, bargainOffer });
  } catch (error) {
    console.error('Error sending bargain offer:', error);
    return NextResponse.json(
      { error: 'Failed to send bargain offer' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { 
      chatId, 
      messageId, 
      senderId, 
      senderName, 
      response, 
      counterOffer 
    } = await request.json();

    if (!chatId || !messageId || !senderId || !senderName || !response) {
      return NextResponse.json(
        { error: 'Missing required fields for bargain response' },
        { status: 400 }
      );
    }

    if (!['accepted', 'rejected'].includes(response)) {
      return NextResponse.json(
        { error: 'Response must be either "accepted" or "rejected"' },
        { status: 400 }
      );
    }

    await chatService.respondToBargain(
      chatId, 
      messageId, 
      senderId, 
      senderName, 
      response, 
      counterOffer
    );

    // Send notification based on response
    const notificationTitle = response === 'accepted' 
      ? 'Bargain Accepted!' 
      : counterOffer 
        ? 'Counter Offer Received' 
        : 'Bargain Rejected';

    const notificationBody = response === 'accepted'
      ? `${senderName} accepted your bargain offer`
      : counterOffer
        ? `${senderName} made a counter offer: ${counterOffer}`
        : `${senderName} rejected your bargain offer`;

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error('Error responding to bargain:', error);
    return NextResponse.json(
      { error: 'Failed to respond to bargain' },
      { status: 500 }
    );
  }
}
