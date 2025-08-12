import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where, 
  serverTimestamp,
  Timestamp,
  DocumentData,
  QuerySnapshot,
  FieldValue
} from 'firebase/firestore';
import { db } from './config';

export interface ChatMessage {
  id?: string;
  chatId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Timestamp | Date | FieldValue;
  messageType: 'text' | 'bargain_offer' | 'bargain_response' | 'system';
  bargainData?: BargainOffer;
  isRead: boolean;
}

export interface BargainOffer {
  productId: string;
  productName: string;
  originalPrice: number;
  offeredPrice: number;
  quantity: number;
  status: 'pending' | 'accepted' | 'rejected' | 'counter_offered';
  expiresAt?: Timestamp | Date;
  counterOffer?: number;
}

export interface ChatRoom {
  id?: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage?: string;
  lastMessageTime?: Timestamp | Date;
  unreadCount: Record<string, number>;
  isActive: boolean;
  productId?: string;
  productName?: string;
}

export class ChatService {
  private static instance: ChatService;

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // Create or get existing chat room
  async createChatRoom(participants: string[], participantNames: Record<string, string>, productId?: string, productName?: string): Promise<string> {
    try {
      // Check if chat room already exists
      const existingChatQuery = query(
        collection(db, 'chatRooms'),
        where('participants', 'array-contains-any', participants)
      );

      const existingChats = await new Promise<QuerySnapshot<DocumentData>>((resolve, reject) => {
        const unsubscribe = onSnapshot(existingChatQuery, resolve, reject);
        setTimeout(() => {
          unsubscribe();
          reject(new Error('Timeout'));
        }, 5000);
      });

      // Find exact match
      const exactMatch = existingChats.docs.find(doc => {
        const data = doc.data();
        return data.participants.length === participants.length &&
               participants.every((p: string) => data.participants.includes(p));
      });

      if (exactMatch) {
        return exactMatch.id;
      }

      // Create new chat room
      const chatRoom: Omit<ChatRoom, 'id'> = {
        participants,
        participantNames,
        unreadCount: participants.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}),
        isActive: true,
        productId,
        productName
      };

      const docRef = await addDoc(collection(db, 'chatRooms'), chatRoom);
      return docRef.id;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  }

  // Send a message
  async sendMessage(chatId: string, senderId: string, senderName: string, message: string, messageType: ChatMessage['messageType'] = 'text', bargainData?: BargainOffer): Promise<void> {
    try {
      const messageData: Omit<ChatMessage, 'id'> = {
        chatId,
        senderId,
        senderName,
        message,
        timestamp: serverTimestamp(),
        messageType,
        bargainData,
        isRead: false
      };

      await addDoc(collection(db, 'messages'), messageData);

      // Update chat room with last message
      const chatRoomRef = doc(db, 'chatRooms', chatId);
      await updateDoc(chatRoomRef, {
        lastMessage: message,
        lastMessageTime: serverTimestamp()
      });

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Send bargain offer
  async sendBargainOffer(chatId: string, senderId: string, senderName: string, bargainOffer: BargainOffer): Promise<void> {
    const message = `Bargain offer: ${bargainOffer.offeredPrice} for ${bargainOffer.quantity}x ${bargainOffer.productName}`;
    
    await this.sendMessage(
      chatId, 
      senderId, 
      senderName, 
      message, 
      'bargain_offer', 
      bargainOffer
    );
  }

  // Respond to bargain offer
  async respondToBargain(chatId: string, messageId: string, senderId: string, senderName: string, response: 'accepted' | 'rejected', counterOffer?: number): Promise<void> {
    try {
      // Update the original bargain message
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        'bargainData.status': response === 'accepted' ? 'accepted' : (counterOffer ? 'counter_offered' : 'rejected'),
        'bargainData.counterOffer': counterOffer
      });

      // Send response message
      let responseMessage = '';
      let messageType: ChatMessage['messageType'] = 'bargain_response';

      if (response === 'accepted') {
        responseMessage = 'Bargain offer accepted!';
      } else if (counterOffer) {
        responseMessage = `Counter offer: ${counterOffer}`;
      } else {
        responseMessage = 'Bargain offer rejected.';
      }

      await this.sendMessage(chatId, senderId, senderName, responseMessage, messageType);

    } catch (error) {
      console.error('Error responding to bargain:', error);
      throw error;
    }
  }

  // Listen to messages in a chat room
  subscribeToMessages(chatId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(messagesQuery, (snapshot) => {
      const messages: ChatMessage[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatMessage));
      
      callback(messages);
    });
  }

  // Listen to user's chat rooms
  subscribeToUserChats(userId: string, callback: (chatRooms: ChatRoom[]) => void): () => void {
    const chatsQuery = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', userId),
      where('isActive', '==', true)
    );

    return onSnapshot(chatsQuery, (snapshot) => {
      const chatRooms: ChatRoom[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatRoom));
      
      callback(chatRooms);
    });
  }

  // Mark messages as read
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        where('senderId', '!=', userId),
        where('isRead', '==', false)
      );

      const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
        const batch = snapshot.docs.map(async (messageDoc) => {
          const messageRef = doc(db, 'messages', messageDoc.id);
          await updateDoc(messageRef, { isRead: true });
        });

        await Promise.all(batch);
        unsubscribe();
      });

      // Reset unread count for this user in the chat room
      const chatRoomRef = doc(db, 'chatRooms', chatId);
      await updateDoc(chatRoomRef, {
        [`unreadCount.${userId}`]: 0
      });

    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }
}
