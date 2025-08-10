# Real-time Chat System API Documentation

## Overview

The Arizon chat system provides real-time messaging capabilities with WebSocket support, role-based access control, and comprehensive chat room management. Built with Next.js, TypeScript, Prisma, and WebSockets.

## Features

- **Real-time messaging** with WebSocket connections
- **Multiple chat room types**: Direct messages, group chats, channels, support chats
- **Role-based permissions** integrated with RBAC system
- **Message features**: Text, images, files, replies, reactions
- **Typing indicators** and read receipts
- **User presence** tracking (online/offline status)
- **Room management**: Join/leave, capacity limits, private rooms
- **Message history** with pagination
- **Comprehensive moderation** tools

## Database Schema

### Chat Room Types
- `DIRECT` - 1-on-1 private conversations
- `GROUP` - Small group conversations
- `CHANNEL` - Large public or private channels
- `SUPPORT` - Customer support chats

### Participant Roles
- `OWNER` - Full control over the room
- `ADMIN` - Administrative privileges
- `MODERATOR` - Message moderation capabilities
- `MEMBER` - Regular participant

### Message Types
- `TEXT` - Plain text messages
- `IMAGE` - Image attachments
- `FILE` - File attachments
- `SYSTEM` - System notifications
- `VOICE` - Voice messages
- `VIDEO` - Video messages

## WebSocket Connection

### Connection Setup

```javascript
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling']
})

// Authenticate the connection
socket.emit('authenticate', { token: 'your-jwt-token' })

socket.on('authenticated', (data) => {
  console.log('Authenticated:', data.userId)
})

socket.on('authentication_error', (error) => {
  console.error('Auth error:', error.message)
})
```

### WebSocket Events

#### Connection Events
```javascript
// Connection established
socket.on('connection', () => {
  console.log('Connected to server')
})

// Connection lost
socket.on('disconnect', () => {
  console.log('Disconnected from server')
})
```

#### Room Management
```javascript
// Join a chat room
socket.emit('join_room', { roomId: 'room_id_here' })

socket.on('room_joined', (data) => {
  console.log('Joined room:', data.roomId, data.room)
})

// Leave a chat room
socket.emit('leave_room', { roomId: 'room_id_here' })

socket.on('room_left', (data) => {
  console.log('Left room:', data.roomId)
})

// Room errors
socket.on('room_error', (error) => {
  console.error('Room error:', error.message)
})
```

#### Messaging
```javascript
// Send a message
socket.emit('send_message', {
  roomId: 'room_id_here',
  content: 'Hello, world!',
  type: 'TEXT',
  replyToId: 'optional_message_id', // For replies
  attachments: { /* optional file data */ }
})

// Message sent confirmation
socket.on('message_sent', (data) => {
  console.log('Message sent:', data.message)
})

// Receive new messages
socket.on('new_message', (data) => {
  console.log('New message:', data.message)
  // Update UI with new message
})

// Message errors
socket.on('message_error', (error) => {
  console.error('Message error:', error.message)
})
```

#### Typing Indicators
```javascript
// Start typing
socket.emit('typing_start', { roomId: 'room_id_here' })

// Stop typing
socket.emit('typing_stop', { roomId: 'room_id_here' })

// Other users typing
socket.on('user_typing', (data) => {
  console.log(`${data.userEmail} is typing in ${data.roomId}`)
})

socket.on('user_stopped_typing', (data) => {
  console.log(`${data.userEmail} stopped typing in ${data.roomId}`)
})
```

#### Read Receipts
```javascript
// Mark messages as read
socket.emit('mark_read', { roomId: 'room_id_here' })

socket.on('messages_read', (data) => {
  if (data.userId) {
    console.log(`User ${data.userId} read messages in ${data.roomId}`)
  } else {
    console.log('Messages marked as read')
  }
})
```

