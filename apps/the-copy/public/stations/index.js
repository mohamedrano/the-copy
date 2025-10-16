var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// server/index.ts
import express2 from "express";
import compression from "compression";

// server/routes.ts
import { createServer } from "http";
import { ZodError } from "zod";

// shared/schema.ts
import { z } from "zod";
var HTML_TAG_REGEX = /<[^>]*>/g;
var CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F]+/g;
function sanitizeScalar(value) {
  return value.replace(HTML_TAG_REGEX, "").replace(CONTROL_CHAR_REGEX, "").replace(/\0/g, "").trim();
}
var sanitizedString = ({ min, minMessage, max, maxMessage }) => z.string().trim().transform(sanitizeScalar).refine((value) => value.length >= min, {
  message: minMessage
}).refine((value) => typeof max === "number" ? value.length <= max : true, {
  message: maxMessage ?? "\u0627\u0644\u0646\u0635 \u064A\u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647"
});
var analyzeTextSchema = z.object({
  fullText: sanitizedString({
    min: 100,
    minMessage: "\u0627\u0644\u0646\u0635 \u064A\u062C\u0628 \u0623\u0646 \u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 100 \u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644",
    max: 5e5,
    maxMessage: "\u0627\u0644\u0646\u0635 \u064A\u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 (500 \u0623\u0644\u0641 \u062D\u0631\u0641)"
  }),
  projectName: sanitizedString({
    min: 1,
    minMessage: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0645\u0637\u0644\u0648\u0628",
    max: 256,
    maxMessage: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0637\u0648\u064A\u0644 \u062C\u062F\u0627\u064B"
  }),
  proseFilePath: z.preprocess((value) => {
    if (typeof value !== "string") {
      return void 0;
    }
    const sanitized = sanitizeScalar(value);
    return sanitized.length === 0 ? void 0 : sanitized;
  }, z.string().max(1024, "\u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0644\u0641 \u0637\u0648\u064A\u0644 \u062C\u062F\u0627\u064B").optional())
});
var characterAnalysisSchema = z.object({
  personalityTraits: z.string(),
  motivationsGoals: z.string(),
  keyRelationshipsBrief: z.string(),
  narrativeFunction: z.string(),
  potentialArcObservation: z.string()
});
var relationshipAnalysisSchema = z.object({
  keyRelationships: z.array(z.object({
    characters: z.tuple([z.string(), z.string()]),
    dynamic: z.string(),
    narrativeImportance: z.string()
  }))
});
var narrativeStyleSchema = z.object({
  overallTone: z.string(),
  pacingAnalysis: z.string(),
  languageStyle: z.string()
});
var station1ResponseSchema = z.object({
  majorCharacters: z.array(z.string()),
  characterAnalysis: z.record(z.string(), characterAnalysisSchema),
  relationshipAnalysis: relationshipAnalysisSchema,
  narrativeStyleAnalysis: narrativeStyleSchema,
  metadata: z.object({
    analysisTimestamp: z.string(),
    status: z.enum(["Success", "Partial", "Failed"])
  })
});

// server/run-all-stations.ts
import * as fs2 from "fs";
import * as path3 from "path";

// server/services/ai/gemini-service.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// server/utils/logger.ts
import * as winston from "winston";
import * as fs from "fs";
import * as path from "path";
var { combine, timestamp, printf, colorize, errors } = winston.format;
var logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}
var customFormat = printf(({ level, message, timestamp: timestamp2, stack, ...meta }) => {
  let log = `${timestamp2} [${level}]: ${message}`;
  if (Object.keys(meta).length > 0) {
    log += ` ${JSON.stringify(meta)}`;
  }
  if (stack) {
    log += `
${stack}`;
  }
  return log;
});
var logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    customFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        customFormat
      )
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880,
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880,
      maxFiles: 5
    })
  ],
  exitOnError: false
});
var logger_default = logger;

// server/services/ai/gemini-service.ts
var GeminiModel = /* @__PURE__ */ ((GeminiModel2) => {
  GeminiModel2["PRO"] = "gemini-2.5-pro";
  GeminiModel2["FLASH"] = "gemini-2.0-flash-lite";
  return GeminiModel2;
})(GeminiModel || {});
var GeminiService = class {
  constructor(config) {
    this.config = config;
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.validateModels();
  }
  validateModels() {
    const allowedModels = Object.values(GeminiModel);
    if (!allowedModels.includes(this.config.defaultModel)) {
      throw new Error(
        `Invalid model: ${this.config.defaultModel}. Only ${allowedModels.join(", ")} are allowed.`
      );
    }
    if (this.config.fallbackModel && !allowedModels.includes(this.config.fallbackModel)) {
      throw new Error(
        `Invalid fallback model: ${this.config.fallbackModel}. Only ${allowedModels.join(", ")} are allowed.`
      );
    }
  }
  async generate(request) {
    this.validateModels();
    const primaryModel = request.model ?? this.config.defaultModel;
    try {
      return await this.performRequest({ ...request, model: primaryModel });
    } catch (primaryError) {
      if (this.config.fallbackModel && this.config.fallbackModel !== primaryModel) {
        logger_default.warn("Primary Gemini model failed. Falling back to secondary model.", {
          primaryModel,
          fallbackModel: this.config.fallbackModel
        });
        return this.performRequest({ ...request, model: this.config.fallbackModel });
      }
      return this.handleError(primaryError, { ...request, model: primaryModel });
    }
  }
  async performRequest(request) {
    const startTime = Date.now();
    const modelName = request.model ?? this.config.defaultModel;
    const model = this.genAI.getGenerativeModel({ model: modelName });
    const fullPrompt = `${request.systemInstruction || ""}

Context: ${request.context || "N/A"}

Prompt: ${request.prompt}`;
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();
    const usage = {
      promptTokens: fullPrompt.length / 4,
      completionTokens: text.length / 4,
      totalTokens: (fullPrompt.length + text.length) / 4
    };
    return {
      model: modelName,
      content: this.parseResponse(text, request),
      usage,
      metadata: {
        timestamp: /* @__PURE__ */ new Date(),
        latency: Date.now() - startTime
      }
    };
  }
  parseResponse(responseText, request) {
    const parseResult = this.extractJsonPayload(responseText);
    if (!parseResult.success || parseResult.value === void 0) {
      logger_default.warn("Gemini response did not contain valid JSON payload.", {
        warnings: parseResult.warnings
      });
      return this.buildRawFallback(responseText);
    }
    const payload = parseResult.value;
    const { validator, allowPartial, onPartialFallback } = request;
    if (validator) {
      if (validator(payload)) {
        return payload;
      }
      if (allowPartial) {
        const partial = onPartialFallback?.(payload) ?? this.sanitisePartialPayload(payload);
        if (partial !== void 0) {
          logger_default.warn("Gemini response failed validation; returning partial payload.", {
            warnings: parseResult.warnings
          });
          return partial;
        }
      }
      throw new Error("Gemini response failed validation.");
    }
    if (this.isStructuredJson(payload)) {
      return payload;
    }
    logger_default.warn("Gemini response JSON was not an object or array.", {
      warnings: parseResult.warnings
    });
    return this.buildRawFallback(responseText);
  }
  async handleError(error, request) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger_default.error(`Failed to generate content with model ${request.model}`, {
      error: message
    });
    throw error instanceof Error ? error : new Error(message);
  }
  extractJsonPayload(responseText) {
    const warnings = [];
    const fencedMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    const candidate = fencedMatch?.[1] ?? responseText;
    const attempts = [candidate, this.repairTruncatedJson(candidate)];
    for (const attempt of attempts) {
      if (attempt === void 0) {
        continue;
      }
      try {
        return {
          success: true,
          value: JSON.parse(attempt),
          warnings: warnings.filter(Boolean)
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        warnings.push(message);
      }
    }
    return { success: false, warnings };
  }
  repairTruncatedJson(payload) {
    const lastObject = payload.lastIndexOf("}");
    const lastArray = payload.lastIndexOf("]");
    const lastIndex = Math.max(lastObject, lastArray);
    if (lastIndex === -1) {
      return void 0;
    }
    return payload.slice(0, lastIndex + 1);
  }
  sanitisePartialPayload(value) {
    if (Array.isArray(value)) {
      return value.filter((item) => item !== void 0 && item !== null);
    }
    if (this.isStructuredJson(value)) {
      return Object.fromEntries(
        Object.entries(value).filter(
          ([, itemValue]) => itemValue !== void 0
        )
      );
    }
    return void 0;
  }
  isStructuredJson(value) {
    if (Array.isArray(value)) {
      return true;
    }
    return typeof value === "object" && value !== null;
  }
  buildRawFallback(responseText) {
    return { raw: responseText };
  }
};

// server/core/pipeline/base-station.ts
var BaseStation = class {
  constructor(config, geminiService2) {
    this.config = config;
    this.geminiService = geminiService2;
    this.cache = /* @__PURE__ */ new Map();
  }
  async execute(input) {
    const startTime = Date.now();
    const safeInputSnapshot = this.extractRequiredData(input);
    try {
      this.validateInput(input);
      const cachedResult = this.checkCache(input);
      if (cachedResult) {
        return {
          output: cachedResult,
          metadata: this.createMetadata(startTime, true)
        };
      }
      const output = await this.process(input);
      this.validateOutput(output);
      this.saveToCache(input, output);
      return {
        output,
        metadata: this.createMetadata(startTime, false)
      };
    } catch (error) {
      return this.handleError(error, startTime, safeInputSnapshot);
    }
  }
  validateInput(input) {
    if (!this.config.inputValidation(input)) {
      throw new Error(
        `Invalid input for ${this.config.stationName}`
      );
    }
  }
  validateOutput(output) {
    if (!this.config.outputValidation(output)) {
      throw new Error(
        `Invalid output from ${this.config.stationName}`
      );
    }
  }
  checkCache(input) {
    if (!this.config.cacheEnabled) return null;
    const cacheKey = this.generateCacheKey(input);
    return this.cache.get(cacheKey) || null;
  }
  saveToCache(input, output) {
    if (!this.config.cacheEnabled) return;
    const cacheKey = this.generateCacheKey(input);
    this.cache.set(cacheKey, output);
  }
  generateCacheKey(input) {
    return JSON.stringify(input);
  }
  createMetadata(startTime, cacheHit) {
    return {
      executionTime: Date.now() - startTime,
      timestamp: /* @__PURE__ */ new Date(),
      modelUsed: "gemini-2.5-pro" /* PRO */,
      cacheHit,
      errorOccurred: false
    };
  }
  handleError(error, startTime, safeInputSnapshot) {
    logger_default.error(`Error in ${this.config.stationName}`, {
      station: this.config.stationName,
      stationNumber: this.config.stationNumber,
      input: safeInputSnapshot,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : void 0
    });
    return {
      output: this.getErrorFallback(),
      metadata: {
        ...this.createMetadata(startTime, false),
        errorOccurred: true,
        errorDetails: error instanceof Error ? error.message : "Unknown error"
      }
    };
  }
};

// server/stations/station1/station1-text-analysis.ts
var Station1TextAnalysis = class extends BaseStation {
  constructor(config, geminiService2) {
    super(config, geminiService2);
  }
  async process(input) {
    const [
      majorCharacters,
      relationshipAnalysis,
      narrativeStyle
    ] = await Promise.all([
      this.identifyMajorCharacters(input.fullText),
      this.analyzeRelationships(input.fullText),
      this.analyzeNarrativeStyle(input.fullText)
    ]);
    const characterAnalysis = await this.analyzeCharactersInDepth(
      input.fullText,
      majorCharacters
    );
    return {
      majorCharacters,
      characterAnalysis,
      relationshipAnalysis,
      narrativeStyleAnalysis: narrativeStyle,
      metadata: {
        analysisTimestamp: /* @__PURE__ */ new Date(),
        status: "Success"
      }
    };
  }
  async identifyMajorCharacters(fullText) {
    const prompt = `
\u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u0646\u0635 \u0627\u0644\u0633\u0631\u062F\u064A \u0627\u0644\u0643\u0627\u0645\u0644 \u0627\u0644\u0645\u0631\u0641\u0642\u060C \u0642\u0645 \u0628\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0646\u0635 \u0648\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0634\u062E\u0635\u064A\u0627\u062A \u0627\u0644\u062A\u064A \u062A\u0628\u062F\u0648 **\u0627\u0644\u0623\u0643\u062B\u0631 \u0645\u0631\u0643\u0632\u064A\u0629 \u0648\u0623\u0647\u0645\u064A\u0629** \u0644\u0644\u062D\u0628\u0643\u0629 \u0648\u062A\u0637\u0648\u0631 \u0627\u0644\u0623\u062D\u062F\u0627\u062B. 
\u0631\u0643\u0632 \u0639\u0644\u0649 \u0627\u0644\u0634\u062E\u0635\u064A\u0627\u062A \u0627\u0644\u062A\u064A \u0644\u0647\u0627 \u0623\u062F\u0648\u0627\u0631 \u0641\u0627\u0639\u0644\u0629\u060C \u062F\u0648\u0627\u0641\u0639 \u0648\u0627\u0636\u062D\u0629\u060C \u0648\u062A\u0638\u0647\u0631 \u0628\u0634\u0643\u0644 \u0645\u062A\u0643\u0631\u0631 \u0648\u0645\u0624\u062B\u0631.
\u0623\u0639\u062F \u0642\u0627\u0626\u0645\u0629 \u062A\u062A\u0636\u0645\u0646 **\u0645\u0627 \u0628\u064A\u0646 3 \u0625\u0644\u0649 7 \u0634\u062E\u0635\u064A\u0627\u062A** \u062A\u0639\u062A\u0628\u0631\u0647\u0627 \u0627\u0644\u0623\u0643\u062B\u0631 \u0623\u0647\u0645\u064A\u0629.

\u0623\u0639\u062F \u0627\u0644\u0625\u062C\u0627\u0628\u0629 **\u062D\u0635\u0631\u064A\u0627\u064B** \u0628\u062A\u0646\u0633\u064A\u0642 JSON \u0635\u0627\u0644\u062D:
{
  "major_characters": ["\u0627\u0633\u0645 \u0627\u0644\u0634\u062E\u0635\u064A\u0629 1", "\u0627\u0633\u0645 \u0627\u0644\u0634\u062E\u0635\u064A\u0629 2", ...]
}
    `;
    const result = await this.geminiService.generate({
      prompt,
      context: fullText.substring(0, 3e4),
      model: "gemini-2.5-pro" /* PRO */
    });
    return result.content.major_characters ?? [];
  }
  async analyzeCharactersInDepth(fullText, characterNames) {
    const analyses = /* @__PURE__ */ new Map();
    const analysisPromises = characterNames.map(
      (name) => this.analyzeCharacter(fullText, name)
    );
    const results = await Promise.all(analysisPromises);
    characterNames.forEach((name, index) => {
      const result = results[index];
      if (result) {
        analyses.set(name, result);
      }
    });
    return analyses;
  }
  async analyzeCharacter(fullText, characterName) {
    const prompt = `
\u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u0646\u0635 \u0627\u0644\u0633\u0631\u062F\u064A \u0627\u0644\u0643\u0627\u0645\u0644 \u0627\u0644\u0645\u0631\u0641\u0642\u060C \u0642\u0645 \u0628\u0625\u062C\u0631\u0627\u0621 \u062A\u062D\u0644\u064A\u0644 **\u0634\u0627\u0645\u0644 \u0648\u0645\u0639\u0645\u0642** \u0644\u0644\u0634\u062E\u0635\u064A\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629: **${characterName}**.

\u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u062C\u0648\u0627\u0646\u0628 \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \u0644\u0647\u0630\u0647 \u0627\u0644\u0634\u062E\u0635\u064A\u0629:
1. \u0627\u0644\u0633\u0645\u0627\u062A \u0627\u0644\u0634\u062E\u0635\u064A\u0629 \u0627\u0644\u0628\u0627\u0631\u0632\u0629 (\u0625\u064A\u062C\u0627\u0628\u064A\u0629 \u0648\u0633\u0644\u0628\u064A\u0629)
2. \u0627\u0644\u062F\u0648\u0627\u0641\u0639 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0648\u0627\u0644\u0623\u0647\u062F\u0627\u0641 (\u0627\u0644\u0638\u0627\u0647\u0631\u0629 \u0648\u0627\u0644\u062E\u0641\u064A\u0629)
3. \u0648\u0635\u0641 \u0645\u0648\u062C\u0632 \u0644\u0623\u0647\u0645 \u0639\u0644\u0627\u0642\u0627\u062A\u0647\u0627 \u0645\u0639 \u0634\u062E\u0635\u064A\u0627\u062A \u0623\u062E\u0631\u0649
4. \u0627\u0644\u062F\u0648\u0631 \u0623\u0648 \u0627\u0644\u0648\u0638\u064A\u0641\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u0641\u064A \u0627\u0644\u0642\u0635\u0629
5. \u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0623\u0648\u0644\u064A\u0629 \u062D\u0648\u0644 \u0642\u0648\u0633 \u0627\u0644\u062A\u0637\u0648\u0631 \u0627\u0644\u0645\u062D\u062A\u0645\u0644

\u0623\u0639\u062F \u0627\u0644\u0625\u062C\u0627\u0628\u0629 **\u062D\u0635\u0631\u064A\u0627\u064B** \u0628\u062A\u0646\u0633\u064A\u0642 JSON \u0635\u0627\u0644\u062D:
{
  "personality_traits": "...",
  "motivations_goals": "...",
  "key_relationships_brief": "...",
  "narrative_function": "...",
  "potential_arc_observation": "..."
}
    `;
    const result = await this.geminiService.generate({
      prompt,
      context: fullText.substring(0, 3e4),
      model: "gemini-2.5-pro" /* PRO */
    });
    return {
      personalityTraits: result.content.personality_traits ?? "N/A",
      motivationsGoals: result.content.motivations_goals ?? "N/A",
      keyRelationshipsBrief: result.content.key_relationships_brief ?? "N/A",
      narrativeFunction: result.content.narrative_function ?? "N/A",
      potentialArcObservation: result.content.potential_arc_observation ?? "N/A"
    };
  }
  async analyzeRelationships(fullText) {
    const prompt = `
\u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u0646\u0635 \u0627\u0644\u0633\u0631\u062F\u064A \u0627\u0644\u0643\u0627\u0645\u0644 \u0627\u0644\u0645\u0631\u0641\u0642\u060C \u0642\u0645 \u0628\u062A\u062D\u0644\u064A\u0644 \u0648\u062A\u062D\u062F\u064A\u062F **\u0627\u0644\u0639\u0644\u0627\u0642\u0627\u062A \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629** \u0628\u064A\u0646 \u0627\u0644\u0634\u062E\u0635\u064A\u0627\u062A.
\u0631\u0643\u0632 \u0639\u0644\u0649 \u0627\u0644\u0639\u0644\u0627\u0642\u0627\u062A \u0627\u0644\u062A\u064A \u0644\u0647\u0627 \u062A\u0623\u062B\u064A\u0631 \u0648\u0627\u0636\u062D \u0639\u0644\u0649 \u0627\u0644\u062D\u0628\u0643\u0629 \u0648\u062A\u0637\u0648\u0631 \u0627\u0644\u0623\u062D\u062F\u0627\u062B.

\u0623\u0639\u062F \u0627\u0644\u0625\u062C\u0627\u0628\u0629 **\u062D\u0635\u0631\u064A\u0627\u064B** \u0628\u062A\u0646\u0633\u064A\u0642 JSON \u0635\u0627\u0644\u062D:
{
  "key_relationships": [
    {
      "characters": ["\u0627\u0644\u0634\u062E\u0635\u064A\u0629 1", "\u0627\u0644\u0634\u062E\u0635\u064A\u0629 2"],
      "dynamic": "\u0648\u0635\u0641 \u062F\u064A\u0646\u0627\u0645\u064A\u0643\u064A\u0629 \u0627\u0644\u0639\u0644\u0627\u0642\u0629",
      "narrative_importance": "\u0623\u0647\u0645\u064A\u0629 \u0627\u0644\u0639\u0644\u0627\u0642\u0629 \u0641\u064A \u0627\u0644\u0633\u0631\u062F"
    }
  ]
}
    `;
    const result = await this.geminiService.generate({
      prompt,
      context: fullText.substring(0, 3e4),
      model: "gemini-2.5-pro" /* PRO */
    });
    return {
      keyRelationships: (result.content.key_relationships ?? []).map((rel) => ({
        characters: rel?.characters ?? ["\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641", "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"],
        dynamic: rel?.dynamic ?? "N/A",
        narrativeImportance: rel?.narrative_importance ?? "N/A"
      }))
    };
  }
  async analyzeNarrativeStyle(fullText) {
    const prompt = `
\u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u0646\u0635 \u0627\u0644\u0633\u0631\u062F\u064A \u0627\u0644\u0643\u0627\u0645\u0644 \u0627\u0644\u0645\u0631\u0641\u0642\u060C \u0642\u0645 \u0628\u062A\u062D\u0644\u064A\u0644 **\u0627\u0644\u0623\u0633\u0644\u0648\u0628 \u0627\u0644\u0633\u0631\u062F\u064A** \u0644\u0644\u0646\u0635.

\u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u062A\u062D\u0644\u064A\u0644:
1. \u0627\u0644\u0646\u063A\u0645\u0629 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A\u0629 \u0644\u0644\u0646\u0635 (\u062F\u0631\u0627\u0645\u064A\u060C \u0643\u0648\u0645\u064A\u062F\u064A\u060C \u062A\u0631\u0627\u062C\u064A\u062F\u064A\u060C \u0625\u0644\u062E)
2. \u062A\u062D\u0644\u064A\u0644 \u0648\u062A\u064A\u0631\u0629 \u0627\u0644\u0633\u0631\u062F (\u0633\u0631\u064A\u0639\u060C \u0628\u0637\u064A\u0621\u060C \u0645\u062A\u0646\u0648\u0639\u060C \u0625\u0644\u062E)
3. \u0623\u0633\u0644\u0648\u0628 \u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u0629 (\u0631\u0633\u0645\u064A\u060C \u0639\u0627\u0645\u064A\u060C \u0634\u0627\u0639\u0631\u064A\u060C \u0625\u0644\u062E)

\u0623\u0639\u062F \u0627\u0644\u0625\u062C\u0627\u0628\u0629 **\u062D\u0635\u0631\u064A\u0627\u064B** \u0628\u062A\u0646\u0633\u064A\u0642 JSON \u0635\u0627\u0644\u062D:
{
  "overall_tone": "...",
  "pacing_analysis": "...",
  "language_style": "..."
}
    `;
    const result = await this.geminiService.generate({
      prompt,
      context: fullText.substring(0, 3e4),
      model: "gemini-2.5-pro" /* PRO */
    });
    return {
      overallTone: result.content.overall_tone ?? "N/A",
      pacingAnalysis: result.content.pacing_analysis ?? "N/A",
      languageStyle: result.content.language_style ?? "N/A"
    };
  }
  extractRequiredData(input) {
    return {
      fullTextLength: input.fullText.length,
      projectName: input.projectName,
      hasProseFilePath: Boolean(input.proseFilePath)
    };
  }
  getErrorFallback() {
    return {
      majorCharacters: [],
      characterAnalysis: /* @__PURE__ */ new Map(),
      relationshipAnalysis: { keyRelationships: [] },
      narrativeStyleAnalysis: {
        overallTone: "Error",
        pacingAnalysis: "Error",
        languageStyle: "Error"
      },
      metadata: {
        analysisTimestamp: /* @__PURE__ */ new Date(),
        status: "Failed"
      }
    };
  }
};

