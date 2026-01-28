type ChatEvent = {
    type: 'message' | 'conversation_update' | 'read_update' | 'clear';
    data: any;
    userIds: string[];
};

type Connection = {
    userId: string;
    send: (event: ChatEvent) => void;
};

// Use global to persist connections across hot reloads in development
const globalForChat = global as unknown as {
    chatConnections: Connection[] | undefined;
};

const connections: Connection[] = globalForChat.chatConnections ?? [];

if (process.env.NODE_ENV !== 'production') {
    globalForChat.chatConnections = connections;
}

export function addConnection(userId: string, send: (event: ChatEvent) => void) {
    connections.push({ userId, send });
    console.log(`SSE: New connection for user ${userId}. Total active: ${connections.length}`);
}

export function removeConnection(send: (event: ChatEvent) => void) {
    const index = connections.findIndex(c => c.send === send);
    if (index !== -1) {
        const conn = connections[index];
        connections.splice(index, 1);
        console.log(`SSE: Connection closed for user ${conn.userId}. Total active: ${connections.length}`);
    }
}

export function broadcastChatEvent(event: ChatEvent) {
    console.log(`SSE: Broadcasting ${event.type} to users: ${event.userIds.join(', ')}`);
    connections.forEach(conn => {
        if (event.userIds.includes(conn.userId)) {
            conn.send(event);
        }
    });
}
