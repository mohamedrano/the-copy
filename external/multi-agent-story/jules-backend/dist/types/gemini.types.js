export class GeminiError extends Error {
    code;
    duration;
    constructor(message, code, duration) {
        super(message);
        this.name = 'GeminiError';
        this.code = code;
        this.duration = duration;
    }
}
//# sourceMappingURL=gemini.types.js.map