// server/stations/station2/station2-conceptual-analysis.ts
var Station2ConceptualAnalysis = class extends BaseStation {
  constructor(config, geminiService2) {
    super(config, geminiService2);
  }
  async process(input) {
    const context = this.buildContextFromStation1(input.station1Output, input.fullText);
    const [
      storyStatements,
      threeDMap,
      hybridGenreOptions
    ] = await Promise.all([
      this.generateStoryStatements(context),
      this.generate3DMap(context),
      this.generateHybridGenre(context)
    ]);
    const storyStatement = storyStatements[0];
    const hybridGenre = hybridGenreOptions[0];
    const [
      elevatorPitch,
      genreMatrix,
      dynamicTone,
      artisticReferences
    ] = await Promise.all([
      this.generateElevatorPitch(storyStatement || ""),
      this.generateGenreMatrix(hybridGenre || "", context),
      this.generateDynamicTone(hybridGenre || "", context),
      this.generateArtisticReferences(hybridGenre || "", context)
    ]);
    return {
      storyStatement: storyStatement || "",
      threeDMap,
      elevatorPitch: elevatorPitch || "",
      hybridGenre: hybridGenre || "",
      genreContributionMatrix: genreMatrix || {},
      dynamicTone: dynamicTone || "",
      artisticReferences: artisticReferences || [],
      metadata: {
        analysisTimestamp: /* @__PURE__ */ new Date(),
        status: "Success"
      }
    };
  }
  buildContextFromStation1(s1Output, fullText) {
    const relationshipSummary = s1Output.relationshipAnalysis.keyRelationships.map((relationship) => {
      const [source, target] = relationship.characters;
      return `${source} \u2194 ${target}: ${relationship.dynamic} (${relationship.narrativeImportance})`;
    }).join("\n");
    return {
      majorCharacters: s1Output.majorCharacters,
      relationshipSummary: relationshipSummary || "\u0644\u0645 \u064A\u062A\u0645 \u062A\u062D\u062F\u064A\u062F \u0639\u0644\u0627\u0642\u0627\u062A \u0631\u0626\u064A\u0633\u064A\u0629 \u0628\u0639\u062F.",
      narrativeTone: s1Output.narrativeStyleAnalysis.overallTone,
      fullText
    };
  }
  async generateStoryStatements(context) {
    const prompt = `
\u0628\u0635\u0641\u062A\u0643 \u0645\u0633\u0627\u0639\u062F \u0643\u062A\u0627\u0628\u0629 \u0633\u064A\u0646\u0627\u0631\u064A\u0648 \u062E\u0628\u064A\u0631\u060C \u0648\u0645\u0633\u062A\u0646\u062F\u064B\u0627 \u0625\u0644\u0649 \u0645\u0644\u062E\u0635 \u0627\u0644\u0633\u064A\u0646\u0627\u0631\u064A\u0648 \u0627\u0644\u0623\u0648\u0644\u064A \u0648\u0627\u0644\u0646\u0635 \u0627\u0644\u0643\u0627\u0645\u0644 \u0627\u0644\u0645\u0631\u0641\u0642\u064A\u0646\u060C
\u0627\u0642\u062A\u0631\u062D **\u062B\u0644\u0627\u062B\u0629 (3)** \u0628\u062F\u0627\u0626\u0644 \u0645\u062A\u0645\u064A\u0632\u0629 \u0644\u0640 "\u0628\u064A\u0627\u0646 \u0627\u0644\u0642\u0635\u0629" (Story Statement).

\u0643\u0644 \u0628\u064A\u0627\u0646 \u064A\u062C\u0628 \u0623\u0646 \u064A\u062A\u0643\u0648\u0646 \u0645\u0646 **\u0623\u0631\u0628\u0639 \u062C\u0645\u0644**\u060C \u062A\u063A\u0637\u064A:
1. \u0627\u0644\u062D\u062F\u062B \u0627\u0644\u0645\u062D\u0648\u0631\u064A \u0627\u0644\u062C\u0627\u0645\u0639 \u0623\u0648 \u0646\u0642\u0637\u0629 \u0627\u0644\u0627\u0646\u0637\u0644\u0627\u0642
2. \u0627\u0644\u0635\u0631\u0627\u0639\u0627\u062A \u0627\u0644\u0645\u062A\u0634\u0627\u0628\u0643\u0629 \u0623\u0648 \u0627\u0644\u062F\u0648\u0627\u0641\u0639 \u0627\u0644\u0645\u062A\u0642\u0627\u0637\u0639\u0629
3. \u0627\u0644\u0639\u0627\u0644\u0645 \u0627\u0644\u0642\u0635\u0635\u064A \u0627\u0644\u0645\u0645\u064A\u0632 \u0648\u0627\u0644\u0645\u0648\u062D\u062F
4. \u0627\u0644\u062B\u064A\u0645\u0629 \u0623\u0648 \u0627\u0644\u0633\u0624\u0627\u0644 \u0627\u0644\u0641\u0644\u0633\u0641\u064A \u0627\u0644\u062C\u0627\u0645\u0639

\u0627\u0644\u0633\u064A\u0627\u0642: ${JSON.stringify(context, null, 2)}

\u0623\u0639\u062F \u0627\u0644\u0625\u062C\u0627\u0628\u0629 **\u062D\u0635\u0631\u064A\u0627\u064B** \u0628\u062A\u0646\u0633\u064A\u0642 JSON:
{
  "story_statement_alternatives": [
    "\u0628\u064A\u0627\u0646 \u0627\u0644\u0642\u0635\u0629 \u0627\u0644\u0623\u0648\u0644 (4 \u062C\u0645\u0644)...",
    "\u0628\u064A\u0627\u0646 \u0627\u0644\u0642\u0635\u0629 \u0627\u0644\u062B\u0627\u0646\u064A (4 \u062C\u0645\u0644)...",
    "\u0628\u064A\u0627\u0646 \u0627\u0644\u0642\u0635\u0629 \u0627\u0644\u062B\u0627\u0644\u062B (4 \u062C\u0645\u0644)..."
  ]
}
    `;
    const result = await this.geminiService.generate({
      prompt,
      context: context.fullText.substring(0, 25e3),
      model: "gemini-2.5-pro" /* PRO */,
      temperature: 0.8
    });
    return result.content.story_statement_alternatives || ["\u0641\u0634\u0644 \u062A\u0648\u0644\u064A\u062F \u0628\u064A\u0627\u0646 \u0627\u0644\u0642\u0635\u0629"];
  }
  async generate3DMap(context) {
    const prompt = `
\u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u0633\u064A\u0627\u0642: ${JSON.stringify(context, null, 2)}

\u0642\u0645 \u0628\u0625\u0646\u0634\u0627\u0621 **"\u062E\u0631\u064A\u0637\u0629 \u062B\u0644\u0627\u062B\u064A\u0629 \u0627\u0644\u0623\u0628\u0639\u0627\u062F" (3D Map)** \u0644\u0644\u0642\u0635\u0629:

\u0623\u0639\u062F \u0627\u0644\u0646\u062A\u0627\u0626\u062C \u0628\u062A\u0646\u0633\u064A\u0642 JSON:
{
  "horizontal_events_axis": [
    {"event": "\u062D\u062F\u062B \u0645\u062E\u062A\u0635\u0631", "scene_ref": "\u0631\u0642\u0645 \u0627\u0644\u0645\u0634\u0647\u062F"},
    ...
  ],
  "vertical_meaning_axis": [
    {"event_ref": "\u0648\u0635\u0641 \u0627\u0644\u062D\u062F\u062B", "symbolic_layer": "\u0627\u0644\u0637\u0628\u0642\u0629 \u0627\u0644\u0631\u0645\u0632\u064A\u0629"},
    ...
  ],
  "temporal_development_axis": {
    "past_influence": "\u062A\u0623\u062B\u064A\u0631 \u0627\u0644\u0645\u0627\u0636\u064A...",
    "present_choices": "\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u062D\u0627\u0636\u0631...",
    "future_expectations": "\u062A\u0648\u0642\u0639\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u0642\u0628\u0644...",
    "hero_arc_connection": "\u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0642\u0648\u0633 \u0627\u0644\u0628\u0637\u0644..."
  }
}
    `;
    const result = await this.geminiService.generate({
      prompt,
      context: context.fullText.substring(0, 25e3),
      model: "gemini-2.5-pro" /* PRO */,
      temperature: 0.7
    });
    return result.content || this.getDefault3DMap();
  }
  async generateElevatorPitch(storyStatement) {
    const prompt = `
\u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0628\u064A\u0627\u0646 \u0627\u0644\u0642\u0635\u0629: "${storyStatement}"

\u0635\u063A "Elevator Pitch" \u062C\u0630\u0627\u0628 \u0648\u0645\u0648\u062C\u0632 (\u0644\u0627 \u064A\u062A\u062C\u0627\u0648\u0632 40 \u0643\u0644\u0645\u0629).

\u0623\u0639\u062F \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0628\u062A\u0646\u0633\u064A\u0642 JSON:
{
  "elevator_pitch": "\u0627\u0644\u0646\u0635 \u0647\u0646\u0627..."
}
    `;
    const result = await this.geminiService.generate({
      prompt,
      model: "gemini-2.5-pro" /* PRO */,
      temperature: 0.9
    });
    return result.content.elevator_pitch || "\u0641\u0634\u0644 \u062A\u0648\u0644\u064A\u062F \u0627\u0644\u0639\u0631\u0636 \u0627\u0644\u0645\u062E\u062A\u0635\u0631";
  }
  async generateHybridGenre(context) {
    const prompt = `
\u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u0633\u064A\u0627\u0642 \u0648\u0627\u0644\u0646\u0635 \u0627\u0644\u0643\u0627\u0645\u0644\u060C \u0627\u0642\u062A\u0631\u062D **\u0645\u0627 \u0628\u064A\u0646 3 \u0625\u0644\u0649 5 \u0628\u062F\u0627\u0626\u0644** 
\u0644\u062A\u0631\u0643\u064A\u0628\u0629 **"\u0646\u0648\u0639 \u0647\u062C\u064A\u0646" (Hybrid Genre)** \u062F\u0642\u064A\u0642\u0629 \u0648\u0645\u0646\u0627\u0633\u0628\u0629.

\u0627\u0644\u0633\u064A\u0627\u0642: ${JSON.stringify(context, null, 2)}

\u0623\u0639\u062F \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0628\u062A\u0646\u0633\u064A\u0642 JSON:
{
  "hybrid_genre_alternatives": [
    "\u0627\u0644\u0646\u0648\u0639 \u0627\u0644\u0647\u062C\u064A\u0646 \u0627\u0644\u0623\u0648\u0644 \u0645\u0639 \u0627\u0644\u0634\u0631\u062D...",
    "\u0627\u0644\u0646\u0648\u0639 \u0627\u0644\u0647\u062C\u064A\u0646 \u0627\u0644\u062B\u0627\u0646\u064A \u0645\u0639 \u0627\u0644\u0634\u0631\u062D...",
    ...
  ]
}
    `;
    const result = await this.geminiService.generate({
      prompt,
      context: context.fullText.substring(0, 2e4),
      model: "gemini-2.5-pro" /* PRO */,
      temperature: 0.8
    });
    return result.content.hybrid_genre_alternatives || ["Drama-Thriller"];
  }
  async generateGenreMatrix(hybridGenre, context) {
    const prompt = `
\u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u0646\u0648\u0639 \u0627\u0644\u0647\u062C\u064A\u0646 \u0627\u0644\u0645\u0639\u062A\u0645\u062F: "${hybridGenre}"

\u0623\u0646\u0634\u0626 **"\u0645\u0635\u0641\u0648\u0641\u0629 \u0645\u0633\u0627\u0647\u0645\u0629 \u0627\u0644\u0646\u0648\u0639"** \u062A\u0648\u0636\u062D \u0643\u064A\u0641 \u064A\u064F\u062B\u0631\u064A \u0643\u0644 \u0646\u0648\u0639 \u0623\u0633\u0627\u0633\u064A:

\u0623\u0639\u062F \u0627\u0644\u0646\u062A\u0627\u0626\u062C \u0628\u062A\u0646\u0633\u064A\u0642 JSON:
{
  "genre_contribution_matrix": {
    "\u0627\u0644\u0646\u0648\u0639 \u0627\u0644\u0623\u0648\u0644": {
      "conflict_contribution": "...",
      "pacing_contribution": "...",
      "visual_composition_contribution": "...",
      "sound_music_contribution": "...",
      "characters_contribution": "..."
    }
  }
}
    `;
    const result = await this.geminiService.generate({
      prompt,
      context: context.fullText.substring(0, 15e3),
      model: "gemini-2.5-pro" /* PRO */,
      temperature: 0.7
    });
    return result.content.genre_contribution_matrix || {};
  }
  async generateDynamicTone(hybridGenre, context) {
    return {
      baseline: {
        visualAtmosphereDescribed: `\u064A\u0639\u0643\u0633 \u0647\u0630\u0627 \u0627\u0644\u0645\u0634\u0647\u062F \u0646\u063A\u0645\u0629 "${context.narrativeTone}" \u0627\u0644\u0645\u0647\u064A\u0645\u0646\u0629.`,
        writtenPacing: "\u064A\u062A\u0645 \u0627\u0644\u0627\u062D\u062A\u0641\u0627\u0638 \u0628\u0625\u064A\u0642\u0627\u0639 \u0633\u0631\u062F\u064A \u0645\u062A\u0648\u0633\u0637 \u0644\u062F\u0639\u0645 \u062A\u0646\u0627\u0645\u064A \u0627\u0644\u062A\u0648\u062A\u0631.",
        dialogueStructure: "\u0627\u0644\u062D\u0648\u0627\u0631\u0627\u062A \u0645\u062E\u062A\u0635\u0631\u0629 \u0648\u062A\u062F\u0641\u0639 \u0627\u0644\u0635\u0631\u0627\u0639 \u0644\u0644\u0623\u0645\u0627\u0645 \u0628\u0634\u0643\u0644 \u0645\u0628\u0627\u0634\u0631.",
        soundIndicationsDescribed: "\u062A\u0648\u062C\u064A\u0647\u0627\u062A \u0635\u0648\u062A\u064A\u0629 \u0645\u062D\u062F\u0648\u062F\u0629\u060C \u062A\u0631\u0643\u0632 \u0639\u0644\u0649 \u0627\u0644\u062E\u0644\u0641\u064A\u0629 \u0627\u0644\u0628\u064A\u0626\u064A\u0629 \u0644\u062A\u0639\u0632\u064A\u0632 \u0627\u0644\u062C\u0648 \u0627\u0644\u0639\u0627\u0645."
      }
    };
  }
  async generateArtisticReferences(hybridGenre, context) {
    return {
      visualReferences: [
        {
          work: "\u0644\u0648\u062D\u0629 \u0627\u0641\u062A\u0631\u0627\u0636\u064A\u0629 \u062A\u0639\u0643\u0633 \u0627\u0644\u0635\u0631\u0627\u0639 \u0627\u0644\u0645\u0631\u0643\u0632\u064A",
          reason: `\u062A\u062F\u0639\u0645 \u0627\u0644\u0645\u0632\u0627\u062C ${context.narrativeTone} \u0627\u0644\u0630\u064A \u062D\u062F\u062F\u062A\u0647 \u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A \u0627\u0644\u0633\u0627\u0628\u0642\u0629.`
        }
      ],
      musicalMood: `\u0645\u0632\u064A\u062C \u0645\u0646 \u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0633\u0645\u0639\u064A\u0629 \u064A\u0646\u0633\u062C\u0645 \u0645\u0639 \u0637\u0627\u0628\u0639 ${hybridGenre}.`
    };
  }
  getDefault3DMap() {
    return {
      horizontalEventsAxis: [],
      verticalMeaningAxis: [],
      temporalDevelopmentAxis: {
        pastInfluence: "",
        presentChoices: "",
        futureExpectations: "",
        heroArcConnection: ""
      }
    };
  }
  extractRequiredData(input) {
    return {
      majorCharacters: input.station1Output.majorCharacters.slice(0, 5),
      fullTextLength: input.fullText.length
    };
  }
  getErrorFallback() {
    return {
      storyStatement: "Error",
      threeDMap: this.getDefault3DMap(),
      elevatorPitch: "Error",
      hybridGenre: "Error",
      genreContributionMatrix: {},
      dynamicTone: {},
      artisticReferences: {
        visualReferences: [],
        musicalMood: ""
      },
      metadata: {
        analysisTimestamp: /* @__PURE__ */ new Date(),
        status: "Failed"
      }
    };
  }
};

