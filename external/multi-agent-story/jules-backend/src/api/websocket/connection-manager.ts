import { Server as SocketIOServer, Socket } from "socket.io";
import { logger } from "../../utils/logger";
import { EventEmitter } from "events";

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  sessionId?: string;
}

export class ConnectionManager extends EventEmitter {
  private io: SocketIOServer;
  private connections: Map<string, AuthenticatedSocket> = new Map();
  private sessionConnections: Map<string, Set<string>> = new Map();

  constructor(io: SocketIOServer) {
    super();
    this.io = io;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: AuthenticatedSocket): void {
    logger.info("New WebSocket connection", { socketId: socket.id });

    socket.on("authenticate", (data: { userId: string; token?: string }) => {
      this.authenticateSocket(socket, data);
    });

    socket.on("join_session", (data: { sessionId: string }) => {
      this.joinSession(socket, data.sessionId);
    });

    socket.on("leave_session", (data: { sessionId: string }) => {
      this.leaveSession(socket, data.sessionId);
    });

    socket.on("disconnect", () => {
      this.handleDisconnection(socket);
    });

    socket.on("error", (error) => {
      logger.error("Socket error", { socketId: socket.id, error });
    });
  }

  private authenticateSocket(
    socket: AuthenticatedSocket,
    data: { userId: string; token?: string },
  ): void {
    try {
      // TODO: Implement JWT token validation
      socket.userId = data.userId;
      socket.emit("authenticated", { success: true });

      logger.info("Socket authenticated", {
        socketId: socket.id,
        userId: data.userId,
      });
    } catch (error) {
      logger.error("Socket authentication failed", {
        socketId: socket.id,
        error,
      });
      socket.emit("authenticated", {
        success: false,
        error: "Authentication failed",
      });
    }
  }

  private joinSession(socket: AuthenticatedSocket, sessionId: string): void {
    if (!socket.userId) {
      socket.emit("error", { message: "Not authenticated" });
      return;
    }

    try {
      socket.sessionId = sessionId;

      // Add to session connections
      if (!this.sessionConnections.has(sessionId)) {
        this.sessionConnections.set(sessionId, new Set());
      }
      this.sessionConnections.get(sessionId)!.add(socket.id);

      // Store connection
      this.connections.set(socket.id, socket);

      // Join socket.io room
      socket.join(`session:${sessionId}`);

      logger.info("Socket joined session", {
        socketId: socket.id,
        sessionId,
        userId: socket.userId,
      });

      socket.emit("session_joined", { sessionId, success: true });

      // Notify other clients in the session
      socket.to(`session:${sessionId}`).emit("user_joined", {
        userId: socket.userId,
        socketId: socket.id,
      });
    } catch (error) {
      logger.error("Failed to join session", {
        socketId: socket.id,
        sessionId,
        error,
      });
      socket.emit("session_joined", {
        sessionId,
        success: false,
        error: error.message,
      });
    }
  }

  private leaveSession(socket: AuthenticatedSocket, sessionId: string): void {
    try {
      // Remove from session connections
      const sessionSockets = this.sessionConnections.get(sessionId);
      if (sessionSockets) {
        sessionSockets.delete(socket.id);
        if (sessionSockets.size === 0) {
          this.sessionConnections.delete(sessionId);
        }
      }

      // Leave socket.io room
      socket.leave(`session:${sessionId}`);

      logger.info("Socket left session", {
        socketId: socket.id,
        sessionId,
        userId: socket.userId,
      });

      socket.emit("session_left", { sessionId, success: true });

      // Notify other clients in the session
      socket.to(`session:${sessionId}`).emit("user_left", {
        userId: socket.userId,
        socketId: socket.id,
      });
    } catch (error) {
      logger.error("Failed to leave session", {
        socketId: socket.id,
        sessionId,
        error,
      });
    }
  }

  private handleDisconnection(socket: AuthenticatedSocket): void {
    logger.info("Socket disconnected", {
      socketId: socket.id,
      userId: socket.userId,
      sessionId: socket.sessionId,
    });

    // Clean up session connections
    if (socket.sessionId) {
      const sessionSockets = this.sessionConnections.get(socket.sessionId);
      if (sessionSockets) {
        sessionSockets.delete(socket.id);
        if (sessionSockets.size === 0) {
          this.sessionConnections.delete(socket.sessionId);
        }
      }

      // Notify other clients in the session
      socket.to(`session:${socket.sessionId}`).emit("user_disconnected", {
        userId: socket.userId,
        socketId: socket.id,
      });
    }

    // Remove connection
    this.connections.delete(socket.id);

    this.emit("disconnection", {
      socketId: socket.id,
      userId: socket.userId,
      sessionId: socket.sessionId,
    });
  }

  // Broadcast methods
  broadcastToSession(sessionId: string, event: string, data: any): void {
    this.io.to(`session:${sessionId}`).emit(event, data);
    logger.info("Broadcasted to session", { sessionId, event });
  }

  broadcastToUser(userId: string, event: string, data: any): void {
    const userSockets = Array.from(this.connections.values()).filter(
      (socket) => socket.userId === userId,
    );

    for (const socket of userSockets) {
      socket.emit(event, data);
    }

    logger.info("Broadcasted to user", {
      userId,
      event,
      socketCount: userSockets.length,
    });
  }

  broadcastToAll(event: string, data: any): void {
    this.io.emit(event, data);
    logger.info("Broadcasted to all", { event });
  }

  // Session management
  getSessionConnections(sessionId: string): AuthenticatedSocket[] {
    const socketIds = this.sessionConnections.get(sessionId) || new Set();
    return Array.from(socketIds)
      .map((socketId) => this.connections.get(socketId))
      .filter((socket) => socket !== undefined) as AuthenticatedSocket[];
  }

  getSessionUserCount(sessionId: string): number {
    const connections = this.getSessionConnections(sessionId);
    const uniqueUsers = new Set(connections.map((socket) => socket.userId));
    return uniqueUsers.size;
  }

  getUserConnections(userId: string): AuthenticatedSocket[] {
    return Array.from(this.connections.values()).filter(
      (socket) => socket.userId === userId,
    );
  }

  // Statistics
  getConnectionStats(): any {
    return {
      totalConnections: this.connections.size,
      activeSessions: this.sessionConnections.size,
      connectionsBySession: Object.fromEntries(
        Array.from(this.sessionConnections.entries()).map(
          ([sessionId, sockets]) => [
            sessionId,
            {
              connectionCount: sockets.size,
              users: Array.from(sockets)
                .map((socketId) => this.connections.get(socketId)?.userId)
                .filter((userId) => userId !== undefined),
            },
          ],
        ),
      ),
    };
  }

  // Cleanup
  cleanup(): void {
    logger.info("Cleaning up connection manager");
    this.connections.clear();
    this.sessionConnections.clear();
  }
}
