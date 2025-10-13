import { Server as SocketIOServer, Socket } from 'socket.io';
import { EventEmitter } from 'events';
export interface AuthenticatedSocket extends Socket {
    userId?: string;
    sessionId?: string;
}
export declare class ConnectionManager extends EventEmitter {
    private io;
    private connections;
    private sessionConnections;
    constructor(io: SocketIOServer);
    private setupEventHandlers;
    private handleConnection;
    private authenticateSocket;
    private joinSession;
    private leaveSession;
    private handleDisconnection;
    broadcastToSession(sessionId: string, event: string, data: any): void;
    broadcastToUser(userId: string, event: string, data: any): void;
    broadcastToAll(event: string, data: any): void;
    getSessionConnections(sessionId: string): AuthenticatedSocket[];
    getSessionUserCount(sessionId: string): number;
    getUserConnections(userId: string): AuthenticatedSocket[];
    getConnectionStats(): any;
    cleanup(): void;
}
//# sourceMappingURL=connection-manager.d.ts.map