// server/core/models/base-entities.ts
var RelationshipType = /* @__PURE__ */ ((RelationshipType2) => {
  RelationshipType2["LOVE"] = "LOVE";
  RelationshipType2["RIVALRY"] = "RIVALRY";
  RelationshipType2["ALLIANCE"] = "ALLIANCE";
  RelationshipType2["FAMILY"] = "FAMILY";
  RelationshipType2["MENTORSHIP"] = "MENTORSHIP";
  RelationshipType2["ENMITY"] = "ENMITY";
  RelationshipType2["OTHER"] = "OTHER";
  return RelationshipType2;
})(RelationshipType || {});
var RelationshipNature = /* @__PURE__ */ ((RelationshipNature2) => {
  RelationshipNature2["POSITIVE"] = "POSITIVE";
  RelationshipNature2["NEGATIVE"] = "NEGATIVE";
  RelationshipNature2["NEUTRAL"] = "NEUTRAL";
  RelationshipNature2["AMBIVALENT"] = "AMBIVALENT";
  RelationshipNature2["OTHER"] = "OTHER";
  return RelationshipNature2;
})(RelationshipNature || {});
var RelationshipDirection = /* @__PURE__ */ ((RelationshipDirection2) => {
  RelationshipDirection2["DIRECTED"] = "DIRECTED";
  RelationshipDirection2["BIDIRECTIONAL"] = "BIDIRECTIONAL";
  return RelationshipDirection2;
})(RelationshipDirection || {});
var ConflictSubject = /* @__PURE__ */ ((ConflictSubject2) => {
  ConflictSubject2["VALUE"] = "VALUE";
  ConflictSubject2["MATERIAL"] = "MATERIAL";
  ConflictSubject2["POWER"] = "POWER";
  ConflictSubject2["PSYCHOLOGICAL"] = "PSYCHOLOGICAL";
  ConflictSubject2["RELATIONSHIP"] = "RELATIONSHIP";
  ConflictSubject2["INFORMATIONAL"] = "INFORMATIONAL";
  ConflictSubject2["SURVIVAL"] = "SURVIVAL";
  ConflictSubject2["OTHER"] = "OTHER";
  return ConflictSubject2;
})(ConflictSubject || {});
var ConflictScope = /* @__PURE__ */ ((ConflictScope2) => {
  ConflictScope2["INTERNAL"] = "INTERNAL";
  ConflictScope2["PERSONAL"] = "PERSONAL";
  ConflictScope2["GROUP"] = "GROUP";
  ConflictScope2["SOCIETAL"] = "SOCIETAL";
  ConflictScope2["UNIVERSAL"] = "UNIVERSAL";
  return ConflictScope2;
})(ConflictScope || {});
var ConflictPhase = /* @__PURE__ */ ((ConflictPhase2) => {
  ConflictPhase2["LATENT"] = "LATENT";
  ConflictPhase2["EMERGING"] = "EMERGING";
  ConflictPhase2["ESCALATING"] = "ESCALATING";
  ConflictPhase2["STALEMATE"] = "STALEMATE";
  ConflictPhase2["CLIMAX"] = "CLIMAX";
  ConflictPhase2["DEESCALATING"] = "DEESCALATING";
  ConflictPhase2["RESOLUTION"] = "RESOLUTION";
  ConflictPhase2["AFTERMATH"] = "AFTERMATH";
  ConflictPhase2["OTHER"] = "OTHER";
  return ConflictPhase2;
})(ConflictPhase || {});
var ConflictNetworkImpl = class {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.characters = /* @__PURE__ */ new Map();
    this.relationships = /* @__PURE__ */ new Map();
    this.conflicts = /* @__PURE__ */ new Map();
    this.snapshots = [];
    this.metadata = {};
  }
  addCharacter(character) {
    this.characters.set(character.id, character);
  }
  addRelationship(relationship) {
    this.relationships.set(relationship.id, relationship);
  }
  addConflict(conflict) {
    this.conflicts.set(conflict.id, conflict);
  }
  createSnapshot(description) {
    this.snapshots.push({
      timestamp: /* @__PURE__ */ new Date(),
      description,
      networkState: {
        id: this.id,
        name: this.name,
        characters: new Map(this.characters),
        relationships: new Map(this.relationships),
        conflicts: new Map(this.conflicts),
        metadata: { ...this.metadata }
      }
    });
  }
};

