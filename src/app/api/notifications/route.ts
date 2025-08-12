import { NextRequest, NextResponse } from 'next/server';
import { sendNotification, NotificationPayload } from '@/lib/firebase/notifications';
import { createErrorResponse } from '../../../lib/utils';

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Send a test notification
 *     description: Sends a push notification to a specific device using its FCM token. This is a test endpoint and should be secured in a production environment.
 *     tags:
 *       - Notifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - title
 *               - body
 *             properties:
 *               token:
 *                 type: string
 *                 description: The FCM registration token of the target device.
 *                 example: "c_..."
 *               title:
 *                 type: string
 *                 description: The title of the notification.
 *                 example: "Test Notification"
 *               body:
 *                 type: string
 *                 description: The body of the notification.
 *                 example: "This is a test from the API."
 *               data:
 *                 type: object
 *                 description: Optional key-value pairs for custom data.
 *                 example: { "url": "/orders/123" }
 *     responses:
 *       200:
 *         description: Notification sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: 
 *                   type: string
 *                 response: 
 *                   type: object
 *       400:
 *         description: Bad request, missing required fields.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: NextRequest) {
  try {
    const { token, title, body, data } = await request.json();

    if (!token || !title || !body) {
      return createErrorResponse('Missing required fields: token, title, and body', 400);
    }

    const payload: NotificationPayload = { title, body, data };

    const response = await sendNotification(token, payload);

    return NextResponse.json({ message: 'Notification sent successfully', response }, { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/notifications:', error);
    return createErrorResponse(error.message || 'Failed to send notification', 500);
  }
}