#### User Presence
```javascript
// User came online
socket.on('user_online', (data) => {
  console.log(`${data.userEmail} came online in ${data.roomId}`)
})

// User went offline
socket.on('user_offline', (data) => {
  console.log(`${data.userEmail} went offline in ${data.roomId}`)
})

// Room users updated
socket.on('room_users_update', (data) => {
  console.log(`Room ${data.roomId} users:`, data.users)
})
```

## REST API Endpoints

### Chat Rooms

#### GET /api/chat/rooms
Get all chat rooms for the authenticated user.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** `chats:read`

**Response:**
```json
{
  "success": true,
  "data": {
    "chatRooms": [
      {
        "id": "room_id",
        "name": "General Chat",
        "description": "Main discussion room",
        "type": "GROUP",
        "isPrivate": false,
        "maxMembers": 100,
        "isActive": true,
        "createdBy": "user_id",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "participantCount": 25,
        "lastMessage": {
          "id": "message_id",
          "content": "Hello everyone!",
          "sentAt": "2024-01-01T00:00:00.000Z",
          "sender": {
            "id": "user_id",
            "firstName": "John",
            "lastName": "Doe",
            "username": "johndoe"
          }
        }
      }
    ]
  }
}
```

#### POST /api/chat/rooms
Create a new chat room.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** `chats:create`

**Request Body:**
```json
{
  "name": "New Chat Room",
  "description": "A new chat room for discussions",
  "type": "GROUP",
  "isPrivate": false,
  "maxMembers": 50,
  "participantIds": ["user_id_1", "user_id_2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chatRoom": {
      "id": "new_room_id",
      "name": "New Chat Room",
      "type": "GROUP",
      "participantCount": 3
    }
  },
  "message": "Chat room created successfully"
}
```

#### GET /api/chat/rooms/{id}
Get specific chat room details.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** Must be participant or have `chats:read`

#### POST /api/chat/rooms/{id}
Join a chat room.

**Headers:** `Authorization: Bearer <token>`

#### DELETE /api/chat/rooms/{id}
Leave a chat room.

**Headers:** `Authorization: Bearer <token>`

### Messages

#### GET /api/chat/rooms/{id}/messages
Get messages for a chat room with pagination.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** Must be participant

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Messages per page (default: 50, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "message_id",
        "content": "Hello everyone!",
        "type": "TEXT",
        "senderId": "user_id",
        "roomId": "room_id",
        "replyToId": null,
        "isEdited": false,
        "isDeleted": false,
        "sentAt": "2024-01-01T00:00:00.000Z",
        "sender": {
          "id": "user_id",
          "firstName": "John",
          "lastName": "Doe",
          "username": "johndoe",
          "avatar": "https://example.com/avatar.jpg"
        },
        "replyTo": null,
        "reactions": [
          {
            "emoji": "👍",
            "count": 3,
            "users": ["user1", "user2", "user3"]
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "hasMore": false
    }
  }
}
```

#### POST /api/chat/rooms/{id}/messages
Send a message to a chat room.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** Must be participant

**Request Body:**
```json
{
  "content": "Hello everyone!",
  "type": "TEXT",
  "replyToId": "optional_message_id",
  "attachments": {
    "files": [
      {
        "name": "document.pdf",
        "url": "https://example.com/file.pdf",
        "size": 1024000,
        "type": "application/pdf"
      }
    ]
  }
}
```

## Permissions

### Chat-Related Permissions

| Permission | Resource | Action | Description |
|------------|----------|--------|-------------|
| Create Chats | `chats` | `create` | Create new chat rooms |
| Read Chats | `chats` | `read` | View chat rooms and messages |
| Update Chats | `chats` | `update` | Modify chat room settings |
| Delete Chats | `chats` | `delete` | Remove chat rooms |
| Join Private Chats | `chats` | `join_private` | Join private chat rooms |
| Moderate Chats | `chats` | `moderate` | Moderate messages and users |

### Default Role Permissions

- **Client (Default)**: `chats:read`, `chats:create` (limited)
- **Admin**: All chat permissions
- **Business/Supplier**: `chats:read`, `chats:create`, `chats:update`
- **Support Roles**: `chats:read`, `chats:create`, `chats:moderate`

## Client Integration Examples

### React Chat Component

```jsx
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