// server/stations/station3/station3-network-builder.ts
var RelationshipInferenceEngine = class {
  constructor(geminiService2) {
    this.geminiService = geminiService2;
  }
  async inferRelationships(characters, context, station2Summary) {
    const charactersList = characters.map(
      (c) => `'${c.name}' (ID: ${c.id})`
    ).join(", ");
    const promptContext = this.buildContextSummary(context, station2Summary);
    const prompt = `
\u0627\u0633\u062A\u0646\u0627\u062F\u064B\u0627 \u0625\u0644\u0649 \u0627\u0644\u0633\u064A\u0627\u0642 \u0627\u0644\u0645\u0642\u062F\u0645\u060C \u0642\u0645 \u0628\u0627\u0633\u062A\u0646\u062A\u0627\u062C \u0627\u0644\u0639\u0644\u0627\u0642\u0627\u062A \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u0628\u064A\u0646 \u0627\u0644\u0634\u062E\u0635\u064A\u0627\u062A.

\u0627\u0644\u0634\u062E\u0635\u064A\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u062D\u0629: ${charactersList}

\u0645\u0644\u062E\u0635 \u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A \u0627\u0644\u0633\u0627\u0628\u0642\u0629: ${JSON.stringify(promptContext, null, 2)}

\u0644\u0643\u0644 \u0639\u0644\u0627\u0642\u0629 \u0631\u0626\u064A\u0633\u064A\u0629:
1. \u062D\u062F\u062F \u0627\u0644\u0634\u062E\u0635\u064A\u062A\u064A\u0646 (\u0628\u0627\u0644\u0627\u0633\u0645 \u0623\u0648 ID)
2. \u0627\u0642\u062A\u0631\u062D \u0646\u0648\u0639 \u0627\u0644\u0639\u0644\u0627\u0642\u0629 (${Object.values(RelationshipType).join(", ")})
3. \u0627\u0642\u062A\u0631\u062D \u0637\u0628\u064A\u0639\u0629 \u0627\u0644\u0639\u0644\u0627\u0642\u0629 (${Object.values(RelationshipNature).join(", ")})
4. \u0648\u0635\u0641 \u0645\u0648\u062C\u0632 \u0644\u0644\u0639\u0644\u0627\u0642\u0629
5. \u0642\u0648\u0629 \u0627\u0644\u0639\u0644\u0627\u0642\u0629 (1-10)
6. \u0627\u062A\u062C\u0627\u0647 \u0627\u0644\u0639\u0644\u0627\u0642\u0629 (${Object.values(RelationshipDirection).join(", ")})
7. \u0627\u0644\u0645\u062D\u0641\u0632\u0627\u062A \u0627\u0644\u0645\u0624\u062B\u0631\u0629

\u0623\u0639\u062F \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0628\u062A\u0646\u0633\u064A\u0642 JSON:
{
  "inferred_relationships": [
    {
      "character1_name_or_id": "...",
      "character2_name_or_id": "...",
      "relationship_type": "...",
      "relationship_nature": "...",
      "description_rationale": "...",
      "strength": 7,
      "direction": "...",
      "triggers": ["\u0645\u062D\u0641\u0632 1", "\u0645\u062D\u0641\u0632 2"]
    }
  ]
}
    `;
    const result = await this.geminiService.generate({
      prompt,
      context: context.fullText.substring(0, 25e3),
      model: "gemini-2.5-pro" /* PRO */,
      temperature: 0.7
    });
    const inferredData = result.content.inferred_relationships || [];
    return this.convertToRelationships(inferredData, characters);
  }
  convertToRelationships(inferredData, characters) {
    const relationships = [];
    const charNameToId = new Map(characters.map((c) => [c.name, c.id]));
    for (const data of inferredData) {
      const sourceId = charNameToId.get(data.character1_name_or_id) || data.character1_name_or_id;
      const targetId = charNameToId.get(data.character2_name_or_id) || data.character2_name_or_id;
      if (!sourceId || !targetId || sourceId === targetId) {
        continue;
      }
      try {
        const relationship = {
          id: `rel_${sourceId}_${targetId}_${Date.now()}`,
          source: sourceId,
          target: targetId,
          type: this.parseRelationshipType(data.relationship_type),
          nature: this.parseRelationshipNature(data.relationship_nature),
          direction: this.parseRelationshipDirection(data.direction),
          strength: parseInt(data.strength) || 5,
          description: data.description_rationale || "",
          triggers: data.triggers || [],
          metadata: {
            source: "AI_Inference_Engine",
            inferenceTimestamp: (/* @__PURE__ */ new Date()).toISOString()
          }
        };
        relationships.push(relationship);
      } catch (error) {
        logger_default.error("Error parsing relationship", {
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    return relationships;
  }
  parseRelationshipType(typeStr) {
    const normalized = typeStr?.toUpperCase().replace(/[- ]/g, "_");
    return RelationshipType[normalized] || "OTHER" /* OTHER */;
  }
  parseRelationshipNature(natureStr) {
    const normalized = natureStr?.toUpperCase().replace(/[- ]/g, "_");
    return RelationshipNature[normalized] || "NEUTRAL" /* NEUTRAL */;
  }
  parseRelationshipDirection(dirStr) {
    const normalized = dirStr?.toUpperCase().replace(/[- ]/g, "_");
    return RelationshipDirection[normalized] || "BIDIRECTIONAL" /* BIDIRECTIONAL */;
  }
  buildContextSummary(context, station2Summary) {
    const characterProfiles = Array.from(context.characterProfiles.entries()).map(
      ([name, profile]) => ({
        name,
        personalityTraits: profile?.personalityTraits ?? "",
        motivationsGoals: profile?.motivationsGoals ?? "",
        narrativeFunction: profile?.narrativeFunction ?? "",
        keyRelationshipsBrief: profile?.keyRelationshipsBrief ?? ""
      })
    );
    const relationshipHints = (context.relationshipData || []).filter((item) => item && typeof item === "object" && "characters" in item).map((item) => {
      const data = item;
      return {
        characters: data.characters ?? [],
        dynamic: data.dynamic ?? "",
        narrativeImportance: data.narrativeImportance ?? ""
      };
    });
    return {
      majorCharacters: context.majorCharacters,
      characterProfiles,
      relationshipHints,
      conceptualHighlights: {
        storyStatement: station2Summary.storyStatement,
        hybridGenre: station2Summary.hybridGenre,
        elevatorPitch: station2Summary.elevatorPitch
      }
    };
  }
};
var ConflictInferenceEngine = class {
  constructor(geminiService2) {
    this.geminiService = geminiService2;
  }
  async inferConflicts(characters, relationships, context, station2Summary) {
    const charactersSummary = characters.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description
    }));
    const relationshipsSummary = relationships.slice(0, 5).map((r) => {
      const source = characters.find((c) => c.id === r.source);
      const target = characters.find((c) => c.id === r.target);
      return {
        characters: [source?.name, target?.name],
        type: r.type,
        nature: r.nature
      };
    });
    const conceptualSummary = this.buildConflictContext(context, station2Summary);
    const prompt = `
\u0627\u0633\u062A\u0646\u0627\u062F\u064B\u0627 \u0625\u0644\u0649 \u0627\u0644\u0633\u064A\u0627\u0642\u060C \u0642\u0645 \u0628\u0627\u0633\u062A\u0646\u062A\u0627\u062C \u0627\u0644\u0635\u0631\u0627\u0639\u0627\u062A \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 (3-5 \u0635\u0631\u0627\u0639\u0627\u062A).

\u0627\u0644\u0634\u062E\u0635\u064A\u0627\u062A: ${JSON.stringify(charactersSummary, null, 2)}
\u0627\u0644\u0639\u0644\u0627\u0642\u0627\u062A: ${JSON.stringify(relationshipsSummary, null, 2)}

\u0645\u0644\u062E\u0635 \u062A\u062D\u0644\u064A\u0644\u0627\u062A \u0627\u0644\u0645\u062D\u0637\u0627\u062A \u0627\u0644\u0633\u0627\u0628\u0642\u0629: ${JSON.stringify(conceptualSummary, null, 2)}

\u0644\u0643\u0644 \u0635\u0631\u0627\u0639:
1. \u0627\u0633\u0645 \u0627\u0644\u0635\u0631\u0627\u0639
2. \u0627\u0644\u0634\u062E\u0635\u064A\u0627\u062A \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 (\u0623\u0633\u0645\u0627\u0621 \u0623\u0648 IDs)
3. \u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u0635\u0631\u0627\u0639 (${Object.values(ConflictSubject).join(", ")})
4. \u0646\u0637\u0627\u0642 \u0627\u0644\u0635\u0631\u0627\u0639 (${Object.values(ConflictScope).join(", ")})
5. \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0623\u0648\u0644\u064A\u0629 (${Object.values(ConflictPhase).join(", ")})
6. \u0648\u0635\u0641 \u0648\u062F\u0644\u064A\u0644
7. \u0642\u0648\u0629 \u0627\u0644\u0635\u0631\u0627\u0639 (1-10)
8. \u0646\u0642\u0627\u0637 \u0627\u0644\u062A\u062D\u0648\u0644 \u0627\u0644\u0645\u062D\u0648\u0631\u064A\u0629

\u0623\u0639\u062F \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0628\u062A\u0646\u0633\u064A\u0642 JSON:
{
  "inferred_conflicts": [
    {
      "conflict_name": "...",
      "involved_character_names_or_ids": ["...", "..."],
      "subject": "...",
      "scope": "...",
      "initial_phase": "...",
      "description_rationale": "...",
      "strength": 8,
      "related_relationships": [],
      "pivot_points": ["\u0646\u0642\u0637\u0629 1", "\u0646\u0642\u0637\u0629 2"]
    }
  ]
}
    `;
    const result = await this.geminiService.generate({
      prompt,
      context: context.fullText.substring(0, 25e3),
      model: "gemini-2.5-pro" /* PRO */,
      temperature: 0.7
    });
    const inferredData = result.content.inferred_conflicts || [];
    return this.convertToConflicts(inferredData, characters);
  }
  convertToConflicts(inferredData, characters) {
    const conflicts = [];
    const charNameToId = new Map(characters.map((c) => [c.name, c.id]));
    for (const data of inferredData) {
      const involvedIds = (data.involved_character_names_or_ids || []).map((ref) => charNameToId.get(ref) || ref).filter((id) => id);
      if (involvedIds.length === 0) {
        continue;
      }
      try {
        const conflict = {
          id: `conflict_${Date.now()}_${Math.random()}`,
          name: data.conflict_name || "Unnamed Conflict",
          description: data.description_rationale || "",
          involvedCharacters: involvedIds,
          subject: this.parseConflictSubject(data.subject),
          scope: this.parseConflictScope(data.scope),
          phase: this.parseConflictPhase(data.initial_phase),
          strength: parseInt(data.strength) || 5,
          relatedRelationships: data.related_relationships || [],
          pivotPoints: data.pivot_points || [],
          timestamps: [/* @__PURE__ */ new Date()],
          metadata: {
            source: "AI_Inference_Engine",
            inferenceTimestamp: (/* @__PURE__ */ new Date()).toISOString()
          }
        };
        conflicts.push(conflict);
      } catch (error) {
        logger_default.error("Error parsing conflict", {
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    return conflicts;
  }
  parseConflictSubject(subjectStr) {
    const normalized = subjectStr?.toUpperCase().replace(/[- ]/g, "_");
    return ConflictSubject[normalized] || "OTHER" /* OTHER */;
  }
  parseConflictScope(scopeStr) {
    const normalized = scopeStr?.toUpperCase().replace(/[- ]/g, "_");
    return ConflictScope[normalized] || "PERSONAL" /* PERSONAL */;
  }
  parseConflictPhase(phaseStr) {
    const normalized = phaseStr?.toUpperCase().replace(/[- ]/g, "_");
    return ConflictPhase[normalized] || "EMERGING" /* EMERGING */;
  }
  buildConflictContext(context, station2Summary) {
    const relationshipHints = (context.relationshipData || []).filter((item) => item && typeof item === "object" && "characters" in item).map((item) => {
      const data = item;
      return {
        characters: data.characters ?? [],
        dynamic: data.dynamic ?? "",
        narrativeImportance: data.narrativeImportance ?? ""
      };
    });
    return {
      majorCharacters: context.majorCharacters,
      relationshipInsights: relationshipHints,
      storyStatement: station2Summary.storyStatement,
      hybridGenre: station2Summary.hybridGenre,
      genreContributionMatrix: station2Summary.genreContributionMatrix,
      dynamicTone: station2Summary.dynamicTone
    };
  }
};
var Station3NetworkBuilder = class extends BaseStation {
  constructor(config, geminiService2) {
    super(config, geminiService2);
    this.relationshipEngine = new RelationshipInferenceEngine(geminiService2);
    this.conflictEngine = new ConflictInferenceEngine(geminiService2);
  }
  async process(input) {
    const startTime = Date.now();
    const context = this.buildContext(input);
    const network = new ConflictNetworkImpl(
      `network_${Date.now()}`,
      `${input.station2Output.storyStatement.substring(0, 50)}...`
    );
    const characters = this.createCharactersFromStation1(input.station1Output);
    characters.forEach((char) => network.addCharacter(char));
    const relationships = await this.relationshipEngine.inferRelationships(
      characters,
      context,
      input.station2Output
    );
    relationships.forEach((rel) => network.addRelationship(rel));
    const conflicts = await this.conflictEngine.inferConflicts(
      characters,
      relationships,
      context,
      input.station2Output
    );
    conflicts.forEach((conflict) => network.addConflict(conflict));
    network.createSnapshot("Initial network state after AI inference");
    const buildTime = Date.now() - startTime;
    return {
      conflictNetwork: network,
      networkSummary: {
        charactersCount: network.characters.size,
        relationshipsCount: network.relationships.size,
        conflictsCount: network.conflicts.size,
        snapshotsCount: network.snapshots.length
      },
      metadata: {
        analysisTimestamp: /* @__PURE__ */ new Date(),
        status: "Success",
        buildTime
      }
    };
  }
  buildContext(input) {
    const relationshipHints = input.station1Output.relationshipAnalysis.keyRelationships.map(
      (relationship) => ({
        characters: relationship.characters,
        dynamic: relationship.dynamic,
        narrativeImportance: relationship.narrativeImportance
      })
    );
    return {
      majorCharacters: input.station1Output.majorCharacters,
      characterProfiles: input.station1Output.characterAnalysis,
      relationshipData: relationshipHints,
      fullText: input.fullText
    };
  }
  createCharactersFromStation1(s1Output) {
    return s1Output.majorCharacters.map((name, index) => {
      const analysis = s1Output.characterAnalysis.get(name);
      return {
        id: `char_${index + 1}`,
        name,
        description: analysis?.narrativeFunction || "\u0634\u062E\u0635\u064A\u0629 \u0631\u0626\u064A\u0633\u064A\u0629",
        profile: {
          personalityTraits: analysis?.personalityTraits || "",
          motivationsGoals: analysis?.motivationsGoals || "",
          potentialArc: analysis?.potentialArcObservation || ""
        },
        metadata: {
          source: "Station1_Analysis",
          analysisTimestamp: s1Output.metadata.analysisTimestamp.toISOString()
        }
      };
    });
  }
  extractRequiredData(input) {
    return {
      station1Characters: input.station1Output.majorCharacters.slice(0, 5),
      station2StoryStatement: input.station2Output.storyStatement,
      fullTextLength: input.fullText.length
    };
  }
  getErrorFallback() {
    const emptyNetwork = new ConflictNetworkImpl("error_network", "Error Network");
    return {
      conflictNetwork: emptyNetwork,
      networkSummary: {
        charactersCount: 0,
        relationshipsCount: 0,
        conflictsCount: 0,
        snapshotsCount: 0
      },
      metadata: {
        analysisTimestamp: /* @__PURE__ */ new Date(),
        status: "Failed",
        buildTime: 0
      }
    };
  }
};

// server/analysis_modules/efficiency-metrics.ts
var EfficiencyAnalyzer = class {
  calculateEfficiencyMetrics(network) {
    const conflictCohesion = this.calculateConflictCohesion(network);
    const dramaticBalance = this.calculateDramaticBalance(network);
    const narrativeEfficiency = this.calculateNarrativeEfficiency(network);
    const narrativeDensity = this.calculateNarrativeDensity(network);
    const redundancyMetrics = this.calculateRedundancyMetrics(network);
    const overallScore = this.calculateOverallScore({
      conflictCohesion,
      dramaticBalance: dramaticBalance.balanceScore,
      narrativeEfficiency: (narrativeEfficiency.characterEfficiency + narrativeEfficiency.relationshipEfficiency + narrativeEfficiency.conflictEfficiency) / 3,
      narrativeDensity,
      redundancy: 1 - (redundancyMetrics.characterRedundancy + redundancyMetrics.relationshipRedundancy + redundancyMetrics.conflictRedundancy) / 3
    });
    return {
      overallEfficiencyScore: overallScore,
      overallRating: this.getRating(overallScore),
      conflictCohesion,
      dramaticBalance,
      narrativeEfficiency,
      narrativeDensity,
      redundancyMetrics
    };
  }
  calculateConflictCohesion(network) {
    if (network.conflicts.size === 0) return 0;
    let totalConnections = 0;
    let possibleConnections = 0;
    const conflicts = Array.from(network.conflicts.values());
    for (let i = 0; i < conflicts.length; i++) {
      for (let j = i + 1; j < conflicts.length; j++) {
        possibleConnections++;
        const conflict1 = conflicts[i];
        const conflict2 = conflicts[j];
        if (!conflict1 || !conflict2 || !conflict1.involvedCharacters || !conflict2.involvedCharacters) {
          continue;
        }
        const sharedCharacters = conflict1.involvedCharacters.filter(
          (char) => conflict2.involvedCharacters.includes(char)
        );
        if (sharedCharacters.length > 0) {
          totalConnections++;
        }
      }
    }
    return possibleConnections > 0 ? totalConnections / possibleConnections : 0;
  }
  calculateDramaticBalance(network) {
    const characters = Array.from(network.characters.values());
    const involvementCounts = characters.map((char) => {
      return Array.from(network.conflicts.values()).filter(
        (conflict) => conflict.involvedCharacters.includes(char.id)
      ).length;
    });
    const giniCoefficient = this.calculateGiniCoefficient(involvementCounts);
    const balanceScore = 1 - giniCoefficient;
    return {
      balanceScore,
      characterInvolvementGini: giniCoefficient
    };
  }
  calculateNarrativeEfficiency(network) {
    const characterEfficiency = this.calculateCharacterEfficiency(network);
    const relationshipEfficiency = this.calculateRelationshipEfficiency(network);
    const conflictEfficiency = this.calculateConflictEfficiency(network);
    return {
      characterEfficiency,
      relationshipEfficiency,
      conflictEfficiency
    };
  }
  calculateCharacterEfficiency(network) {
    if (network.characters.size === 0) return 0;
    let activeCharacters = 0;
    for (const character of Array.from(network.characters.values())) {
      const isInConflict = Array.from(network.conflicts.values()).some(
        (conflict) => conflict.involvedCharacters.includes(character.id)
      );
      const hasRelationships = Array.from(network.relationships.values()).some(
        (rel) => rel.source === character.id || rel.target === character.id
      );
      if (isInConflict || hasRelationships) {
        activeCharacters++;
      }
    }
    return activeCharacters / network.characters.size;
  }
  calculateRelationshipEfficiency(network) {
    if (network.relationships.size === 0) return 0;
    let activeRelationships = 0;
    for (const relationship of Array.from(network.relationships.values())) {
      const isRelevantToConflict = Array.from(network.conflicts.values()).some(
        (conflict) => conflict.relatedRelationships.includes(relationship.id)
      );
      if (isRelevantToConflict || relationship.strength >= 5) {
        activeRelationships++;
      }
    }
    return activeRelationships / network.relationships.size;
  }
  calculateConflictEfficiency(network) {
    if (network.conflicts.size === 0) return 0;
    let activeConflicts = 0;
    for (const conflict of Array.from(network.conflicts.values())) {
      if (conflict.strength >= 5 && conflict.involvedCharacters.length >= 2) {
        activeConflicts++;
      }
    }
    return activeConflicts / network.conflicts.size;
  }
  calculateNarrativeDensity(network) {
    const totalElements = network.characters.size + network.relationships.size + network.conflicts.size;
    if (totalElements === 0) return 0;
    const connections = Array.from(network.relationships.values()).length + Array.from(network.conflicts.values()).reduce(
      (sum, conflict) => sum + conflict.involvedCharacters.length,
      0
    );
    return connections / totalElements;
  }
  calculateRedundancyMetrics(network) {
    return {
      characterRedundancy: this.calculateCharacterRedundancy(network),
      relationshipRedundancy: this.calculateRelationshipRedundancy(network),
      conflictRedundancy: this.calculateConflictRedundancy(network)
    };
  }
  calculateCharacterRedundancy(network) {
    const characters = Array.from(network.characters.values());
    if (characters.length <= 1) return 0;
    let redundantPairs = 0;
    let totalPairs = 0;
    for (let i = 0; i < characters.length; i++) {
      for (let j = i + 1; j < characters.length; j++) {
        totalPairs++;
        const char1 = characters[i];
        const char2 = characters[j];
        if (!char1 || !char2 || !char1.description || !char2.description) {
          continue;
        }
        if (char1.description === char2.description) {
          redundantPairs++;
        }
      }
    }
    return totalPairs > 0 ? redundantPairs / totalPairs : 0;
  }
  calculateRelationshipRedundancy(network) {
    const relationships = Array.from(network.relationships.values());
    if (relationships.length <= 1) return 0;
    let redundantPairs = 0;
    let totalPairs = 0;
    for (let i = 0; i < relationships.length; i++) {
      for (let j = i + 1; j < relationships.length; j++) {
        totalPairs++;
        const rel1 = relationships[i];
        const rel2 = relationships[j];
        if (!rel1 || !rel2 || !rel1.source || !rel1.target || !rel1.type || !rel2.source || !rel2.target || !rel2.type) {
          continue;
        }
        if (rel1.source === rel2.source && rel1.target === rel2.target || rel1.source === rel2.target && rel1.target === rel2.source) {
          if (rel1.type === rel2.type) {
            redundantPairs++;
          }
        }
      }
    }
    return totalPairs > 0 ? redundantPairs / totalPairs : 0;
  }
  calculateConflictRedundancy(network) {
    const conflicts = Array.from(network.conflicts.values());
    if (conflicts.length <= 1) return 0;
    let redundantPairs = 0;
    let totalPairs = 0;
    for (let i = 0; i < conflicts.length; i++) {
      for (let j = i + 1; j < conflicts.length; j++) {
        totalPairs++;
        const conflict1 = conflicts[i];
        const conflict2 = conflicts[j];
        if (!conflict1 || !conflict2 || !conflict1.subject || !conflict1.scope || !conflict2.subject || !conflict2.scope || !conflict1.involvedCharacters || !conflict2.involvedCharacters) {
          continue;
        }
        if (conflict1.subject === conflict2.subject && conflict1.scope === conflict2.scope) {
          const sharedCharacters = conflict1.involvedCharacters.filter(
            (char) => conflict2.involvedCharacters.includes(char)
          );
          if (sharedCharacters.length > 0) {
            redundantPairs++;
          }
        }
      }
    }
    return totalPairs > 0 ? redundantPairs / totalPairs : 0;
  }
  calculateGiniCoefficient(values) {
    if (values.length === 0) return 0;
    const sortedValues = values.sort((a, b) => a - b);
    const n = sortedValues.length;
    const sum = sortedValues.reduce((a, b) => a + b, 0);
    if (sum === 0) return 0;
    let gini = 0;
    for (let i = 0; i < n; i++) {
      const value = sortedValues[i];
      if (value !== void 0) {
        gini += (2 * (i + 1) - n - 1) * value;
      }
    }
    return gini / (n * sum);
  }
  calculateOverallScore(metrics) {
    const weights = {
      conflictCohesion: 0.25,
      dramaticBalance: 0.25,
      narrativeEfficiency: 0.25,
      narrativeDensity: 0.15,
      redundancy: 0.1
    };
    return (metrics.conflictCohesion * weights.conflictCohesion + metrics.dramaticBalance * weights.dramaticBalance + metrics.narrativeEfficiency * weights.narrativeEfficiency + metrics.narrativeDensity * weights.narrativeDensity + metrics.redundancy * weights.redundancy) * 100;
  }
  getRating(score) {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 55) return "Fair";
    if (score >= 40) return "Poor";
    return "Critical";
  }
};

// server/stations/station4/station4-efficiency-metrics.ts
var Station4EfficiencyMetrics = class extends BaseStation {
  constructor(config, geminiService2) {
    super(config, geminiService2);
    this.efficiencyAnalyzer = new EfficiencyAnalyzer();
  }
  async process(input) {
    const startTime = Date.now();
    const efficiencyMetrics = this.efficiencyAnalyzer.calculateEfficiencyMetrics(
      input.station3Output.conflictNetwork
    );
    const recommendations = await this.generateRecommendations(
      efficiencyMetrics,
      input.station3Output.conflictNetwork
    );
    const analysisTime = Date.now() - startTime;
    return {
      efficiencyMetrics,
      recommendations,
      metadata: {
        analysisTimestamp: /* @__PURE__ */ new Date(),
        status: "Success",
        analysisTime
      }
    };
  }
  async generateRecommendations(metrics, _network) {
    const context = {
      overallScore: metrics.overallEfficiencyScore,
      rating: metrics.overallRating,
      conflictCohesion: metrics.conflictCohesion,
      dramaticBalance: metrics.dramaticBalance.balanceScore,
      narrativeEfficiency: metrics.narrativeEfficiency,
      redundancy: metrics.redundancyMetrics
    };
    const prompt = `
\u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u062A\u062D\u0644\u064A\u0644 \u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u0634\u0628\u0643\u0629 \u0627\u0644\u062F\u0631\u0627\u0645\u064A\u0629 \u0627\u0644\u062A\u0627\u0644\u064A:

\u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A\u0629: ${metrics.overallEfficiencyScore.toFixed(1)}/100
\u0627\u0644\u062A\u0635\u0646\u064A\u0641: ${metrics.overallRating}
\u062A\u0645\u0627\u0633\u0643 \u0627\u0644\u0635\u0631\u0627\u0639: ${metrics.conflictCohesion.toFixed(2)}
\u0627\u0644\u062A\u0648\u0627\u0632\u0646 \u0627\u0644\u062F\u0631\u0627\u0645\u064A: ${metrics.dramaticBalance.balanceScore.toFixed(2)}

\u0627\u0642\u062A\u0631\u062D \u062A\u0648\u0635\u064A\u0627\u062A \u0645\u062D\u062F\u062F\u0629 \u0648\u0639\u0645\u0644\u064A\u0629 \u0644\u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u0634\u0628\u0643\u0629:

\u0623\u0639\u062F \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0628\u062A\u0646\u0633\u064A\u0642 JSON:
{
  "priority_actions": [
    "\u0625\u062C\u0631\u0627\u0621 \u0639\u0627\u0644\u064A \u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629 1",
    "\u0625\u062C\u0631\u0627\u0621 \u0639\u0627\u0644\u064A \u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629 2",
    "\u0625\u062C\u0631\u0627\u0621 \u0639\u0627\u0644\u064A \u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629 3"
  ],
  "quick_fixes": [
    "\u0625\u0635\u0644\u0627\u062D \u0633\u0631\u064A\u0639 1",
    "\u0625\u0635\u0644\u0627\u062D \u0633\u0631\u064A\u0639 2",
    "\u0625\u0635\u0644\u0627\u062D \u0633\u0631\u064A\u0639 3"
  ],
  "structural_revisions": [
    "\u0645\u0631\u0627\u062C\u0639\u0629 \u0647\u064A\u0643\u0644\u064A\u0629 1",
    "\u0645\u0631\u0627\u062C\u0639\u0629 \u0647\u064A\u0643\u0644\u064A\u0629 2"
  ]
}
    `;
    const result = await this.geminiService.generate({
      prompt,
      model: "gemini-2.5-pro" /* PRO */,
      temperature: 0.7
    });
    return {
      priorityActions: result.content.priority_actions ?? [],
      quickFixes: result.content.quick_fixes ?? [],
      structuralRevisions: result.content.structural_revisions ?? []
    };
  }
  extractRequiredData(input) {
    return {
      charactersCount: input.station3Output.networkSummary.charactersCount,
      relationshipsCount: input.station3Output.networkSummary.relationshipsCount,
      conflictsCount: input.station3Output.networkSummary.conflictsCount
    };
  }
  getErrorFallback() {
    return {
      efficiencyMetrics: {
        overallEfficiencyScore: 0,
        overallRating: "Critical",
        conflictCohesion: 0,
        dramaticBalance: {
          balanceScore: 0,
          characterInvolvementGini: 1
        },
        narrativeEfficiency: {
          characterEfficiency: 0,
          relationshipEfficiency: 0,
          conflictEfficiency: 0
        },
        narrativeDensity: 0,
        redundancyMetrics: {
          characterRedundancy: 0,
          relationshipRedundancy: 0,
          conflictRedundancy: 0
        }
      },
      recommendations: {
        priorityActions: ["\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062A\u062D\u0644\u064A\u0644"],
        quickFixes: ["\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062A\u062D\u0644\u064A\u0644"],
        structuralRevisions: ["\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062A\u062D\u0644\u064A\u0644"]
      },
      metadata: {
        analysisTimestamp: /* @__PURE__ */ new Date(),
        status: "Failed",
        analysisTime: 0
      }
    };
  }
};

// server/stations/station5/station5-dynamic-symbolic-stylistic.ts
var safeGet = (array, index) => {
  if (index < 0 || index >= array.length) {
    return void 0;
  }
  return array[index];
};
var DynamicAnalysisEngine = class {
  constructEventTimeline(network) {
    const events = [];
    for (const snapshot of network.snapshots) {
      events.push({
        timestamp: snapshot.timestamp,
        eventType: "network_snapshot",
        description: snapshot.description,
        involvedEntities: {},
        significance: 5,
        narrativePhase: this.inferNarrativePhase(
          snapshot.timestamp,
          network.snapshots
        )
      });
    }
    for (const conflict of Array.from(network.conflicts.values())) {
      const legacyTimestamp = conflict.timestamp;
      const rawTimestamps = legacyTimestamp ?? conflict.timestamps;
      const timestamps = Array.isArray(rawTimestamps) ? rawTimestamps : rawTimestamps ? [rawTimestamps] : [];
      for (const timestamp2 of timestamps) {
        if (!timestamp2) {
          continue;
        }
        events.push({
          timestamp: timestamp2,
          eventType: "conflict_emerged",
          description: `Conflict emerged: ${conflict.name}`,
          involvedEntities: {
            characters: conflict.involvedCharacters,
            conflicts: [conflict.id]
          },
          significance: conflict.strength,
          narrativePhase: this.inferNarrativePhase(
            timestamp2,
            network.snapshots
          )
        });
      }
    }
    events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return events;
  }
  inferNarrativePhase(timestamp2, snapshots) {
    if (!timestamp2 || !snapshots || snapshots.length === 0) {
      return "setup";
    }
    const firstSnapshot = safeGet(snapshots, 0);
    const lastSnapshot = safeGet(snapshots, snapshots.length - 1);
    if (!firstSnapshot?.timestamp || !lastSnapshot?.timestamp) {
      return "setup";
    }
    const firstTime = firstSnapshot.timestamp.getTime();
    const lastTime = lastSnapshot.timestamp.getTime();
    const totalDuration = lastTime - firstTime;
    if (totalDuration === 0) {
      return "setup";
    }
    const position = (timestamp2.getTime() - firstTime) / totalDuration;
    if (position < 0.2) return "setup";
    if (position < 0.5) return "rising_action";
    if (position < 0.7) return "climax";
    if (position < 0.9) return "falling_action";
    return "resolution";
  }
  analyzeNetworkEvolution(network, timeline) {
    const complexityProgression = [];
    const densityProgression = [];
    const transitionPoints = [];
    for (const snapshot of network.snapshots) {
      if (!snapshot.networkState.characters || !snapshot.networkState.relationships || !snapshot.networkState.conflicts) {
        continue;
      }
      const numChars = snapshot.networkState.characters.size;
      const numRels = snapshot.networkState.relationships.size;
      const numConflicts = snapshot.networkState.conflicts.size;
      const complexity = numChars + numRels + numConflicts;
      complexityProgression.push(complexity);
      const maxPossibleRels = numChars * (numChars - 1) / 2;
      const density = maxPossibleRels > 0 ? numRels / maxPossibleRels : 0;
      densityProgression.push(density);
    }
    for (let i = 1; i < complexityProgression.length; i++) {
      const current = complexityProgression[i];
      const previous = complexityProgression[i - 1];
      const snapshot = network.snapshots[i];
      if (!current || !previous || !snapshot) continue;
      const change = Math.abs(current - previous);
      if (change > 5) {
        transitionPoints.push({
          timestamp: snapshot.timestamp,
          description: snapshot.description || "",
          impactScore: change
        });
      }
    }
    const lastComplexity = complexityProgression[complexityProgression.length - 1];
    const firstComplexity = complexityProgression[0];
    const overallGrowthRate = complexityProgression.length > 1 && lastComplexity && firstComplexity ? (lastComplexity - firstComplexity) / complexityProgression.length : 0;
    const stabilityMetrics = this.calculateStabilityMetrics(
      complexityProgression,
      densityProgression
    );
    return {
      overallGrowthRate,
      complexityProgression,
      densityProgression,
      criticalTransitionPoints: transitionPoints,
      stabilityMetrics
    };
  }
  calculateStabilityMetrics(complexityProgression, densityProgression) {
    const complexityVariance = this.calculateVariance(complexityProgression);
    const densityVariance = this.calculateVariance(densityProgression);
    const structuralStability = 1 / (1 + complexityVariance);
    return {
      structuralStability,
      characterStability: 1 / (1 + densityVariance),
      conflictStability: structuralStability
    };
  }
  calculateVariance(values) {
    if (values.length <= 1) {
      return 0;
    }
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }
  trackCharacterDevelopment(network, timeline) {
    const evolutionMap = /* @__PURE__ */ new Map();
    for (const [charId, character] of Array.from(network.characters.entries())) {
      const developmentStages = [];
      const keyMoments = [];
      for (const snapshot of network.snapshots) {
        if (!snapshot.networkState.characters?.has(charId)) continue;
        const charState = snapshot.networkState.characters.get(charId);
        if (!charState) continue;
        const relationships = [];
        const conflicts = [];
        if (snapshot.networkState.relationships) {
          for (const [relId, rel] of Array.from(snapshot.networkState.relationships.entries())) {
            if (rel.source === charId || rel.target === charId) {
              relationships.push(relId);
            }
          }
        }
        if (snapshot.networkState.conflicts) {
          for (const [confId, conf] of Array.from(snapshot.networkState.conflicts.entries())) {
            if (conf.involvedCharacters.includes(charId)) {
              conflicts.push(confId);
            }
          }
        }
        developmentStages.push({
          timestamp: snapshot.timestamp,
          stage: snapshot.description,
          traits: [],
          relationships,
          conflicts
        });
      }
      for (const event of timeline) {
        if (event.involvedEntities.characters?.includes(charId)) {
          keyMoments.push({
            timestamp: event.timestamp,
            event: event.description,
            impact: `Significance: ${event.significance}/10`
          });
        }
      }
      const arcType = this.determineArcType(developmentStages);
      const transformationScore = this.calculateTransformationScore(
        developmentStages
      );
      evolutionMap.set(charId, {
        characterId: charId,
        characterName: character.name,
        developmentStages,
        arcType,
        transformationScore,
        keyMoments
      });
    }
    return evolutionMap;
  }
  determineArcType(stages) {
    if (stages.length < 2) return "flat";
    const firstStage = safeGet(stages, 0);
    const lastStage = safeGet(stages, stages.length - 1);
    if (!firstStage || !lastStage) {
      return "flat";
    }
    const conflictChange = lastStage.conflicts.length - firstStage.conflicts.length;
    const relationshipChange = lastStage.relationships.length - firstStage.relationships.length;
    const totalChange = conflictChange + relationshipChange;
    if (totalChange > 2) return "positive";
    if (totalChange < -2) return "negative";
    if (Math.abs(totalChange) > 4) return "complex";
    return "flat";
  }
  calculateTransformationScore(stages) {
    if (stages.length < 2) return 0;
    let totalChange = 0;
    for (let i = 1; i < stages.length; i++) {
      const prev = stages[i - 1];
      const curr = stages[i];
      if (!prev || !curr) continue;
      const conflictChange = Math.abs(
        curr.conflicts.length - prev.conflicts.length
      );
      const relationshipChange = Math.abs(
        curr.relationships.length - prev.relationships.length
      );
      totalChange += conflictChange + relationshipChange;
    }
    return Math.min(10, totalChange / stages.length);
  }
  trackConflictProgression(network, timeline) {
    const progressionMap = /* @__PURE__ */ new Map();
    for (const [confId, conflict] of Array.from(network.conflicts.entries())) {
      const phaseTransitions = [];
      const intensityProgression = [];
      let previousPhase = null;
      for (const snapshot of network.snapshots) {
        if (!snapshot.networkState.conflicts?.has(confId)) continue;
        const confState = snapshot.networkState.conflicts.get(confId);
        if (!confState) continue;
        intensityProgression.push(confState.strength);
        if (previousPhase !== null && confState.phase !== previousPhase) {
          const catalyst = timeline.find(
            (event) => event.timestamp.getTime() === snapshot.timestamp.getTime() && event.involvedEntities.conflicts?.includes(confId)
          )?.description || "Unknown catalyst";
          phaseTransitions.push({
            timestamp: snapshot.timestamp,
            fromPhase: previousPhase,
            toPhase: confState.phase,
            catalyst
          });
        }
        previousPhase = confState.phase;
      }
      const resolutionProbability = this.calculateResolutionProbability(
        conflict,
        phaseTransitions
      );
      const stagnationRisk = this.calculateStagnationRisk(
        intensityProgression,
        phaseTransitions
      );
      progressionMap.set(confId, {
        conflictId: confId,
        conflictName: conflict.name,
        phaseTransitions,
        intensityProgression,
        resolutionProbability,
        stagnationRisk
      });
    }
    return progressionMap;
  }
  calculateResolutionProbability(conflict, transitions) {
    let probability = 0.5;
    if (conflict.phase === "RESOLUTION" /* RESOLUTION */) {
      probability = 0.95;
    } else if (conflict.phase === "DEESCALATING" /* DEESCALATING */) {
      probability = 0.75;
    } else if (conflict.phase === "AFTERMATH" /* AFTERMATH */) {
      probability = 1;
    } else if (conflict.phase === "CLIMAX" /* CLIMAX */) {
      probability = 0.6;
    } else if (conflict.phase === "LATENT" /* LATENT */) {
      probability = 0.2;
    }
    const transitionBonus = Math.min(0.3, transitions.length * 0.05);
    probability += transitionBonus;
    return Math.max(0, Math.min(1, probability));
  }
  calculateStagnationRisk(intensityProgression, transitions) {
    if (intensityProgression.length < 3) return 0.5;
    const variance = this.calculateVariance(intensityProgression);
    const transitionFactor = transitions.length === 0 ? 0.8 : transitions.length < 2 ? 0.5 : 0.2;
    const varianceFactor = variance < 1 ? 0.7 : variance < 3 ? 0.4 : 0.1;
    const risk = (transitionFactor + varianceFactor) / 2;
    return Math.max(0, Math.min(1, risk));
  }
};
var EpisodicIntegrationEngine = class {
  createSeriesStructure(network, targetEpisodesPerSeason = 10) {
    const numConflicts = network.conflicts.size;
    const estimatedEpisodes = Math.ceil(numConflicts / 2.5);
    const totalEpisodes = Math.max(
      targetEpisodesPerSeason,
      estimatedEpisodes
    );
    const totalSeasons = Math.ceil(totalEpisodes / targetEpisodesPerSeason);
    return {
      totalSeasons,
      episodesPerSeason: targetEpisodesPerSeason,
      totalEpisodes,
      recommendedRuntime: 45
    };
  }
  distributeConflicts(network, structure) {
    const assignments = /* @__PURE__ */ new Map();
    const conflicts = Array.from(network.conflicts.values());
    conflicts.sort((a, b) => b.strength - a.strength);
    let currentEpisode = 1;
    for (const conflict of conflicts) {
      const episodes = [];
      const episodeSpan = Math.ceil(conflict.strength / 3);
      for (let i = 0; i < episodeSpan; i++) {
        if (currentEpisode <= structure.totalEpisodes) {
          episodes.push(currentEpisode);
          currentEpisode++;
        }
      }
      if (currentEpisode > structure.totalEpisodes) {
        currentEpisode = 1;
      }
      assignments.set(conflict.id, {
        conflictId: conflict.id,
        episodes,
        distributionQuality: this.evaluateDistributionQuality(episodes)
      });
    }
    return assignments;
  }
  evaluateDistributionQuality(episodes) {
    if (episodes.length === 0) return 0;
    if (episodes.length === 1) return 1;
    const gaps = [];
    for (let i = 1; i < episodes.length; i++) {
      const current = episodes[i];
      const previous = episodes[i - 1];
      if (current !== void 0 && previous !== void 0) {
        gaps.push(current - previous);
      }
    }
    const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    const variance = this.calculateVariance(gaps);
    const quality = 1 / (1 + variance);
    return Math.max(0, Math.min(1, quality));
  }
  calculateVariance(values) {
    if (values.length <= 1) {
      return 0;
    }
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }
  createSeasonBreakdown(network, structure, assignments) {
    const seasonMap = /* @__PURE__ */ new Map();
    for (let s = 1; s <= structure.totalSeasons; s++) {
      const startEpisode = (s - 1) * structure.episodesPerSeason + 1;
      const endEpisode = Math.min(
        s * structure.episodesPerSeason,
        structure.totalEpisodes
      );
      const episodes = [];
      const seasonConflicts = /* @__PURE__ */ new Set();
      for (let e = startEpisode; e <= endEpisode; e++) {
        const episodeConflicts = [];
        const featuredCharacters = /* @__PURE__ */ new Set();
        for (const [conflictId, assignment] of Array.from(assignments.entries())) {
          if (assignment.episodes.includes(e)) {
            episodeConflicts.push(conflictId);
            seasonConflicts.add(conflictId);
            const conflict = network.conflicts.get(conflictId);
            if (conflict) {
              conflict.involvedCharacters.forEach(
                (charId) => featuredCharacters.add(charId)
              );
            }
          }
        }
        let estimatedIntensity = 0;
        for (const confId of episodeConflicts) {
          const conflict = network.conflicts.get(confId);
          if (conflict) {
            estimatedIntensity += conflict.strength;
          }
        }
        estimatedIntensity = Math.min(10, estimatedIntensity / episodeConflicts.length);
        const relativePosition = (e - startEpisode) / (endEpisode - startEpisode);
        const narrativeFunction = relativePosition < 0.3 ? "setup" : relativePosition < 0.7 ? "development" : relativePosition < 0.9 ? "climax" : "resolution";
        episodes.push({
          episodeNumber: e,
          seasonNumber: s,
          title: `Episode ${e}`,
          assignedConflicts: episodeConflicts,
          featuredCharacters: Array.from(featuredCharacters),
          estimatedIntensity,
          narrativeFunction
        });
      }
      const seasonDetails = {
        seasonNumber: s,
        seasonTitle: `Season ${s}`,
        episodes,
        majorConflicts: Array.from(seasonConflicts),
        seasonArc: `Season ${s} arc description`
      };
      if (s < structure.totalSeasons) {
        seasonDetails.cliffhanger = `Cliffhanger for Season ${s}`;
      }
      seasonMap.set(s, seasonDetails);
    }
    return seasonMap;
  }
  evaluateEpisodicBalance(network, seasonBreakdown) {
    const allEpisodes = [];
    for (const season of Array.from(seasonBreakdown.values())) {
      allEpisodes.push(...season.episodes);
    }
    const conflictsPerEpisode = allEpisodes.map(
      (ep) => ep.assignedConflicts.length
    );
    const conflictDistributionScore = 1 - this.calculateVariance(
      conflictsPerEpisode
    ) / Math.max(...conflictsPerEpisode);
    const charAppearances = /* @__PURE__ */ new Map();
    for (const episode of allEpisodes) {
      for (const charId of episode.featuredCharacters) {
        charAppearances.set(
          charId,
          (charAppearances.get(charId) || 0) + 1
        );
      }
    }
    const appearanceCounts = Array.from(charAppearances.values());
    const characterAppearanceBalance = appearanceCounts.length > 0 ? 1 - this.calculateVariance(appearanceCounts) / Math.max(...appearanceCounts) : 0;
    const intensities = allEpisodes.map((ep) => ep.estimatedIntensity);
    const intensityFlowScore = this.evaluateIntensityFlow(intensities);
    const overallBalance = conflictDistributionScore * 0.4 + characterAppearanceBalance * 0.3 + intensityFlowScore * 0.3;
    const recommendations = this.generateBalanceRecommendations({
      conflictDistributionScore,
      characterAppearanceBalance,
      intensityFlowScore,
      overallBalance
    });
    return {
      overallBalance,
      conflictDistributionScore,
      characterAppearanceBalance,
      intensityFlowScore,
      recommendations
    };
  }
  evaluateIntensityFlow(intensities) {
    if (intensities.length < 2) return 1;
    let score = 1;
    const variance = this.calculateVariance(intensities);
    if (variance < 1) {
      score -= 0.3;
    }
    const firstHalf = intensities.slice(0, Math.floor(intensities.length / 2));
    const secondHalf = intensities.slice(Math.floor(intensities.length / 2));
    const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    if (secondHalfAvg > firstHalfAvg) {
      score += 0.2;
    }
    return Math.max(0, Math.min(1, score));
  }
  generateBalanceRecommendations(metrics) {
    const recommendations = [];
    if (metrics.conflictDistributionScore < 0.6) {
      recommendations.push(
        "Consider redistributing conflicts more evenly across episodes"
      );
    }
    if (metrics.characterAppearanceBalance < 0.5) {
      recommendations.push(
        "Some characters appear too frequently or too rarely - balance character screen time"
      );
    }
    if (metrics.intensityFlowScore < 0.5) {
      recommendations.push(
        "Intensity flow needs improvement - add more variation and build-up"
      );
    }
    if (metrics.overallBalance >= 0.8) {
      recommendations.push(
        "Excellent episodic balance - maintain current structure"
      );
    }
    return recommendations;
  }
};
var Station5DynamicSymbolicStylistic = class extends BaseStation {
  constructor(config, geminiService2) {
    super(config, geminiService2);
    this.dynamicEngine = new DynamicAnalysisEngine();
    this.episodicEngine = new EpisodicIntegrationEngine();
  }
  async process(input) {
    const startTime = Date.now();
    const dynamicAnalysisResults = await this.performDynamicAnalysis(
      input.conflictNetwork
    );
    const episodicIntegrationResults = await this.performEpisodicIntegration(
      input.conflictNetwork
    );
    const symbolicAnalysisResults = await this.performSymbolicAnalysis(
      input.fullText
    );
    const stylisticAnalysisResults = await this.performStylisticAnalysis(
      input.fullText
    );
    const analysisTime = Date.now() - startTime;
    return {
      dynamicAnalysisResults,
      episodicIntegrationResults,
      symbolicAnalysisResults,
      stylisticAnalysisResults,
      metadata: {
        analysisTimestamp: /* @__PURE__ */ new Date(),
        status: "Success",
        analysisTime
      }
    };
  }
  async performDynamicAnalysis(network) {
    const eventTimeline = this.dynamicEngine.constructEventTimeline(network);
    const networkEvolutionAnalysis = this.dynamicEngine.analyzeNetworkEvolution(
      network,
      eventTimeline
    );
    const characterDevelopmentTracking = this.dynamicEngine.trackCharacterDevelopment(
      network,
      eventTimeline
    );
    const conflictProgressionTracking = this.dynamicEngine.trackConflictProgression(
      network,
      eventTimeline
    );
    return {
      eventTimeline,
      networkEvolutionAnalysis,
      characterDevelopmentTracking,
      conflictProgressionTracking
    };
  }
  async performEpisodicIntegration(network) {
    const seriesStructure = this.episodicEngine.createSeriesStructure(
      network,
      10
    );
    const episodeDistribution = this.episodicEngine.distributeConflicts(
      network,
      seriesStructure
    );
    const seasonBreakdown = this.episodicEngine.createSeasonBreakdown(
      network,
      seriesStructure,
      episodeDistribution
    );
    const balanceReport = this.episodicEngine.evaluateEpisodicBalance(
      network,
      seasonBreakdown
    );
    return {
      seriesStructure,
      seasonBreakdown,
      episodeDistribution,
      balanceReport
    };
  }
  async performSymbolicAnalysis(fullText) {
    const prompt = `
    Based on the provided narrative text, analyze and identify the following:

    1.  **key_symbols**: A list of 3-5 recurring or symbolically significant objects, places, or items. For each, provide:
        - "symbol": The name of the symbol.
        - "interpretation": A brief interpretation of its potential meaning.
        - "frequency": An estimated number of appearances.
        - "contextual_meanings": A list of different meanings in various contexts.

    2.  **recurring_motifs**: A list of 2-3 recurring ideas, patterns, or situations (motifs). For each:
        - "motif": A description of the motif.
        - "occurrences": The number of times it appears.
        - "narrative_function": Its narrative purpose.

    3.  **central_themes_hinted_by_symbols**: A brief conclusion about the main themes suggested by these symbols and motifs (a list of strings).

    4.  **symbolic_networks**: A list of dictionaries, each containing:
        - "primary_symbol": The main symbol.
        - "related_symbols": A list of associated symbols.
        - "thematic_connection": The thematic link.

    5.  **depth_score**: A score (0-10) for the depth of symbolic usage.

    6.  **consistency_score**: A score (0-10) for the consistency of symbolic usage.

    Respond **exclusively** in valid JSON format with the keys mentioned above.
    `;
    const result = await this.geminiService.generate({
      prompt,
      context: fullText.substring(0, 3e4),
      model: "gemini-2.5-pro" /* PRO */,
      temperature: 0.7
    });
    return result.content || this.getDefaultSymbolicResults();
  }
  async performStylisticAnalysis(fullText) {
    const prompt = `
    Based on the provided narrative text, analyze and provide an assessment of the following stylistic elements:

    1.  **overall_tone_assessment**:
        - "primary_tone": The main tone.
        - "secondary_tones": A list of secondary tones.
        - "tone_consistency": A score (0-10) for tone consistency.
        - "explanation": A brief explanation.

    2.  **language_complexity**:
        - "level": The complexity level ("simple", "moderate", "complex", "highly_complex").
        - "readability_score": A score (0-10) for readability.
        - "vocabulary_richness": A score (0-10) for vocabulary richness.

    3.  **pacing_impression**:
        - "overall_pacing": The overall pacing ("very_slow", "slow", "balanced", "fast", "very_fast").
        - "pacing_variation": A score (0-10) for pacing variation.
        - "scene_length_distribution": An approximate list of scene lengths.

    4.  **dialogue_style**:
        - "characterization": A text description of how dialogue characterizes individuals.
        - "naturalness": A score (0-10) for how natural the dialogue feels.
        - "effectiveness": A score (0-10) for its effectiveness in advancing the plot.
        - "distinctiveness": A score (0-10) for how distinct character voices are.

    5.  **descriptive_richness**:
        - "visual_detail_level": A score (0-10) for the level of visual detail.
        - "sensory_engagement": A score (0-10) for sensory engagement.
        - "atmospheric_quality": A score (0-10) for atmospheric quality.

    6.  **stylistic_consistency_impression**:
        - "consistency_score": A score (0-10) for consistency.
        - "deviations": A list of any noticeable deviations, each with:
          * "location": Approximate location.
          * "type": Type of deviation.
          * "description": Description of the deviation.

    Respond **exclusively** in valid JSON format with the keys mentioned above.
    `;
    const result = await this.geminiService.generate({
      prompt,
      context: fullText.substring(0, 3e4),
      model: "gemini-2.5-pro" /* PRO */,
      temperature: 0.6
    });
    const stylisticResults = result.content || this.getDefaultStylisticResults();
    return stylisticResults;
  }
  getDefaultSymbolicResults() {
    return {
      keySymbols: [],
      recurringMotifs: [],
      centralThemesHintedBySymbols: [],
      symbolicNetworks: [],
      depthScore: 0,
      consistencyScore: 0
    };
  }
  getDefaultStylisticResults() {
    return {
      overallToneAssessment: {
        primaryTone: "Unknown",
        secondaryTones: [],
        toneConsistency: 0,
        explanation: "Analysis failed"
      },
      languageComplexity: {
        level: "moderate",
        readabilityScore: 5,
        vocabularyRichness: 5
      },
      pacingImpression: {
        overallPacing: "balanced",
        pacingVariation: 5,
        sceneLengthDistribution: []
      },
      dialogueStyle: {
        characterization: "Unknown",
        naturalness: 5,
        effectiveness: 5,
        distinctiveness: 5
      },
      descriptiveRichness: {
        visualDetailLevel: 5,
        sensoryEngagement: 5,
        atmosphericQuality: 5
      },
      stylisticConsistencyImpression: {
        consistencyScore: 5,
        deviations: []
      }
    };
  }
  extractRequiredData(input) {
    return {
      charactersCount: input.conflictNetwork.characters.size,
      conflictsCount: input.conflictNetwork.conflicts.size,
      station4Score: input.station4Output.efficiencyMetrics.overallEfficiencyScore,
      fullTextLength: input.fullText.length
    };
  }
  getErrorFallback() {
    return {
      dynamicAnalysisResults: {
        eventTimeline: [],
        networkEvolutionAnalysis: {
          overallGrowthRate: 0,
          complexityProgression: [],
          densityProgression: [],
          criticalTransitionPoints: [],
          stabilityMetrics: {
            structuralStability: 0,
            characterStability: 0,
            conflictStability: 0
          }
        },
        characterDevelopmentTracking: /* @__PURE__ */ new Map(),
        conflictProgressionTracking: /* @__PURE__ */ new Map()
      },
      episodicIntegrationResults: {
        seriesStructure: {
          totalSeasons: 0,
          episodesPerSeason: 0,
          totalEpisodes: 0,
          recommendedRuntime: 0
        },
        seasonBreakdown: /* @__PURE__ */ new Map(),
        episodeDistribution: /* @__PURE__ */ new Map(),
        balanceReport: {
          overallBalance: 0,
          conflictDistributionScore: 0,
          characterAppearanceBalance: 0,
          intensityFlowScore: 0,
          recommendations: ["Analysis failed"]
        }
      },
      symbolicAnalysisResults: this.getDefaultSymbolicResults(),
      stylisticAnalysisResults: this.getDefaultStylisticResults(),
      metadata: {
        analysisTimestamp: /* @__PURE__ */ new Date(),
        status: "Failed",
        analysisTime: 0
      }
    };
  }
};

// server/stations/station6/station6-diagnostics-treatment.ts
var Station6DiagnosticsAndTreatment = class extends BaseStation {
  constructor(config, geminiService2) {
    super(config, geminiService2);
  }
  async process(input) {
    try {
      logger_default.info("Starting Station 6: Diagnostics & Treatment Analysis");
      const diagnosticsReport = await this.runDiagnostics(input.conflictNetwork);
      const treatmentPlan = await this.generateTreatmentPlan(diagnosticsReport);
      return {
        diagnosticsReport,
        treatmentPlan,
        metadata: {
          analysisTimestamp: /* @__PURE__ */ new Date(),
          totalIssuesFound: diagnosticsReport.criticalIssues.length + diagnosticsReport.warnings.length + diagnosticsReport.suggestions.length,
          status: "Success"
        }
      };
    } catch (error) {
      logger_default.error(
        `Error in Station 6: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      throw error;
    }
  }
  async runDiagnostics(network) {
    const issues = [];
    issues.push(...this.diagnoseCharacterIssues(network));
    issues.push(...this.diagnoseConflictIssues(network));
    issues.push(...this.diagnoseRelationshipIssues(network));
    const criticalIssues = issues.filter((issue) => issue.severity === "critical");
    const warnings = issues.filter((issue) => issue.severity === "high" || issue.severity === "medium");
    const suggestions = issues.filter((issue) => issue.severity === "low");
    const overallHealthScore = this.calculateHealthScore(
      criticalIssues.length,
      warnings.length,
      suggestions.length
    );
    return {
      overallHealthScore,
      criticalIssues,
      warnings,
      suggestions
    };
  }
  diagnoseCharacterIssues(network) {
    const issues = [];
    network.characters.forEach((character, charId) => {
      const hasRelationships = Array.from(network.relationships.values()).some(
        (relationship) => relationship.source === charId || relationship.target === charId
      );
      if (!hasRelationships) {
        issues.push({
          issueId: `char-isolated-${charId}`,
          severity: "medium",
          category: "character",
          description: `Character "${character.name}" has no relationships`,
          affectedElements: [charId],
          suggestedFix: "Consider adding at least one meaningful relationship for this character"
        });
      }
      const hasConflicts = Array.from(network.conflicts.values()).some(
        (conflict) => conflict.involvedCharacters.includes(charId)
      );
      if (!hasConflicts && network.conflicts.size > 0) {
        issues.push({
          issueId: `char-no-conflict-${charId}`,
          severity: "low",
          category: "character",
          description: `Character "${character.name}" is not involved in any conflicts`,
          affectedElements: [charId],
          suggestedFix: "Consider involving this character in at least one conflict or subplot"
        });
      }
    });
    return issues;
  }
  diagnoseConflictIssues(network) {
    const issues = [];
    if (network.conflicts.size === 0) {
      issues.push({
        issueId: "no-conflicts",
        severity: "critical",
        category: "conflict",
        description: "No conflicts detected in the story",
        affectedElements: [],
        suggestedFix: "Add at least one central conflict to drive the narrative"
      });
    } else if (network.conflicts.size < 2) {
      issues.push({
        issueId: "few-conflicts",
        severity: "medium",
        category: "conflict",
        description: "Story has very few conflicts",
        affectedElements: [],
        suggestedFix: "Consider adding subplots or secondary conflicts for depth"
      });
    }
    const strengths = Array.from(network.conflicts.values()).map((conflict) => conflict.strength);
    const averageStrength = strengths.length > 0 ? strengths.reduce((sum, value) => sum + value, 0) / strengths.length : 0;
    if (averageStrength < 3) {
      issues.push({
        issueId: "low-conflict-strength",
        severity: "medium",
        category: "conflict",
        description: "Overall conflict strength is low",
        affectedElements: Array.from(network.conflicts.keys()),
        suggestedFix: "Consider raising the stakes or intensifying existing conflicts"
      });
    }
    return issues;
  }
  diagnoseRelationshipIssues(network) {
    const issues = [];
    const relationshipTypes = new Set(
      Array.from(network.relationships.values()).map((relationship) => relationship.type)
    );
    if (relationshipTypes.size < 3 && network.relationships.size > 5) {
      issues.push({
        issueId: "low-relationship-diversity",
        severity: "low",
        category: "relationship",
        description: "Limited variety in relationship types",
        affectedElements: [],
        suggestedFix: "Consider adding different types of relationships (friendship, rivalry, mentorship, etc.)"
      });
    }
    return issues;
  }
  calculateHealthScore(critical, warnings, suggestions) {
    let score = 100;
    score -= critical * 20;
    score -= warnings * 5;
    score -= suggestions * 2;
    return Math.max(0, Math.min(100, score));
  }
  async generateTreatmentPlan(diagnostics) {
    const recommendations = [];
    diagnostics.criticalIssues.forEach((issue, index) => {
      recommendations.push({
        recommendationId: `rec-critical-${index}`,
        targetIssue: issue.issueId,
        priority: 1,
        actionType: "add",
        specificAction: issue.suggestedFix,
        expectedImpact: "High impact on story coherence",
        implementationNotes: "Address this immediately"
      });
    });
    diagnostics.warnings.forEach((issue, index) => {
      recommendations.push({
        recommendationId: `rec-warning-${index}`,
        targetIssue: issue.issueId,
        priority: 2,
        actionType: "modify",
        specificAction: issue.suggestedFix,
        expectedImpact: "Moderate impact on story quality",
        implementationNotes: "Address after critical issues"
      });
    });
    diagnostics.suggestions.forEach((issue, index) => {
      recommendations.push({
        recommendationId: `rec-suggestion-${index}`,
        targetIssue: issue.issueId,
        priority: 3,
        actionType: "strengthen",
        specificAction: issue.suggestedFix,
        expectedImpact: "Incremental improvement to story depth",
        implementationNotes: "Schedule when higher priority work is complete"
      });
    });
    recommendations.sort((a, b) => a.priority - b.priority);
    const potentialImprovement = this.estimateImprovement(diagnostics);
    const estimatedImprovementScore = Math.min(
      100,
      diagnostics.overallHealthScore + potentialImprovement
    );
    const implementationComplexity = this.determineComplexity(recommendations);
    return {
      prioritizedRecommendations: recommendations,
      estimatedImprovementScore,
      implementationComplexity
    };
  }
  estimateImprovement(diagnostics) {
    let improvement = 0;
    improvement += diagnostics.criticalIssues.length * 17;
    improvement += diagnostics.warnings.length * 4;
    improvement += diagnostics.suggestions.length * 1.5;
    return improvement;
  }
  determineComplexity(recommendations) {
    if (recommendations.length === 0) {
      return "low";
    }
    if (recommendations.length <= 3) {
      return "low";
    }
    if (recommendations.length <= 7) {
      return "medium";
    }
    return "high";
  }
  extractRequiredData(input) {
    return {
      networkSize: input.conflictNetwork.characters.size,
      conflictsCount: input.conflictNetwork.conflicts.size
    };
  }
  getErrorFallback() {
    return {
      diagnosticsReport: {
        overallHealthScore: 0,
        criticalIssues: [
          {
            issueId: "error-occurred",
            severity: "critical",
            category: "structure",
            description: "Analysis failed due to an error",
            affectedElements: [],
            suggestedFix: "Please retry the analysis"
          }
        ],
        warnings: [],
        suggestions: []
      },
      treatmentPlan: {
        prioritizedRecommendations: [],
        estimatedImprovementScore: 0,
        implementationComplexity: "high"
      },
      metadata: {
        analysisTimestamp: /* @__PURE__ */ new Date(),
        totalIssuesFound: 1,
        status: "Failed"
      }
    };
  }
};

// server/stations/station7/station7-finalization.ts
import { promises as fsPromises } from "fs";
import * as path2 from "path";
var VisualizationEngine = class {
  constructor(network, outputDir) {
    this.network = network;
    this.outputDir = outputDir;
  }
  async ensureDirectories() {
    const directories = ["graphs", "charts", "interactive"].map(
      (subDir) => path2.join(this.outputDir, subDir)
    );
    await Promise.all(
      directories.map(async (dir) => {
        try {
          await fsPromises.mkdir(dir, { recursive: true });
        } catch (error) {
          logger_default.error(
            `Failed to create visualization directory ${dir}: ${error instanceof Error ? error.message : "Unknown error"}`
          );
          throw error;
        }
      })
    );
  }
  async generateAllVisualizations() {
    await this.ensureDirectories();
    return {
      networkGraphs: /* @__PURE__ */ new Map(),
      timelineVisualizations: /* @__PURE__ */ new Map(),
      statisticalCharts: /* @__PURE__ */ new Map(),
      interactiveElements: []
    };
  }
};
var PlatformAdaptationEngine = class {
  constructor(network, s2Conceptual) {
    this.network = network;
    this.s2Conceptual = s2Conceptual;
  }
  async generateAllAdaptations() {
    return {
      episodicBreakdown: {},
      cinematicSuggestions: {},
      serializedNovelStructure: {},
      comparativeAnalysis: "Comparative analysis not yet implemented."
    };
  }
};
var FinalReportGenerator = class {
  constructor(network, allStationsData) {
    this.network = network;
    this.allStationsData = allStationsData;
  }
  async generateComprehensiveReport() {
    return {
      executiveSummary: "Executive summary not yet implemented.",
      strengthsAnalysis: [],
      weaknessesIdentified: [],
      opportunitiesForImprovement: [],
      threatsToCohesion: [],
      overallAssessment: {
        narrativeQualityScore: 0,
        structuralIntegrityScore: 0,
        characterDevelopmentScore: 0,
        conflictEffectivenessScore: 0,
        overallScore: 0,
        rating: "Fair"
      },
      detailedFindings: /* @__PURE__ */ new Map()
    };
  }
};
var ExportPackageGenerator = class {
  constructor(outputDir, allStationsData, finalReport) {
    this.outputDir = outputDir;
    this.allStationsData = allStationsData;
    this.finalReport = finalReport;
  }
  async generateExportPackage() {
    return {
      formats: /* @__PURE__ */ new Map(),
      deliverables: [],
      packagePath: this.outputDir
    };
  }
};
var Station7Finalization = class extends BaseStation {
  constructor(config, geminiService2, outputDir = "analysis_output") {
    super(config, geminiService2);
    this.outputDir = outputDir;
  }
  async process(input) {
    const startTime = Date.now();
    logger_default.info("S7: Starting finalization and visualization...");
    try {
      await fsPromises.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      logger_default.error(
        `S7: Failed to ensure output directory: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      throw error;
    }
    this.visualizationEngine = new VisualizationEngine(input.conflictNetwork, this.outputDir);
    this.adaptationEngine = new PlatformAdaptationEngine(input.conflictNetwork, input.allPreviousStationsData.get(2));
    this.reportGenerator = new FinalReportGenerator(input.conflictNetwork, input.allPreviousStationsData);
    const visualizationResults = await this.visualizationEngine.generateAllVisualizations();
    logger_default.info("S7: Visualizations generated.");
    const platformAdaptationSuggestions = await this.adaptationEngine.generateAllAdaptations();
    logger_default.info("S7: Platform adaptations suggested.");
    const finalReport = await this.reportGenerator.generateComprehensiveReport();
    logger_default.info("S7: Final report generated.");
    this.exportGenerator = new ExportPackageGenerator(this.outputDir, input.allPreviousStationsData, finalReport);
    const exportPackage = await this.exportGenerator.generateExportPackage();
    logger_default.info("S7: Export package created.");
    await this.saveOutputs(finalReport, visualizationResults);
    const processingTime = Date.now() - startTime;
    const filesGenerated = this.countGeneratedFiles(visualizationResults);
    return {
      visualizationResults,
      platformAdaptationSuggestions,
      finalReport,
      exportPackage,
      metadata: {
        analysisTimestamp: /* @__PURE__ */ new Date(),
        status: "Success",
        processingTime,
        filesGenerated
      }
    };
  }
  async saveOutputs(finalReport, visualizationResults) {
    try {
      const reportPath = path2.join(this.outputDir, "final-report.json");
      await fsPromises.writeFile(
        reportPath,
        JSON.stringify(finalReport, null, 2),
        "utf-8"
      );
      logger_default.info(`S7: Saved final report to ${reportPath}`);
      const visualizationPayload = {
        networkGraphs: Array.from(visualizationResults.networkGraphs.entries()),
        timelineVisualizations: Array.from(
          visualizationResults.timelineVisualizations.entries()
        ),
        statisticalCharts: Array.from(
          visualizationResults.statisticalCharts.entries()
        ),
        interactiveElements: visualizationResults.interactiveElements
      };
      const visualizationPath = path2.join(this.outputDir, "visualizations.json");
      await fsPromises.writeFile(
        visualizationPath,
        JSON.stringify(visualizationPayload, null, 2),
        "utf-8"
      );
      logger_default.info(`S7: Saved visualizations to ${visualizationPath}`);
    } catch (error) {
      logger_default.error(
        `S7: Failed to save outputs: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      throw new Error("Output save operation failed");
    }
  }
  countGeneratedFiles(visualizationResults) {
    const visualizationCount = visualizationResults.networkGraphs.size + visualizationResults.timelineVisualizations.size + visualizationResults.statisticalCharts.size + visualizationResults.interactiveElements.length;
    return visualizationCount + 2;
  }
  extractRequiredData(input) {
    return {
      charactersCount: input.conflictNetwork.characters.size,
      conflictsCount: input.conflictNetwork.conflicts.size,
      station6Issues: input.station6Output.diagnosticsReport.criticalIssues.length,
      stationsTracked: input.allPreviousStationsData.size
    };
  }
  getErrorFallback() {
    return {
      visualizationResults: {
        networkGraphs: /* @__PURE__ */ new Map(),
        timelineVisualizations: /* @__PURE__ */ new Map(),
        statisticalCharts: /* @__PURE__ */ new Map(),
        interactiveElements: []
      },
      platformAdaptationSuggestions: {
        episodicBreakdown: {},
        cinematicSuggestions: {},
        serializedNovelStructure: {},
        comparativeAnalysis: "Failed to generate comparative analysis."
      },
      finalReport: {
        executiveSummary: "Failed to generate final report.",
        strengthsAnalysis: [],
        weaknessesIdentified: [],
        opportunitiesForImprovement: [],
        threatsToCohesion: [],
        overallAssessment: {
          narrativeQualityScore: 0,
          structuralIntegrityScore: 0,
          characterDevelopmentScore: 0,
          conflictEffectivenessScore: 0,
          overallScore: 0,
          rating: "Critical"
        },
        detailedFindings: /* @__PURE__ */ new Map()
      },
      exportPackage: {
        formats: /* @__PURE__ */ new Map(),
        deliverables: [],
        packagePath: this.outputDir
      },
      metadata: {
        analysisTimestamp: /* @__PURE__ */ new Date(),
        status: "Failed",
        processingTime: 0,
        filesGenerated: 0
      }
    };
  }
};

// server/run-all-stations.ts
var AnalysisPipeline = class {
  constructor(config) {
    this.stationStatuses = /* @__PURE__ */ new Map();
    if (!config.apiKey) {
      throw new Error("GEMINI_API_KEY is required to initialise the analysis pipeline.");
    }
    this.geminiService = config.geminiService ?? new GeminiService({
      apiKey: config.apiKey,
      defaultModel: "gemini-2.5-pro" /* PRO */,
      fallbackModel: "gemini-2.0-flash-lite" /* FLASH */,
      maxRetries: 3,
      timeout: 6e4
    });
    this.outputDirectory = config.outputDir ?? path3.join(process.cwd(), "analysis_output");
    if (!fs2.existsSync(this.outputDirectory)) {
      fs2.mkdirSync(this.outputDirectory, { recursive: true });
    }
    this.station1 = new Station1TextAnalysis(this.createStationConfig(1, "Text Analysis"), this.geminiService);
    this.station2 = new Station2ConceptualAnalysis(this.createStationConfig(2, "Conceptual Analysis"), this.geminiService);
    this.station3 = new Station3NetworkBuilder(this.createStationConfig(3, "Network Builder"), this.geminiService);
    this.station4 = new Station4EfficiencyMetrics(this.createStationConfig(4, "Efficiency Metrics"), this.geminiService);
    this.station5 = new Station5DynamicSymbolicStylistic(this.createStationConfig(5, "Dynamic/Symbolic/Stylistic Analysis"), this.geminiService);
    this.station6 = new Station6DiagnosticsAndTreatment(this.createStationConfig(6, "Diagnostics & Treatment"), this.geminiService);
    this.station7 = new Station7Finalization(
      this.createStationConfig(7, "Finalization & Visualization"),
      this.geminiService,
      this.outputDirectory
    );
    for (let i = 1; i <= 7; i += 1) {
      this.stationStatuses.set(i, "pending");
    }
  }
  getStationStatus() {
    const status = {};
    this.stationStatuses.forEach((value, key) => {
      status[`station${key}`] = value;
    });
    return status;
  }
  async runFullAnalysis(input) {
    const startedAt = Date.now();
    let stationsCompleted = 0;
    const stationData = /* @__PURE__ */ new Map();
    const runStation = async (stationNumber, execute) => {
      this.stationStatuses.set(stationNumber, "running");
      try {
        const { output } = await execute();
        this.stationStatuses.set(stationNumber, "completed");
        stationsCompleted += 1;
        stationData.set(stationNumber, output);
        return output;
      } catch (error) {
        this.stationStatuses.set(stationNumber, "error");
        logger_default.error(`Station ${stationNumber} failed`, {
          error: error instanceof Error ? error.message : "Unknown error"
        });
        throw error;
      }
    };
    const station1Input = {
      fullText: input.fullText,
      projectName: input.projectName
    };
    if (input.proseFilePath !== void 0) {
      station1Input.proseFilePath = input.proseFilePath;
    }
    const station1Output = await runStation(1, () => this.station1.execute(station1Input));
    const station2Output = await runStation(2, () => this.station2.execute({
      station1Output,
      fullText: input.fullText
    }));
    const station3Output = await runStation(3, () => this.station3.execute({
      station1Output,
      station2Output,
      fullText: input.fullText
    }));
    const station4Output = await runStation(4, () => this.station4.execute({
      station3Output
    }));
    const station5Output = await runStation(5, () => this.station5.execute({
      conflictNetwork: station3Output.conflictNetwork,
      station4Output,
      fullText: input.fullText
    }));
    const station6Output = await runStation(6, () => this.station6.execute({
      conflictNetwork: station3Output.conflictNetwork,
      station5Output
    }));
    const station7Output = await runStation(7, () => this.station7.execute({
      conflictNetwork: station3Output.conflictNetwork,
      station6Output,
      allPreviousStationsData: stationData
    }));
    const finishedAt = Date.now();
    return {
      stationOutputs: {
        station1: station1Output,
        station2: station2Output,
        station3: station3Output,
        station4: station4Output,
        station5: station5Output,
        station6: station6Output,
        station7: station7Output
      },
      pipelineMetadata: {
        stationsCompleted,
        totalExecutionTime: finishedAt - startedAt,
        startedAt: new Date(startedAt).toISOString(),
        finishedAt: new Date(finishedAt).toISOString()
      }
    };
  }
  createStationConfig(stationNumber, stationName) {
    return {
      stationNumber,
      stationName,
      cacheEnabled: false,
      performanceTracking: true,
      inputValidation: (input) => input !== void 0 && input !== null,
      outputValidation: (output) => output !== void 0 && output !== null
    };
  }
};

// server/middleware/auth.ts
function apiKeyAuth(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) {
    res.status(401).json({
      error: "Authentication required",
      message: "Please provide an API key in X-API-Key header"
    });
    return;
  }
  const validApiKeys = (process.env.VALID_API_KEYS || "").split(",").filter(Boolean);
  if (validApiKeys.length === 0) {
    logger_default.warn("\u26A0\uFE0F No API keys configured. Authentication is disabled.", {
      context: "apiKeyAuth"
    });
    req.apiKey = apiKey;
    next();
    return;
  }
  if (!validApiKeys.includes(apiKey)) {
    res.status(403).json({
      error: "Invalid API key",
      message: "The provided API key is not valid"
    });
    return;
  }
  req.apiKey = apiKey;
  next();
}
function optionalAuth(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  if (apiKey) {
    const validApiKeys = (process.env.VALID_API_KEYS || "").split(",").filter(Boolean);
    if (validApiKeys.includes(apiKey)) {
      req.apiKey = apiKey;
    }
  }
  next();
}

// server/middleware/rate-limit.ts
import rateLimit from "express-rate-limit";
var apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 100,
  message: {
    error: "Too many requests",
    message: "You have exceeded the rate limit. Please try again later.",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (process.env.NODE_ENV === "development" && (req.ip === "127.0.0.1" || req.ip === "::1")) {
      return true;
    }
    return false;
  }
});
var aiAnalysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  max: 10,
  message: {
    error: "Too many analysis requests",
    message: "You have exceeded the analysis rate limit. Please try again in an hour.",
    retryAfter: "1 hour"
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});
var readLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 1e3,
  message: {
    error: "Too many requests",
    message: "Please slow down your requests."
  }
});

// server/middleware/sanitize.ts
function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === "object") {
    sanitizeObject(req.body);
  }
  next();
}
function sanitizeObject(obj) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === "string") {
        obj[key] = value.replace(/\0/g, "");
        const sanitizedValue = obj[key];
        if (typeof sanitizedValue === "string" && sanitizedValue.length > 5e5) {
          obj[key] = sanitizedValue.substring(0, 5e5);
        }
      } else if (typeof value === "object" && value !== null) {
        sanitizeObject(value);
      }
    }
  }
}
function requireJsonContent(req, res, next) {
  const contentType = req.headers["content-type"];
  if (!contentType || !contentType.includes("application/json")) {
    res.status(415).json({
      error: "Unsupported Media Type",
      message: "Content-Type must be application/json"
    });
    return;
  }
  next();
}

// server/routes/health.ts
import { Router } from "express";
import * as fs3 from "fs";
import * as path4 from "path";
var router = Router();
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    uptime: process.uptime()
  });
});
router.get("/ready", async (req, res) => {
  const checks = {};
  let isReady = true;
  checks.geminiApiKey = Boolean(process.env.GEMINI_API_KEY);
  if (!checks.geminiApiKey) {
    isReady = false;
  }
  try {
    const testFile = path4.join(process.cwd(), ".health-check-test");
    fs3.writeFileSync(testFile, "test");
    fs3.unlinkSync(testFile);
    checks.fileSystem = true;
  } catch {
    checks.fileSystem = false;
    isReady = false;
  }
  const status = isReady ? 200 : 503;
  res.status(status).json({
    status: isReady ? "ready" : "not ready",
    checks,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.get("/live", (req, res) => {
  res.status(200).json({
    status: "alive",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
var health_default = router;

// server/routes.ts
var GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
if (!GEMINI_API_KEY) {
  logger_default.warn("\u26A0\uFE0F  GEMINI_API_KEY is not set. Text analysis will fail.");
  logger_default.warn("Please set GEMINI_API_KEY in your environment variables.");
}
var geminiService = new GeminiService({
  apiKey: GEMINI_API_KEY,
  defaultModel: "gemini-2.5-pro" /* PRO */,
  fallbackModel: "gemini-2.0-flash-lite" /* FLASH */,
  maxRetries: 3,
  timeout: 6e4
});
var analysisPipeline = new AnalysisPipeline({
  apiKey: GEMINI_API_KEY,
  geminiService
});
var station1 = new Station1TextAnalysis(createStationConfig(1, "Text Analysis"), geminiService);
var station2 = new Station2ConceptualAnalysis(createStationConfig(2, "Conceptual Analysis"), geminiService);
var station3 = new Station3NetworkBuilder(createStationConfig(3, "Network Builder"), geminiService);
async function registerRoutes(app2) {
  app2.use("/", health_default);
  app2.use("/api", apiLimiter);
  app2.post(
    "/api/analyze-text",
    requireJsonContent,
    apiKeyAuth,
    aiAnalysisLimiter,
    sanitizeInput,
    async (req, res) => {
      try {
        const validatedData = analyzeTextSchema.parse(req.body);
        const station1Input = {
          fullText: validatedData.fullText,
          projectName: validatedData.projectName
        };
        if (validatedData.proseFilePath !== void 0) {
          station1Input.proseFilePath = validatedData.proseFilePath;
        }
        const station1Result = await station1.execute(station1Input);
        const station2Result = await station2.execute({
          station1Output: station1Result.output,
          fullText: validatedData.fullText
        });
        const station3Result = await station3.execute({
          station1Output: station1Result.output,
          station2Output: station2Result.output,
          fullText: validatedData.fullText
        });
        const response = station1Result.output;
        res.json({
          station1: {
            majorCharacters: response.majorCharacters,
            characterAnalysis: Object.fromEntries(response.characterAnalysis),
            relationshipAnalysis: response.relationshipAnalysis,
            narrativeStyleAnalysis: response.narrativeStyleAnalysis,
            metadata: {
              analysisTimestamp: response.metadata.analysisTimestamp.toISOString(),
              status: response.metadata.status
            }
          },
          station2: {
            storyStatement: station2Result.output.storyStatement,
            elevatorPitch: station2Result.output.elevatorPitch,
            hybridGenre: station2Result.output.hybridGenre
          },
          station3: {
            networkSummary: station3Result.output.networkSummary
          }
        });
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            error: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629",
            message: error.flatten()
          });
          return;
        }
        logger_default.error("Error analyzing text", {
          error: error instanceof Error ? error.message : "Unknown error"
        });
        res.status(500).json({
          error: "\u0641\u0634\u0644 \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0646\u0635",
          message: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  );
  app2.post(
    "/api/analyze-full-pipeline",
    requireJsonContent,
    apiKeyAuth,
    aiAnalysisLimiter,
    sanitizeInput,
    async (req, res) => {
      try {
        const validatedData = analyzeTextSchema.parse(req.body);
        const pipelineInput = {
          fullText: validatedData.fullText,
          projectName: validatedData.projectName
        };
        if (validatedData.proseFilePath !== void 0) {
          pipelineInput.proseFilePath = validatedData.proseFilePath;
        }
        const result = await analysisPipeline.runFullAnalysis(pipelineInput);
        res.json({
          success: true,
          data: toSerializable(result.stationOutputs),
          metadata: result.pipelineMetadata,
          message: `\u062A\u0645 \u0625\u0646\u062C\u0627\u0632 ${result.pipelineMetadata.stationsCompleted} \u0645\u062D\u0637\u0627\u062A \u0645\u0646 \u0623\u0635\u0644 7`,
          executionTime: `${(result.pipelineMetadata.totalExecutionTime / 1e3).toFixed(1)} \u062B\u0627\u0646\u064A\u0629`
        });
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            success: false,
            error: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629",
            message: error.flatten()
          });
          return;
        }
        logger_default.error("Error in full pipeline", {
          error: error instanceof Error ? error.message : "Unknown error"
        });
        res.status(500).json({
          success: false,
          error: "\u0641\u0634\u0644 \u062A\u0634\u063A\u064A\u0644 Pipeline \u0627\u0644\u0634\u0627\u0645\u0644",
          message: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  );
  app2.get("/api/stations-status", optionalAuth, readLimiter, (_req, res) => {
    const status = analysisPipeline.getStationStatus();
    const values = Object.values(status);
    res.json({
      success: true,
      stations: status,
      totalStations: values.length,
      availableStations: values.filter((value) => value === "completed").length
    });
  });
  const httpServer = createServer(app2);
  return httpServer;
}
function createStationConfig(stationNumber, stationName) {
  return {
    stationNumber,
    stationName,
    cacheEnabled: false,
    performanceTracking: true,
    inputValidation: (input) => input !== void 0 && input !== null,
    outputValidation: (output) => output !== void 0 && output !== null
  };
}
function toSerializable(value) {
  if (value instanceof Map) {
    return Object.fromEntries(Array.from(value.entries()).map(([key, mapValue]) => [key, toSerializable(mapValue)]));
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map((item) => toSerializable(item));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entryValue]) => [key, toSerializable(entryValue)]));
  }
  return value;
}

// server/vite.ts
import express from "express";
import fs4 from "fs";
import path6 from "path";
import { createServer as createViteServer, createLogger as createLogger2 } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path5 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  base: "/stations/",
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path5.resolve(__dirname, "src"),
      "@shared": path5.resolve(__dirname, "shared"),
      "@assets": path5.resolve(__dirname, "attached_assets")
    }
  },
  root: path5.resolve(__dirname),
  build: {
    outDir: path5.resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // فصل مكتبات React
          "react-vendor": ["react", "react-dom"],
          // فصل مكتبات UI
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast"
          ],
          // فصل مكتبات الرسم البياني
          "chart-vendor": ["recharts"],
          // فصل مكتبات AI
          "ai-vendor": ["@google/generative-ai"],
          // فصل مكتبات النماذج
          "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],
          // فصل مكتبات التصميم
          "design-vendor": ["tailwindcss", "class-variance-authority", "clsx", "tailwind-merge"]
        },
        // تحسين أسماء الملفات
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split("/").pop()?.replace(".tsx", "").replace(".ts", "") : "chunk";
          return `assets/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split(".").pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || "")) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType || "")) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // تحسينات الأداء
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"]
      },
      mangle: {
        safari10: true
      }
    },
    // تحسين حجم الحزمة
    chunkSizeWarningLimit: 1e3,
    // تحسين التحميل
    target: "esnext",
    cssCodeSplit: true,
    sourcemap: process.env.NODE_ENV === "development"
  },
  server: {
    port: 5002,
    host: true,
    strictPort: true,
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger2();
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path6.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs4.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path6.resolve(import.meta.dirname, "public");
  if (!fs4.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path6.resolve(distPath, "index.html"));
  });
}

