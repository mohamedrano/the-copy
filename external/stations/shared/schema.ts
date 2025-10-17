import { z } from 'zod';

const HTML_TAG_REGEX = /<[^>]*>/g;
// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F]+/g;

function sanitizeScalar(value: string): string {
  return value
    .replace(HTML_TAG_REGEX, '')
    .replace(CONTROL_CHAR_REGEX, '')
    .replace(/\0/g, '')
    .trim();
}

interface SanitizedOptions {
  min: number;
  minMessage: string;
  max?: number;
  maxMessage?: string;
}

const sanitizedString = ({ min, minMessage, max, maxMessage }: SanitizedOptions) =>
  z
    .string()
    .trim()
    .transform(sanitizeScalar)
    .refine((value) => value.length >= min, {
      message: minMessage,
    })
    .refine((value) => (typeof max === 'number' ? value.length <= max : true), {
      message: maxMessage ?? 'النص يتجاوز الحد المسموح به',
    });

// Station 1 Schemas
export const analyzeTextSchema = z.object({
  fullText: sanitizedString({
    min: 100,
    minMessage: 'النص يجب أن يحتوي على 100 حرف على الأقل',
    max: 500_000,
    maxMessage: 'النص يتجاوز الحد المسموح به (500 ألف حرف)',
  }),
  projectName: sanitizedString({
    min: 1,
    minMessage: 'اسم المشروع مطلوب',
    max: 256,
    maxMessage: 'اسم المشروع طويل جداً',
  }),
  proseFilePath: z.preprocess((value) => {
    if (typeof value !== 'string') {
      return undefined;
    }

    const sanitized = sanitizeScalar(value);
    return sanitized.length === 0 ? undefined : sanitized;
  }, z.string().max(1024, 'مسار الملف طويل جداً').optional()),
});

export const characterAnalysisSchema = z.object({
  personalityTraits: z.string(),
  motivationsGoals: z.string(),
  keyRelationshipsBrief: z.string(),
  narrativeFunction: z.string(),
  potentialArcObservation: z.string()
});

export const relationshipAnalysisSchema = z.object({
  keyRelationships: z.array(z.object({
    characters: z.tuple([z.string(), z.string()]),
    dynamic: z.string(),
    narrativeImportance: z.string()
  }))
});

export const narrativeStyleSchema = z.object({
  overallTone: z.string(),
  pacingAnalysis: z.string(),
  languageStyle: z.string()
});

export const station1ResponseSchema = z.object({
  majorCharacters: z.array(z.string()),
  characterAnalysis: z.record(z.string(), characterAnalysisSchema),
  relationshipAnalysis: relationshipAnalysisSchema,
  narrativeStyleAnalysis: narrativeStyleSchema,
  metadata: z.object({
    analysisTimestamp: z.string(),
    status: z.enum(['Success', 'Partial', 'Failed'])
  })
});

// Types
export type AnalyzeTextRequest = z.infer<typeof analyzeTextSchema>;
export type Station1Response = z.infer<typeof station1ResponseSchema>;
export type CharacterAnalysisResult = z.infer<typeof characterAnalysisSchema>;
export type RelationshipAnalysisResult = z.infer<typeof relationshipAnalysisSchema>;
export type NarrativeStyleResult = z.infer<typeof narrativeStyleSchema>;