function ChatRoom({ roomId, token }) {
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const newSocket = io('http://localhost:3000')
    
    // Authenticate
    newSocket.emit('authenticate', { token })
    
    newSocket.on('authenticated', () => {
      // Join the room
      newSocket.emit('join_room', { roomId })
    })
    
    newSocket.on('room_joined', () => {
      console.log('Joined room successfully')
    })
    
    newSocket.on('new_message', (data) => {
      setMessages(prev => [...prev, data.message])
    })
    
    newSocket.on('user_typing', (data) => {
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 3000)
    })
    
    setSocket(newSocket)
    
    return () => newSocket.close()
  }, [roomId, token])

  const sendMessage = () => {
    if (socket && newMessage.trim()) {
      socket.emit('send_message', {
        roomId,
        content: newMessage,
        type: 'TEXT'
      })
      setNewMessage('')
    }
  }

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing_start', { roomId })
    }
  }

  return (
    <div className="chat-room">
      <div className="messages">
        {messages.map(message => (
          <div key={message.id} className="message">
            <strong>{message.sender.firstName}:</strong> {message.content}
          </div>
        ))}
        {isTyping && <div className="typing">Someone is typing...</div>}
      </div>
      
      <div className="message-input">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          onFocus={handleTyping}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}
```

### Message History Loading

```javascript
async function loadMessageHistory(roomId, page = 1) {
  const response = await fetch(`/api/chat/rooms/${roomId}/messages?page=${page}&limit=50`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  const data = await response.json()
  return data.data
}
```

## Error Handling

### Common Error Codes

- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `CHAT_ROOM_NOT_FOUND` - Chat room doesn't exist or no access
- `NOT_PARTICIPANT` - User is not a participant in the room
- `ROOM_INACTIVE` - Chat room is deactivated
- `JOIN_ROOM_FAILED` - Failed to join room (capacity, permissions, etc.)
- `MESSAGE_SEND_FAILED` - Failed to send message
- `INVALID_PARTICIPANTS` - Invalid participant configuration

### WebSocket Error Handling

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error)
})

socket.on('authentication_error', (error) => {
  console.error('Authentication failed:', error.message)
  // Redirect to login or refresh token
})

socket.on('room_error', (error) => {
  console.error('Room error:', error.message)
  // Handle room-specific errors
})

socket.on('message_error', (error) => {
  console.error('Message error:', error.message)
  // Handle message sending errors
})
```

## Performance Considerations

- **Message Pagination**: Load messages in chunks to avoid overwhelming the client
- **Connection Management**: Properly handle reconnections and cleanup
- **Typing Debouncing**: Limit typing indicator frequency
- **Room Limits**: Enforce reasonable participant limits for performance
- **Message Retention**: Consider implementing message archiving for old conversations

## Security Features

- **Authentication Required**: All chat operations require valid JWT tokens
- **Permission-Based Access**: RBAC integration for fine-grained control
- **Private Room Protection**: Private rooms only accessible to participants
- **Input Validation**: All messages and room data validated
- **Rate Limiting**: WebSocket events are rate-limited to prevent abuse
- **Content Moderation**: Support for message moderation and filtering

## Deployment Notes

### Environment Variables
```env
# WebSocket CORS settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Database connection (already configured)
DATABASE_URL=postgresql://...
```

### Server Setup
The WebSocket server is automatically initialized when the Next.js server starts. No additional configuration is required for basic operation.

### Scaling Considerations
For production deployments with multiple server instances, consider:
- Redis adapter for Socket.IO for multi-server support
- Database connection pooling for chat operations
- CDN for file attachments
- Message queue for high-volume scenarios