// server/config/environment.ts
import { z as z2 } from "zod";
var environmentSchema = z2.object({
  // إعدادات التطبيق الأساسية
  NODE_ENV: z2.enum(["development", "production", "test"]).default("development"),
  PORT: z2.string().transform(Number).default("5000"),
  API_BASE_URL: z2.string().url().default("http://localhost:5000"),
  // إعدادات قاعدة البيانات
  DATABASE_URL: z2.string().min(1, "DATABASE_URL is required"),
  // إعدادات Gemini AI
  GEMINI_API_KEY: z2.string().min(1, "GEMINI_API_KEY is required"),
  // إعدادات الأمان
  VALID_API_KEYS: z2.string().transform((val) => val.split(",").filter(Boolean)),
  SESSION_SECRET: z2.string().min(32, "SESSION_SECRET must be at least 32 characters"),
  ALLOWED_ORIGINS: z2.string().transform((val) => val.split(",").filter(Boolean)),
  // إعدادات Redis (اختياري)
  REDIS_HOST: z2.string().default("localhost"),
  REDIS_PORT: z2.string().transform(Number).default("6379"),
  REDIS_PASSWORD: z2.string().optional(),
  REDIS_URL: z2.string().optional(),
  // إعدادات المراقبة والتسجيل
  LOG_LEVEL: z2.enum(["error", "warn", "info", "debug"]).default("info"),
  SENTRY_DSN: z2.string().url().optional(),
  // إعدادات Rate Limiting
  RATE_LIMIT_WINDOW_MS: z2.string().transform(Number).default("900000"),
  RATE_LIMIT_MAX_REQUESTS: z2.string().transform(Number).default("100"),
  AI_ANALYSIS_RATE_LIMIT_MAX: z2.string().transform(Number).default("10"),
  AI_ANALYSIS_RATE_LIMIT_WINDOW_MS: z2.string().transform(Number).default("3600000"),
  // إعدادات التخزين المؤقت
  CACHE_TTL_SECONDS: z2.string().transform(Number).default("3600"),
  ENABLE_CACHE: z2.string().transform((val) => val === "true").default("false"),
  // إعدادات قاعدة البيانات المتقدمة
  DB_POOL_MIN: z2.string().transform(Number).default("2"),
  DB_POOL_MAX: z2.string().transform(Number).default("10"),
  DB_POOL_IDLE_TIMEOUT_MS: z2.string().transform(Number).default("30000"),
  DB_POOL_ACQUIRE_TIMEOUT_MS: z2.string().transform(Number).default("60000"),
  // إعدادات الأمان المتقدمة
  JWT_EXPIRES_IN: z2.string().transform(Number).default("86400"),
  SESSION_MAX_AGE: z2.string().transform(Number).default("86400000"),
  FORCE_HTTPS: z2.string().transform((val) => val === "true").default("false"),
  // إعدادات التطوير
  DEBUG: z2.string().transform((val) => val === "true").default("false"),
  VERBOSE_LOGGING: z2.string().transform((val) => val === "true").default("false"),
  // إعدادات الإنتاج
  ENABLE_COMPRESSION: z2.string().transform((val) => val === "true").default("true"),
  ENABLE_PERFORMANCE_OPTIMIZATIONS: z2.string().transform((val) => val === "true").default("true"),
  // إعدادات النسخ الاحتياطي
  BACKUP_ENABLED: z2.string().transform((val) => val === "true").default("false"),
  BACKUP_SCHEDULE: z2.string().default("0 2 * * *"),
  BACKUP_RETENTION_DAYS: z2.string().transform(Number).default("30")
});
var EnvironmentManager = class {
  constructor() {
    this.isInitialized = false;
    this.config = this.loadEnvironment();
  }
  loadEnvironment() {
    try {
      const config = environmentSchema.parse(process.env);
      this.isInitialized = true;
      logger_default.info("Environment configuration loaded successfully", {
        nodeEnv: config.NODE_ENV,
        port: config.PORT,
        apiBaseUrl: config.API_BASE_URL,
        cacheEnabled: config.ENABLE_CACHE,
        debugMode: config.DEBUG
      });
      return config;
    } catch (error) {
      if (error instanceof z2.ZodError) {
        const missingVars = error.errors.filter((err) => err.code === "invalid_type" && err.received === "undefined").map((err) => err.path.join("."));
        const invalidVars = error.errors.filter((err) => err.code !== "invalid_type").map((err) => `${err.path.join(".")}: ${err.message}`);
        logger_default.error("Environment configuration validation failed", {
          missingVariables: missingVars,
          invalidVariables: invalidVars,
          totalErrors: error.errors.length
        });
        throw new Error(
          `Environment configuration failed:
Missing variables: ${missingVars.join(", ")}
Invalid variables: ${invalidVars.join(", ")}`
        );
      }
      logger_default.error("Failed to load environment configuration", { error });
      throw error;
    }
  }
  getConfig() {
    if (!this.isInitialized) {
      throw new Error("Environment not initialized");
    }
    return this.config;
  }
  isDevelopment() {
    return this.config.NODE_ENV === "development";
  }
  isProduction() {
    return this.config.NODE_ENV === "production";
  }
  isTest() {
    return this.config.NODE_ENV === "test";
  }
  getDatabaseConfig() {
    return {
      url: this.config.DATABASE_URL,
      pool: {
        min: this.config.DB_POOL_MIN,
        max: this.config.DB_POOL_MAX,
        idleTimeoutMillis: this.config.DB_POOL_IDLE_TIMEOUT_MS,
        acquireTimeoutMillis: this.config.DB_POOL_ACQUIRE_TIMEOUT_MS
      }
    };
  }
  getRedisConfig() {
    return {
      host: this.config.REDIS_HOST,
      port: this.config.REDIS_PORT,
      password: this.config.REDIS_PASSWORD,
      url: this.config.REDIS_URL
    };
  }
  getSecurityConfig() {
    return {
      validApiKeys: this.config.VALID_API_KEYS,
      sessionSecret: this.config.SESSION_SECRET,
      allowedOrigins: this.config.ALLOWED_ORIGINS,
      jwtExpiresIn: this.config.JWT_EXPIRES_IN,
      sessionMaxAge: this.config.SESSION_MAX_AGE,
      forceHttps: this.config.FORCE_HTTPS
    };
  }
  getRateLimitConfig() {
    return {
      windowMs: this.config.RATE_LIMIT_WINDOW_MS,
      maxRequests: this.config.RATE_LIMIT_MAX_REQUESTS,
      aiAnalysisMax: this.config.AI_ANALYSIS_RATE_LIMIT_MAX,
      aiAnalysisWindowMs: this.config.AI_ANALYSIS_RATE_LIMIT_WINDOW_MS
    };
  }
  getCacheConfig() {
    return {
      ttlSeconds: this.config.CACHE_TTL_SECONDS,
      enabled: this.config.ENABLE_CACHE
    };
  }
  getLoggingConfig() {
    return {
      level: this.config.LOG_LEVEL,
      verbose: this.config.VERBOSE_LOGGING,
      debug: this.config.DEBUG
    };
  }
  getPerformanceConfig() {
    return {
      enableCompression: this.config.ENABLE_COMPRESSION,
      enableOptimizations: this.config.ENABLE_PERFORMANCE_OPTIMIZATIONS
    };
  }
  getBackupConfig() {
    return {
      enabled: this.config.BACKUP_ENABLED,
      schedule: this.config.BACKUP_SCHEDULE,
      retentionDays: this.config.BACKUP_RETENTION_DAYS
    };
  }
  // دالة للتحقق من صحة الإعدادات في وقت التشغيل
  validateRuntimeConfig() {
    const config = this.getConfig();
    if (config.SESSION_SECRET.length < 32) {
      logger_default.warn("SESSION_SECRET is too short, consider using a longer secret");
    }
    if (config.VALID_API_KEYS.length === 0) {
      logger_default.warn("No API keys configured, authentication is disabled");
    }
    if (!config.DATABASE_URL.includes("://")) {
      logger_default.error("Invalid DATABASE_URL format");
      throw new Error("Invalid DATABASE_URL format");
    }
    if (config.isProduction && config.ENABLE_CACHE && !config.REDIS_URL) {
      logger_default.warn("Cache is enabled but REDIS_URL is not configured");
    }
    logger_default.info("Runtime configuration validation completed");
  }
};
var environment = new EnvironmentManager();

