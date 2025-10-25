import { BaseStation, type StationConfig } from "../core/pipeline/base-station";
import { GeminiService, GeminiModel } from "./gemini-service";
import {
  Character,
  Relationship,
  Conflict,
  ConflictNetwork,
  ConflictNetworkImpl,
  RelationshipType,
  RelationshipNature,
  RelationshipDirection,
  ConflictSubject,
  ConflictScope,
  ConflictPhase,
} from "../core/models/base-entities";
import { Station1Output } from "./station1-text-analysis";
import { Station2Output } from "./station2-conceptual-analysis";
import logger from "../utils/logger";
import { Station3Context } from "../../types/contexts";
import { toText, safeSub } from '@/lib/ai/gemini-core';

export interface Station3Input {
  station1Output: Station1Output;
  station2Output: Station2Output;
  fullText: string;
}

export interface Station3Output {
  conflictNetwork: ConflictNetwork;
  networkSummary: {
    charactersCount: number;
    relationshipsCount: number;
    conflictsCount: number;
    snapshotsCount: number;
  };
  metadata: {
    analysisTimestamp: Date;
    status: "Success" | "Partial" | "Failed";
    buildTime: number;
  };
}

class RelationshipInferenceEngine {
  constructor(private geminiService: GeminiService) {}

  async inferRelationships(
    characters: Character[],
    context: Station3Context,
    station2Summary: Station2Output
  ): Promise<Relationship[]> {
    const charactersList = characters
      .map((c) => `'${c.name}' (ID: ${c.id})`)
      .join(", ");

    const promptContext = this.buildContextSummary(context, station2Summary);

    const prompt = `
استنادًا إلى السياق المقدم، قم باستنتاج العلاقات الرئيسية بين الشخصيات.

الشخصيات المتاحة: ${charactersList}

اكتب تحليلاً مفصلاً للعلاقات الرئيسية بين الشخصيات.
    `;

    const result = await this.geminiService.generate<string>({
      prompt,
      context: safeSub(context.fullText, 0, 25000),
      model: GeminiModel.FLASH,
      temperature: 0.7,
    });

    // إرجاع علاقة افتراضية بسيطة
    if (characters.length >= 2) {
      return [{
        id: `rel_default_${Date.now()}`,
        source: characters[0].id,
        target: characters[1].id,
        type: RelationshipType.OTHER,
        nature: RelationshipNature.NEUTRAL,
        direction: RelationshipDirection.BIDIRECTIONAL,
        strength: 5,
        description: toText(result.content) || "علاقة رئيسية",
        triggers: [],
        metadata: {
          source: "AI_Text_Analysis",
          inferenceTimestamp: new Date().toISOString(),
        },
      }];
    }
    return [];
  }

  private convertToRelationships(
    inferredData: any[],
    characters: Character[]
  ): Relationship[] {
    const relationships: Relationship[] = [];
    const charNameToId = new Map(characters.map((c) => [c.name, c.id]));

    for (const data of inferredData) {
      const sourceId =
        charNameToId.get(data.character1_name_or_id) ||
        data.character1_name_or_id;
      const targetId =
        charNameToId.get(data.character2_name_or_id) ||
        data.character2_name_or_id;

      if (!sourceId || !targetId || sourceId === targetId) {
        continue;
      }

      try {
        const relationship: Relationship = {
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
            inferenceTimestamp: new Date().toISOString(),
          },
        };

        relationships.push(relationship);
      } catch (error) {
        logger.error("Error parsing relationship", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return relationships;
  }

  private parseRelationshipType(typeStr: string): RelationshipType {
    const normalized = typeStr?.toUpperCase().replace(/[- ]/g, "_");
    return (
      RelationshipType[normalized as keyof typeof RelationshipType] ||
      RelationshipType.OTHER
    );
  }

  private parseRelationshipNature(natureStr: string): RelationshipNature {
    const normalized = natureStr?.toUpperCase().replace(/[- ]/g, "_");
    return (
      RelationshipNature[normalized as keyof typeof RelationshipNature] ||
      RelationshipNature.NEUTRAL
    );
  }

  private parseRelationshipDirection(dirStr: string): RelationshipDirection {
    const normalized = dirStr?.toUpperCase().replace(/[- ]/g, "_");
    return (
      RelationshipDirection[normalized as keyof typeof RelationshipDirection] ||
      RelationshipDirection.BIDIRECTIONAL
    );
  }

  private buildContextSummary(
    context: Station3Context,
    station2Summary: Station2Output
  ): Record<string, unknown> {
    const characterProfiles = Array.from(
      context.characterProfiles?.entries() ?? []
    ).map(([name, profile]: [string, any]) => ({
      name,
      personalityTraits: profile?.personalityTraits ?? "",
      motivationsGoals: profile?.motivationsGoals ?? "",
      narrativeFunction: profile?.narrativeFunction ?? "",
      keyRelationshipsBrief: profile?.keyRelationshipsBrief ?? "",
    }));

    const relationshipHints = (context.relationshipData || [])
      .filter(
        (item: any) => item && typeof item === "object" && "characters" in item
      )
      .map((item: any) => {
        const data = item as {
          characters?: [string, string];
          dynamic?: string;
          narrativeImportance?: string;
        };
        return {
          characters: data.characters ?? [],
          dynamic: data.dynamic ?? "",
          narrativeImportance: data.narrativeImportance ?? "",
        };
      });

    return {
      majorCharacters: context.majorCharacters,
      characterProfiles,
      relationshipHints,
      conceptualHighlights: {
        storyStatement: station2Summary.storyStatement,
        hybridGenre: station2Summary.hybridGenre,
        elevatorPitch: station2Summary.elevatorPitch,
      },
    };
  }
}

class ConflictInferenceEngine {
  constructor(private geminiService: GeminiService) {}

  async inferConflicts(
    characters: Character[],
    relationships: Relationship[],
    context: Station3Context,
    station2Summary: Station2Output
  ): Promise<Conflict[]> {
    const charactersSummary = characters.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
    }));

