export declare class JulesServer {
    private fastify;
    private io;
    private prisma;
    private geminiPool;
    private sessionService;
    private apiKeyService;
    private agentService;
    private ideaService;
    private reviewService;
    private tournamentService;
    private decisionService;
    private orchestratorService;
    private connectionManager;
    private eventHandlers;
    constructor();
    private initializeServices;
    private initializeWebSocket;
    registerPlugins(): Promise<void>;
    registerRoutes(): Promise<void>;
    registerHooks(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    setupGracefulShutdown(): void;
}
export default JulesServer;
//# sourceMappingURL=server.d.ts.map