// server/middleware/security.ts
import helmet from "helmet";
import cors from "cors";
var corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = environment.getSecurityConfig().allowedOrigins;
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger_default.warn("CORS blocked request", { origin, allowedOrigins });
      callback(new Error("Not allowed by CORS policy"), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-API-Key",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers"
  ],
  exposedHeaders: ["X-Total-Count", "X-Page-Count"],
  maxAge: 86400,
  // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};
var securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        // مطلوب لـ Vite في التطوير
        ...environment.isDevelopment() ? ["'unsafe-eval'"] : []
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:"
      ],
      connectSrc: [
        "'self'",
        "https://generativelanguage.googleapis.com",
        // Gemini API
        "wss:",
        // WebSocket connections
        ...environment.isDevelopment() ? ["ws:", "http://localhost:*"] : []
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      manifestSrc: ["'self'"]
    },
    reportOnly: environment.isDevelopment()
  },
  crossOriginEmbedderPolicy: false,
  // مطلوب لبعض المكتبات
  hsts: environment.isProduction() ? {
    maxAge: 31536e3,
    // 1 year
    includeSubDomains: true,
    preload: true
  } : false,
  noSniff: true,
  xssFilter: true,
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin"
  },
  frameguard: {
    action: "deny"
  },
  hidePoweredBy: true,
  crossOriginResourcePolicy: {
    policy: "cross-origin"
  }
});
var enforceHttps = (req, res, next) => {
  if (environment.isProduction() && environment.getSecurityConfig().forceHttps) {
    const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https" || req.headers["x-forwarded-ssl"] === "on";
    if (!isHttps) {
      logger_default.warn("HTTPS enforcement: redirecting HTTP to HTTPS", {
        url: req.url,
        ip: req.ip,
        userAgent: req.get("User-Agent")
      });
      return res.redirect(301, `https://${req.get("host")}${req.url}`);
    }
  }
  next();
};
var requestSizeLimit = (maxSize = 10 * 1024 * 1024) => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get("content-length") || "0");
    if (contentLength > maxSize) {
      logger_default.warn("Request size limit exceeded", {
        contentLength,
        maxSize,
        url: req.url,
        ip: req.ip
      });
      return res.status(413).json({
        error: "Request too large",
        message: `Request size exceeds ${maxSize / 1024 / 1024}MB limit`,
        maxSize
      });
    }
    next();
  };
};
var securityLogger = (req, res, next) => {
  const suspiciousPatterns = [
    /\.\./,
    // Directory traversal
    /<script/i,
    // XSS attempts
    /union.*select/i,
    // SQL injection
    /javascript:/i,
    // JavaScript injection
    /on\w+\s*=/i,
    // Event handler injection
    /eval\s*\(/i,
    // Code injection
    /document\.cookie/i,
    // Cookie manipulation
    /window\.location/i
    // Location manipulation
  ];
  const userInput = [
    req.url,
    req.query,
    req.body,
    req.headers
  ].flat();
  const inputString = JSON.stringify(userInput).toLowerCase();
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(inputString)) {
      logger_default.warn("Suspicious activity detected", {
        pattern: pattern.toString(),
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        headers: req.headers,
        body: req.body
      });
      if (environment.isProduction()) {
        logger_default.error("Suspicious activity in production", {
          ip: req.ip,
          pattern: pattern.toString()
        });
      }
      break;
    }
  }
  next();
};
var userAgentValidation = (req, res, next) => {
  const userAgent = req.get("User-Agent");
  if (!userAgent) {
    logger_default.warn("Request without User-Agent header", {
      url: req.url,
      ip: req.ip
    });
    return res.status(400).json({
      error: "User-Agent header required",
      message: "Please include a valid User-Agent header"
    });
  }
  const suspiciousUserAgents = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
    /burp/i,
    /w3af/i,
    /havij/i,
    /acunetix/i
  ];
  for (const pattern of suspiciousUserAgents) {
    if (pattern.test(userAgent)) {
      logger_default.warn("Suspicious User-Agent detected", {
        userAgent,
        url: req.url,
        ip: req.ip
      });
      return res.status(403).json({
        error: "Access denied",
        message: "Invalid User-Agent"
      });
    }
  }
  next();
};
var advancedRateLimit = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1e3;
  const maxRequests = 100;
  if (!req.app.locals.rateLimitStore) {
    req.app.locals.rateLimitStore = /* @__PURE__ */ new Map();
  }
  const store = req.app.locals.rateLimitStore;
  const key = `${ip}:${Math.floor(now / windowMs)}`;
  const current = store.get(key) || 0;
  if (current >= maxRequests) {
    logger_default.warn("Rate limit exceeded", {
      ip,
      current,
      maxRequests,
      url: req.url
    });
    return res.status(429).json({
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later.",
      retryAfter: Math.ceil(windowMs / 1e3)
    });
  }
  store.set(key, current + 1);
  if (store.size > 1e3) {
    const cutoff = Math.floor((now - windowMs) / windowMs);
    for (const [k] of store) {
      const timestamp2 = parseInt(k.split(":")[1]);
      if (timestamp2 < cutoff) {
        store.delete(k);
      }
    }
  }
  next();
};
var applySecurityMiddleware = (app2) => {
  app2.use(cors(corsOptions));
  app2.use(securityHeaders);
  app2.use(enforceHttps);
  app2.use(requestSizeLimit(10 * 1024 * 1024));
  app2.use(securityLogger);
  app2.use(userAgentValidation);
  app2.use(advancedRateLimit);
  logger_default.info("Security middleware applied successfully");
};