    const relationshipsSummary = relationships.slice(0, 5).map((r) => {
      const source = characters.find((c) => c.id === r.source);
      const target = characters.find((c) => c.id === r.target);
      return {
        characters: [source?.name, target?.name],
        type: r.type,
        nature: r.nature,
      };
    });

    const conceptualSummary = this.buildConflictContext(
      context,
      station2Summary
    );

    const prompt = `
استنادًا إلى السياق، قم باستنتاج الصراعات الرئيسية (3-5 صراعات).

اكتب تحليلاً مفصلاً للصراعات الرئيسية في النص.
    `;

    const result = await this.geminiService.generate<string>({
      prompt,
      context: safeSub(context.fullText, 0, 25000),
      model: GeminiModel.FLASH,
      temperature: 0.7,
    });

    // إرجاع صراع افتراضي بسيط
    if (characters.length >= 1) {
      return [{
        id: `conflict_default_${Date.now()}`,
        name: "صراع رئيسي",
        description: toText(result.content) || "صراع رئيسي في القصة",
        involvedCharacters: [characters[0].id],
        subject: ConflictSubject.OTHER,
        scope: ConflictScope.PERSONAL,
        phase: ConflictPhase.EMERGING,
        strength: 5,
        relatedRelationships: [],
        pivotPoints: [],
        timestamps: [new Date()],
        metadata: {
          source: "AI_Text_Analysis",
          inferenceTimestamp: new Date().toISOString(),
        },
      }];
    }
    return [];
  }

  private convertToConflicts(
    inferredData: any[],
    characters: Character[]
  ): Conflict[] {
    const conflicts: Conflict[] = [];
    const charNameToId = new Map(characters.map((c) => [c.name, c.id]));

    for (const data of inferredData) {
      const involvedIds = (data.involved_character_names_or_ids || [])
        .map((ref: string) => charNameToId.get(ref) || ref)
        .filter((id: string) => id);

      if (involvedIds.length === 0) {
        continue;
      }

      try {
        const conflict: Conflict = {
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
          timestamps: [new Date()],
          metadata: {
            source: "AI_Inference_Engine",
            inferenceTimestamp: new Date().toISOString(),
          },
        };

        conflicts.push(conflict);
      } catch (error) {
        logger.error("Error parsing conflict", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return conflicts;
  }

  private parseConflictSubject(subjectStr: string): ConflictSubject {
    const normalized = subjectStr?.toUpperCase().replace(/[- ]/g, "_");
    return (
      ConflictSubject[normalized as keyof typeof ConflictSubject] ||
      ConflictSubject.OTHER
    );
  }

  private parseConflictScope(scopeStr: string): ConflictScope {
    const normalized = scopeStr?.toUpperCase().replace(/[- ]/g, "_");
    return (
      ConflictScope[normalized as keyof typeof ConflictScope] ||
      ConflictScope.PERSONAL
    );
  }

  private parseConflictPhase(phaseStr: string): ConflictPhase {
    const normalized = phaseStr?.toUpperCase().replace(/[- ]/g, "_");
    return (
      ConflictPhase[normalized as keyof typeof ConflictPhase] ||
      ConflictPhase.EMERGING
    );
  }

  private buildConflictContext(
    context: Station3Context,
    station2Summary: Station2Output
  ): Record<string, unknown> {
    const relationshipHints = (context.relationshipData || [])
      .filter(
        (item: any) => item && typeof item === "object" && "characters" in item
      )
      .map((item: any) => {
        const data = item as {
          characters?: [string, string];
          dynamic?: string;
          narrativeImportance?: string;
        };
        return {
          characters: data.characters ?? [],
          dynamic: data.dynamic ?? "",
          narrativeImportance: data.narrativeImportance ?? "",
        };
      });

    return {
      majorCharacters: context.majorCharacters,
      relationshipInsights: relationshipHints,
      storyStatement: station2Summary.storyStatement,
      hybridGenre: station2Summary.hybridGenre,
      genreContributionMatrix: station2Summary.genreContributionMatrix,
      dynamicTone: station2Summary.dynamicTone,
    };
  }
}

export class Station3NetworkBuilder extends BaseStation<
  Station3Input,
  Station3Output
> {
  private relationshipEngine: RelationshipInferenceEngine;
  private conflictEngine: ConflictInferenceEngine;

  constructor(
    config: StationConfig<Station3Input, Station3Output>,
    geminiService: GeminiService
  ) {
    super(config, geminiService);
    this.relationshipEngine = new RelationshipInferenceEngine(geminiService);
    this.conflictEngine = new ConflictInferenceEngine(geminiService);
  }

  protected async process(input: Station3Input): Promise<Station3Output> {
    const startTime = Date.now();
    const context = this.buildContext(input);

    // إنشاء الشبكة
    const network = new ConflictNetworkImpl(
      `network_${Date.now()}`,
      `${safeSub(input.station2Output.storyStatement, 0, 50)}...`
    );

    // إنشاء الشخصيات من المحطة الأولى
    const characters = this.createCharactersFromStation1(input.station1Output);
    characters.forEach((char) => network.addCharacter(char));

    // استنتاج العلاقات
    const relationships = await this.relationshipEngine.inferRelationships(
      characters,
      context,
      input.station2Output
    );
    relationships.forEach((rel) => network.addRelationship(rel));

    // استنتاج الصراعات
    const conflicts = await this.conflictEngine.inferConflicts(
      characters,
      relationships,
      context,
      input.station2Output
    );
    conflicts.forEach((conflict) => network.addConflict(conflict));

    // إنشاء لقطة أولية
    network.createSnapshot("Initial network state after AI inference");

    const buildTime = Date.now() - startTime;

    return {
      conflictNetwork: network,
      networkSummary: {
        charactersCount: network.characters.size,
        relationshipsCount: network.relationships.size,
        conflictsCount: network.conflicts.size,
        snapshotsCount: network.snapshots.length,
      },
      metadata: {
        analysisTimestamp: new Date(),
        status: "Success",
        buildTime,
      },
    };
  }

  private buildContext(input: Station3Input): Station3Context {
    const relationshipHints =
      input.station1Output.relationshipAnalysis.keyRelationships.map(
        (relationship) => ({
          characters: relationship.characters,
          dynamic: relationship.dynamic,
          narrativeImportance: relationship.narrativeImportance,
        })
      );

    return {
      majorCharacters: input.station1Output.majorCharacters,
      characterProfiles: input.station1Output.characterAnalysis,
      relationshipData: relationshipHints,
      fullText: input.fullText,
    };
  }

  private createCharactersFromStation1(s1Output: Station1Output): Character[] {
    return s1Output.majorCharacters.map((name, index) => {
      const analysis = s1Output.characterAnalysis.get(name);

      return {
        id: `char_${index + 1}`,
        name,
        description: analysis?.narrativeFunction || "شخصية رئيسية",
        profile: {
          personalityTraits: analysis?.personalityTraits || "",
          motivationsGoals: analysis?.motivationsGoals || "",
          potentialArc: analysis?.potentialArcObservation || "",
        },
        metadata: {
          source: "Station1_Analysis",
          analysisTimestamp: s1Output.metadata.analysisTimestamp.toISOString(),
        },
      };
    });
  }

  protected extractRequiredData(input: Station3Input): Record<string, unknown> {
    return {
      station1Characters: input.station1Output.majorCharacters.slice(0, 5),
      station2StoryStatement: input.station2Output.storyStatement,
      fullTextLength: input.fullText.length,
    };
  }

  protected getErrorFallback(): Station3Output {
    const emptyNetwork = new ConflictNetworkImpl(
      "error_network",
      "Error Network"
    );

    return {
      conflictNetwork: emptyNetwork,
      networkSummary: {
        charactersCount: 0,
        relationshipsCount: 0,
        conflictsCount: 0,
        snapshotsCount: 0,
      },
      metadata: {
        analysisTimestamp: new Date(),
        status: "Failed",
        buildTime: 0,
      },
    };
  }
}
