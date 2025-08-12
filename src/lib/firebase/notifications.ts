import { adminMessaging } from './admin';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: { [key: string]: string };
}

/**
 * Sends a notification to a specific device using its FCM token.
 * @param token The Firebase Cloud Messaging (FCM) registration token of the device.
 * @param payload The notification content (title, body, data).
 */
export async function sendNotification(token: string, payload: NotificationPayload) {
  if (!token) {
    throw new Error('FCM token is required to send a notification.');
  }

  const message = {
    token: token,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.data,
  };

  try {
    const response = await adminMessaging.send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send notification.');
  }
}

/**
 * Sends the same notification to multiple devices.
 * @param tokens An array of FCM registration tokens.
 * @param payload The notification content.
 */
export async function sendMulticastNotification(tokens: string[], payload: NotificationPayload) {
  if (!tokens || tokens.length === 0) {
    return { successCount: 0, failureCount: 0 };
  }

  const message = {
    tokens: tokens,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.data,
  };

  try {
    const response = await adminMessaging.sendEachForMulticast(message);
    console.log(`${response.successCount} messages were sent successfully`);
    return response;
  } catch (error) {
    console.error('Error sending multicast message:', error);
    throw new Error('Failed to send multicast notification.');
  }
}

// Notification types for your app
export enum NotificationTypes {
  NEW_MESSAGE = 'new_message',
  BARGAIN_OFFER = 'bargain_offer',
  BARGAIN_ACCEPTED = 'bargain_accepted',
  BARGAIN_REJECTED = 'bargain_rejected',
  ORDER_STATUS = 'order_status',
  DELIVERY_UPDATE = 'delivery_update'
}