// server/middleware/error-handler.ts
import { ZodError as ZodError2 } from "zod";
var AppError = class extends Error {
  constructor(message, statusCode = 500, isOperational = true, code, details) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
};
var NotFoundError = class extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, true, "NOT_FOUND");
  }
};
var RateLimitError = class extends AppError {
  constructor(message = "Rate limit exceeded") {
    super(message, 429, true, "RATE_LIMIT_EXCEEDED");
  }
};
var errorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let code = "INTERNAL_ERROR";
  let details = void 0;
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code || "APP_ERROR";
    details = error.details;
  } else if (error instanceof ZodError2) {
    statusCode = 400;
    message = "Validation Error";
    code = "VALIDATION_ERROR";
    details = {
      issues: error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
        code: err.code
      }))
    };
  } else if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid data format";
    code = "INVALID_FORMAT";
  } else if (error.name === "MongoError" || error.name === "MongooseError") {
    statusCode = 500;
    message = "Database error";
    code = "DATABASE_ERROR";
  } else if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    code = "INVALID_TOKEN";
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    code = "TOKEN_EXPIRED";
  } else if (error.name === "MulterError") {
    statusCode = 400;
    message = "File upload error";
    code = "FILE_UPLOAD_ERROR";
  }
  const logData = {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code,
      statusCode
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (statusCode >= 500) {
    logger_default.error("Server error occurred", logData);
  } else if (statusCode >= 400) {
    logger_default.warn("Client error occurred", logData);
  } else {
    logger_default.info("Error occurred", logData);
  }
  const response = {
    success: false,
    error: message,
    code,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    path: req.url,
    method: req.method
  };
  if (environment.isDevelopment() || error instanceof AppError && error.isOperational) {
    response.details = details;
    if (environment.isDevelopment()) {
      response.stack = error.stack;
    }
  }
  if (error instanceof RateLimitError) {
    response.retryAfter = 900;
  }
  res.status(statusCode).json(response);
};
var notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.method} ${req.url} not found`);
  next(error);
};
var gracefulShutdownHandler = (req, res, next) => {
  if (process.env.GRACEFUL_SHUTDOWN === "true") {
    const error = new AppError(
      "Server is shutting down",
      503,
      true,
      "SERVICE_UNAVAILABLE"
    );
    next(error);
  } else {
    next();
  }
};
process.on("uncaughtException", (error) => {
  logger_default.error("Uncaught Exception", {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
  logger_default.error("Unhandled Rejection", {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: promise.toString()
  });
  process.exit(1);
});
process.on("SIGTERM", () => {
  logger_default.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  logger_default.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// server/middleware/performance.ts
var PerformanceMonitor = class {
  static {
    this.metrics = [];
  }
  static {
    this.MAX_METRICS_HISTORY = 1e3;
  }
  static {
    this.SLOW_REQUEST_THRESHOLD = 1e3;
  }
  static {
    // 1 second
    this.MEMORY_WARNING_THRESHOLD = 100 * 1024 * 1024;
  }
  // 100MB
  /**
   * Middleware لمراقبة الأداء
   */
  static monitorPerformance() {
    return (req, res, next) => {
      const startTime = process.hrtime.bigint();
      const startMemory = process.memoryUsage();
      logger_default.debug("Request started", {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get("User-Agent")
      });
      res.on("finish", () => {
        const endTime = process.hrtime.bigint();
        const endMemory = process.memoryUsage();
        const duration = Number(endTime - startTime) / 1e6;
        const metric = {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
          memoryUsage: endMemory,
          timestamp: /* @__PURE__ */ new Date(),
          userAgent: req.get("User-Agent"),
          ip: req.ip
        };
        this.recordMetric(metric);
        this.checkPerformanceThresholds(metric);
      });
      next();
    };
  }
  /**
   * تسجيل مقاييس الأداء
   */
  static recordMetric(metric) {
    this.metrics.push(metric);
    if (this.metrics.length > this.MAX_METRICS_HISTORY) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS_HISTORY);
    }
    if (metric.duration > this.SLOW_REQUEST_THRESHOLD) {
      logger_default.warn("Slow request detected", {
        method: metric.method,
        url: metric.url,
        duration: `${metric.duration.toFixed(2)}ms`,
        statusCode: metric.statusCode,
        memoryUsage: this.formatMemoryUsage(metric.memoryUsage)
      });
    }
    if (environment.isDevelopment()) {
      logger_default.debug("Request completed", {
        method: metric.method,
        url: metric.url,
        duration: `${metric.duration.toFixed(2)}ms`,
        statusCode: metric.statusCode,
        memoryUsed: this.formatMemoryUsage(metric.memoryUsage)
      });
    }
  }
  /**
   * فحص عتبات الأداء
   */
  static checkPerformanceThresholds(metric) {
    if (metric.memoryUsage.heapUsed > this.MEMORY_WARNING_THRESHOLD) {
      logger_default.warn("High memory usage detected", {
        method: metric.method,
        url: metric.url,
        memoryUsage: this.formatMemoryUsage(metric.memoryUsage)
      });
    }
    if (metric.duration > this.SLOW_REQUEST_THRESHOLD) {
      logger_default.warn("Slow request threshold exceeded", {
        method: metric.method,
        url: metric.url,
        duration: `${metric.duration.toFixed(2)}ms`,
        threshold: `${this.SLOW_REQUEST_THRESHOLD}ms`
      });
    }
  }
  /**
   * تنسيق استخدام الذاكرة
   */
  static formatMemoryUsage(memory) {
    const formatBytes = (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };
    return `Heap: ${formatBytes(memory.heapUsed)}/${formatBytes(memory.heapTotal)}, RSS: ${formatBytes(memory.rss)}`;
  }
  /**
   * الحصول على إحصائيات الأداء
   */
  static getStats() {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        slowestRequest: null,
        fastestRequest: null,
        errorRate: 0,
        memoryPeak: 0,
        requestsPerMinute: 0
      };
    }
    const totalRequests = this.metrics.length;
    const averageResponseTime = this.metrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests;
    const slowestRequest = this.metrics.reduce(
      (slowest, current) => current.duration > slowest.duration ? current : slowest
    );
    const fastestRequest = this.metrics.reduce(
      (fastest, current) => current.duration < fastest.duration ? current : fastest
    );
    const errorCount = this.metrics.filter((m) => m.statusCode >= 400).length;
    const errorRate = errorCount / totalRequests * 100;
    const memoryPeak = Math.max(...this.metrics.map((m) => m.memoryUsage.heapUsed));
    const oneMinuteAgo = new Date(Date.now() - 6e4);
    const recentRequests = this.metrics.filter((m) => m.timestamp > oneMinuteAgo).length;
    const requestsPerMinute = recentRequests;
    return {
      totalRequests,
      averageResponseTime,
      slowestRequest,
      fastestRequest,
      errorRate,
      memoryPeak,
      requestsPerMinute
    };
  }
  /**
   * تحليل الطلبات البطيئة
   */
  static getSlowRequests(threshold = this.SLOW_REQUEST_THRESHOLD) {
    return this.metrics.filter((m) => m.duration > threshold).sort((a, b) => b.duration - a.duration);
  }
  /**
   * تحليل الطلبات الأكثر تكراراً
   */
  static getFrequentRequests() {
    const urlMap = /* @__PURE__ */ new Map();
    this.metrics.forEach((metric) => {
      const existing = urlMap.get(metric.url);
      if (existing) {
        existing.count++;
        existing.totalDuration += metric.duration;
      } else {
        urlMap.set(metric.url, {
          count: 1,
          totalDuration: metric.duration
        });
      }
    });
    return Array.from(urlMap.entries()).map(([url, data]) => ({
      url,
      count: data.count,
      avgDuration: data.totalDuration / data.count
    })).sort((a, b) => b.count - a.count);
  }
  /**
   * تحليل استخدام الذاكرة
   */
  static getMemoryAnalysis() {
    const current = process.memoryUsage();
    const peak = Math.max(...this.metrics.map((m) => m.memoryUsage.heapUsed));
    const average = this.metrics.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0) / this.metrics.length;
    const recent = this.metrics.slice(-10);
    const older = this.metrics.slice(-20, -10);
    let trend = "stable";
    if (recent.length > 0 && older.length > 0) {
      const recentAvg = recent.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0) / recent.length;
      const olderAvg = older.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0) / older.length;
      const diff = (recentAvg - olderAvg) / olderAvg;
      if (diff > 0.1) trend = "increasing";
      else if (diff < -0.1) trend = "decreasing";
    }
    return {
      current,
      peak,
      average,
      trend
    };
  }
  /**
   * إعادة تعيين المقاييس
   */
  static resetMetrics() {
    this.metrics = [];
    logger_default.info("Performance metrics reset");
  }
  /**
   * توليد تقرير الأداء
   */
  static generatePerformanceReport() {
    const stats = this.getStats();
    const slowRequests = this.getSlowRequests();
    const frequentRequests = this.getFrequentRequests();
    const memoryAnalysis = this.getMemoryAnalysis();
    let report = "=== Performance Report ===\n\n";
    report += `Total Requests: ${stats.totalRequests}
`;
    report += `Average Response Time: ${stats.averageResponseTime.toFixed(2)}ms
`;
    report += `Error Rate: ${stats.errorRate.toFixed(2)}%
`;
    report += `Requests Per Minute: ${stats.requestsPerMinute}
`;
    report += `Memory Peak: ${this.formatMemoryUsage({ heapUsed: stats.memoryPeak })}
`;
    report += `Memory Trend: ${memoryAnalysis.trend}

`;
    if (slowRequests.length > 0) {
      report += "=== Slow Requests ===\n";
      slowRequests.slice(0, 5).forEach((request, index) => {
        report += `${index + 1}. ${request.method} ${request.url}
`;
        report += `   Duration: ${request.duration.toFixed(2)}ms, Status: ${request.statusCode}

`;
      });
    }
    if (frequentRequests.length > 0) {
      report += "=== Most Frequent Requests ===\n";
      frequentRequests.slice(0, 5).forEach((request, index) => {
        report += `${index + 1}. ${request.url}
`;
        report += `   Count: ${request.count}, Avg Duration: ${request.avgDuration.toFixed(2)}ms

`;
      });
    }
    return report;
  }
  /**
   * Middleware لتحسين الأداء
   */
  static optimizePerformance() {
    return (req, res, next) => {
      res.set("X-Content-Type-Options", "nosniff");
      res.set("X-Frame-Options", "DENY");
      res.set("X-XSS-Protection", "1; mode=block");
      if (req.method === "GET" && this.isCacheable(req.url)) {
        res.set("Cache-Control", "public, max-age=3600");
        res.set("ETag", this.generateETag(req.url));
      }
      if (this.shouldCompress(req)) {
        res.set("Vary", "Accept-Encoding");
      }
      next();
    };
  }
  /**
   * التحقق من إمكانية التخزين المؤقت
   */
  static isCacheable(url) {
    const cacheablePaths = ["/health", "/api/stations-status"];
    return cacheablePaths.some((path7) => url.startsWith(path7));
  }
  /**
   * التحقق من الحاجة للضغط
   */
  static shouldCompress(req) {
    const acceptEncoding = req.get("Accept-Encoding") || "";
    return acceptEncoding.includes("gzip") || acceptEncoding.includes("deflate");
  }
  /**
   * توليد ETag
   */
  static generateETag(url) {
    const timestamp2 = Date.now().toString(36);
    const urlHash = Buffer.from(url).toString("base64").slice(0, 8);
    return `"${timestamp2}-${urlHash}"`;
  }
};

// server/middleware/asset-optimization.ts
var AssetOptimizer = class {
  static {
    this.DEFAULT_OPTIONS = {
      maxImageSize: 5 * 1024 * 1024,
      // 5MB
      allowedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
      enableWebP: true,
      enableCompression: true,
      cacheControl: "public, max-age=31536000"
      // 1 year
    };
  }
  /**
   * Middleware لتحسين الأصول
   */
  static optimizeAssets(options = {}) {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    return (req, res, next) => {
      if (this.isStaticAsset(req.path)) {
        this.applyCacheHeaders(res, config);
        this.applyCompressionHeaders(res, config);
      }
      if (this.isImageRequest(req)) {
        this.optimizeImageResponse(req, res, config);
      }
      next();
    };
  }
  /**
   * التحقق من أن الطلب لأصل ثابت
   */
  static isStaticAsset(path7) {
    const staticExtensions = [".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf"];
    return staticExtensions.some((ext) => path7.endsWith(ext));
  }
  /**
   * التحقق من أن الطلب لصورة
   */
  static isImageRequest(req) {
    const acceptHeader = req.get("Accept") || "";
    return acceptHeader.includes("image/") || /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(req.path);
  }
  /**
   * تطبيق cache headers
   */
  static applyCacheHeaders(res, config) {
    if (config.cacheControl) {
      res.set("Cache-Control", config.cacheControl);
    }
    const etag = this.generateETag(res.get("Content-Length") || "0");
    res.set("ETag", etag);
    res.set("Last-Modified", (/* @__PURE__ */ new Date()).toUTCString());
  }
  /**
   * تطبيق compression headers
   */
  static applyCompressionHeaders(res, config) {
    if (config.enableCompression) {
      res.set("Vary", "Accept-Encoding");
    }
  }
  /**
   * تحسين استجابة الصور
   */
  static optimizeImageResponse(req, res, config) {
    const acceptHeader = req.get("Accept") || "";
    if (config.enableWebP && acceptHeader.includes("image/webp")) {
      res.set("Content-Type", "image/webp");
    }
    res.set("X-Content-Type-Options", "nosniff");
    res.set("X-Frame-Options", "DENY");
  }
  /**
   * توليد ETag
   */
  static generateETag(contentLength) {
    const timestamp2 = Date.now().toString(36);
    const length = parseInt(contentLength).toString(36);
    return `"${timestamp2}-${length}"`;
  }
  /**
   * تحسين حجم الصور (مثال باستخدام sharp)
   */
  static async optimizeImage(inputBuffer, options = {}) {
    try {
      const sharp = __require("sharp");
      let pipeline = sharp(inputBuffer);
      if (options.width || options.height) {
        pipeline = pipeline.resize(options.width, options.height, {
          fit: "inside",
          withoutEnlargement: true
        });
      }
      if (options.format === "webp") {
        pipeline = pipeline.webp({ quality: options.quality || 80 });
      } else if (options.format === "jpeg") {
        pipeline = pipeline.jpeg({ quality: options.quality || 80 });
      } else if (options.format === "png") {
        pipeline = pipeline.png({ quality: options.quality || 80 });
      }
      return await pipeline.toBuffer();
    } catch (error) {
      logger_default.error("Image optimization failed", { error });
      return inputBuffer;
    }
  }
  /**
   * تحسين CSS
   */
  static async optimizeCSS(css) {
    try {
      let optimized = css.replace(/\s+/g, " ").replace(/;\s*}/g, "}").replace(/{\s*/g, "{").replace(/;\s*/g, ";").trim();
      optimized = optimized.replace(/\/\*[\s\S]*?\*\//g, "");
      optimized = optimized.replace(/\s*{\s*/g, "{").replace(/\s*}\s*/g, "}").replace(/\s*;\s*/g, ";").replace(/\s*,\s*/g, ",");
      return optimized;
    } catch (error) {
      logger_default.error("CSS optimization failed", { error });
      return css;
    }
  }
  /**
   * تحسين JavaScript
   */
  static async optimizeJavaScript(js) {
    try {
      if (environment.isProduction()) {
        js = js.replace(/console\.(log|debug|info)\([^)]*\);?/g, "");
      }
      js = js.replace(/\s+/g, " ").replace(/\s*{\s*/g, "{").replace(/\s*}\s*/g, "}").replace(/\s*;\s*/g, ";").replace(/\s*,\s*/g, ",").trim();
      return js;
    } catch (error) {
      logger_default.error("JavaScript optimization failed", { error });
      return js;
    }
  }
  /**
   * تحسين HTML
   */
  static async optimizeHTML(html) {
    try {
      let optimized = html.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
      optimized = optimized.replace(/<!--[\s\S]*?-->/g, "");
      optimized = optimized.replace(/\s+$/gm, "");
      return optimized;
    } catch (error) {
      logger_default.error("HTML optimization failed", { error });
      return html;
    }
  }
  /**
   * تحسين JSON
   */
  static async optimizeJSON(json) {
    try {
      return JSON.stringify(json, null, environment.isDevelopment() ? 2 : 0);
    } catch (error) {
      logger_default.error("JSON optimization failed", { error });
      return JSON.stringify(json);
    }
  }
  /**
   * تحسين الأصول المتعددة
   */
  static async optimizeAssets(assets) {
    const optimized = {};
    try {
      if (assets.css) {
        optimized.css = await this.optimizeCSS(assets.css);
      }
      if (assets.js) {
        optimized.js = await this.optimizeJavaScript(assets.js);
      }
      if (assets.html) {
        optimized.html = await this.optimizeHTML(assets.html);
      }
      if (assets.images && assets.images.length > 0) {
        optimized.images = await Promise.all(
          assets.images.map((img) => this.optimizeImage(img))
        );
      }
      return optimized;
    } catch (error) {
      logger_default.error("Assets optimization failed", { error });
      return assets;
    }
  }
  /**
   * تحليل حجم الأصول
   */
  static analyzeAssetSize(content) {
    const size = Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content, "utf8");
    const formatSize = (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };
    return {
      size,
      sizeFormatted: formatSize(size)
    };
  }
};

// server/index.ts
try {
  environment.validateRuntimeConfig();
} catch (error) {
  logger_default.error("Environment validation failed", { error });
  process.exit(1);
}
var app = express2();
applySecurityMiddleware(app);
app.use(PerformanceMonitor.monitorPerformance());
app.use(PerformanceMonitor.optimizePerformance());
app.use(AssetOptimizer.optimizeAssets());
if (environment.getPerformanceConfig().enableCompression) {
  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));
}
app.use(gracefulShutdownHandler);
var maxRequestSize = environment.isProduction() ? "5mb" : "10mb";
app.use(express2.json({
  limit: maxRequestSize,
  strict: true
}));
app.use(express2.urlencoded({
  extended: true,
  limit: maxRequestSize
}));
app.use((req, res, next) => {
  const start = Date.now();
  const path7 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path7.startsWith("/api")) {
      let logLine = `${req.method} ${path7} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = `${logLine.slice(0, 79)}\u2026`;
      }
      logger_default.info(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use(notFoundHandler);
  app.use(errorHandler);
  if (environment.isDevelopment()) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const config = environment.getConfig();
  const port = config.PORT;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    logger_default.info("Server started successfully", {
      port,
      environment: config.NODE_ENV,
      apiBaseUrl: config.API_BASE_URL,
      cacheEnabled: config.ENABLE_CACHE,
      compressionEnabled: environment.getPerformanceConfig().enableCompression
    });
  });
  const gracefulShutdown = (signal) => {
    logger_default.info(`${signal} received, shutting down gracefully`);
    server.close(() => {
      logger_default.info("Server closed successfully");
      process.exit(0);
    });
    setTimeout(() => {
      logger_default.error("Forced shutdown after timeout");
      process.exit(1);
    }, 3e4);
  };
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
})();
