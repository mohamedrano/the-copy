import { BaseStation, type StationConfig } from "../core/pipeline/base-station";
import {
  ConflictNetwork,
  Conflict,
  ConflictPhase,
  NetworkSnapshot,
} from "../core/models/base-entities";
import { GeminiService, GeminiModel } from "./gemini-service";
import { Station4Output } from "./station4-efficiency-metrics";
import { toText, safeSub } from "../gemini-core";

const safeGet = <T>(array: T[], index: number): T | undefined => {
  if (index < 0 || index >= array.length) {
    return undefined;
  }

  return array[index];
};

// Station 5 Interfaces
export interface Station5Input {
  conflictNetwork: ConflictNetwork;
  station4Output: Station4Output;
  fullText: string;
}

export interface Station5Output {
  dynamicAnalysisResults: DynamicAnalysisResults;
  episodicIntegrationResults: EpisodicIntegrationResults;
  symbolicAnalysisResults: SymbolicAnalysisResults;
  stylisticAnalysisResults: StylisticAnalysisResults;
  metadata: {
    analysisTimestamp: Date;
    status: "Success" | "Partial" | "Failed";
    analysisTime: number;
  };
}

interface DynamicAnalysisResults {
  eventTimeline: TimelineEvent[];
  networkEvolutionAnalysis: EvolutionAnalysis;
  characterDevelopmentTracking: Map<string, CharacterEvolution>;
  conflictProgressionTracking: Map<string, ConflictProgression>;
}

interface TimelineEvent {
  timestamp: Date;
  eventType:
    | "character_introduced"
    | "relationship_formed"
    | "conflict_emerged"
    | "conflict_escalated"
    | "conflict_resolved"
    | "character_transformed"
    | "network_snapshot"
    | "other";
  description: string;
  involvedEntities: {
    characters?: string[];
    relationships?: string[];
    conflicts?: string[];
  };
  significance: number; // 1-10
  narrativePhase:
    | "setup"
    | "rising_action"
    | "climax"
    | "falling_action"
    | "resolution";
}

interface EvolutionAnalysis {
  overallGrowthRate: number;
  complexityProgression: number[];
  densityProgression: number[];
  criticalTransitionPoints: Array<{
    timestamp: Date;
    description: string;
    impactScore: number;
  }>;
  stabilityMetrics: {
    structuralStability: number;
    characterStability: number;
    conflictStability: number;
  };
}

interface CharacterEvolution {
  characterId: string;
  characterName: string;
  developmentStages: Array<{
    timestamp: Date;
    stage: string;
    traits: string[];
    relationships: string[];
    conflicts: string[];
  }>;
  arcType: "positive" | "negative" | "flat" | "complex";
  transformationScore: number;
  keyMoments: Array<{
    timestamp: Date;
    event: string;
    impact: string;
  }>;
}

interface ConflictProgression {
  conflictId: string;
  conflictName: string;
  phaseTransitions: Array<{
    timestamp: Date;
    fromPhase: ConflictPhase;
    toPhase: ConflictPhase;
    catalyst: string;
  }>;
  intensityProgression: number[];
  resolutionProbability: number;
  stagnationRisk: number;
}

interface EpisodicIntegrationResults {
  seriesStructure: SeriesStructure;
  seasonBreakdown: Map<number, SeasonDetails>;
  episodeDistribution: Map<string, EpisodeAssignment>;
  balanceReport: EpisodicBalanceReport;
}

interface SeriesStructure {
  totalSeasons: number;
  episodesPerSeason: number;
  totalEpisodes: number;
  recommendedRuntime: number; // minutes per episode
}

interface SeasonDetails {
  seasonNumber: number;
  seasonTitle: string;
  episodes: Episode[];
  majorConflicts: string[];
  seasonArc: string;
  cliffhanger?: string;
}

interface Episode {
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  assignedConflicts: string[];
  featuredCharacters: string[];
  estimatedIntensity: number;
  narrativeFunction: "setup" | "development" | "climax" | "resolution";
}

interface EpisodeAssignment {
  conflictId: string;
  episodes: number[];
  distributionQuality: number;
}

interface EpisodicBalanceReport {
  overallBalance: number;
  conflictDistributionScore: number;
  characterAppearanceBalance: number;
  intensityFlowScore: number;
  recommendations: string[];
}

interface SymbolicAnalysisResults {
  keySymbols: Array<{
    symbol: string;
    interpretation: string;
    frequency: number;
    contextualMeanings: string[];
  }>;
  recurringMotifs: Array<{
    motif: string;
    occurrences: number;
    narrativeFunction: string;
  }>;
  centralThemesHintedBySymbols: string[];
  symbolicNetworks: Array<{
    primarySymbol: string;
    relatedSymbols: string[];
    thematicConnection: string;
  }>;
  depthScore: number;
  consistencyScore: number;
}

interface StylisticAnalysisResults {
  overallToneAssessment: {
    primaryTone: string;
    secondaryTones: string[];
    toneConsistency: number;
    explanation: string;
  };
  languageComplexity: {
    level: "simple" | "moderate" | "complex" | "highly_complex";
    readabilityScore: number;
    vocabularyRichness: number;
  };
  pacingImpression: {
    overallPacing: "very_slow" | "slow" | "balanced" | "fast" | "very_fast";
    pacingVariation: number;
    sceneLengthDistribution: number[];
  };
  dialogueStyle: {
    characterization: string;
    naturalness: number;
    effectiveness: number;
    distinctiveness: number;
  };
  descriptiveRichness: {
    visualDetailLevel: number;
    sensoryEngagement: number;
    atmosphericQuality: number;
  };
  stylisticConsistencyImpression: {
    consistencyScore: number;
    deviations: Array<{
      location: string;
      type: string;
      description: string;
    }>;
  };
  textBlobSentiment?: {
    polarity: number;
    subjectivity: number;
  };
}

/**
 * Dynamic Analysis Engine
 */
class DynamicAnalysisEngine {
  constructEventTimeline(network: ConflictNetwork): TimelineEvent[] {
    const events: TimelineEvent[] = [];

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
        ),
      });
    }

    for (const conflict of Array.from(network.conflicts.values())) {
      const legacyTimestamp = (
        conflict as Conflict & {
          timestamp?: Date | Date[];
        }
      ).timestamp;

      const rawTimestamps = legacyTimestamp ?? conflict.timestamps;
      const timestamps = Array.isArray(rawTimestamps)
        ? rawTimestamps
        : rawTimestamps
          ? [rawTimestamps]
          : [];

      for (const timestamp of timestamps) {
        if (!timestamp) {
          continue;
        }

        events.push({
          timestamp,
          eventType: "conflict_emerged",
          description: `Conflict emerged: ${conflict.name}`,
          involvedEntities: {
            characters: conflict.involvedCharacters,
            conflicts: [conflict.id],
          },
          significance: conflict.strength,
          narrativePhase: this.inferNarrativePhase(
            timestamp,
            network.snapshots
          ),
        });
      }
    }

    events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return events;
  }

  private inferNarrativePhase(
    timestamp: Date,
    snapshots: NetworkSnapshot[]
  ): "setup" | "rising_action" | "climax" | "falling_action" | "resolution" {
    if (!timestamp || !snapshots || snapshots.length === 0) {
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

    const position = (timestamp.getTime() - firstTime) / totalDuration;

    if (position < 0.2) return "setup";
    if (position < 0.5) return "rising_action";
    if (position < 0.7) return "climax";
    if (position < 0.9) return "falling_action";
    return "resolution";
  }

  analyzeNetworkEvolution(
    network: ConflictNetwork,
    timeline: TimelineEvent[]
  ): EvolutionAnalysis {
    const complexityProgression: number[] = [];
    const densityProgression: number[] = [];
    const transitionPoints: Array<{
      timestamp: Date;
      description: string;
      impactScore: number;
    }> = [];

    for (const snapshot of network.snapshots) {
      if (
        !snapshot.networkState.characters ||
        !snapshot.networkState.relationships ||
        !snapshot.networkState.conflicts
      ) {
        continue;
      }

      const numChars = snapshot.networkState.characters.size;
      const numRels = snapshot.networkState.relationships.size;
      const numConflicts = snapshot.networkState.conflicts.size;

      const complexity = numChars + numRels + numConflicts;
      complexityProgression.push(complexity);

      const maxPossibleRels = (numChars * (numChars - 1)) / 2;
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
          impactScore: change,
        });
      }
    }

    const lastComplexity =
      complexityProgression[complexityProgression.length - 1];
    const firstComplexity = complexityProgression[0];
    const overallGrowthRate =
      complexityProgression.length > 1 && lastComplexity && firstComplexity
        ? (lastComplexity - firstComplexity) / complexityProgression.length
        : 0;

    const stabilityMetrics = this.calculateStabilityMetrics(
      complexityProgression,
      densityProgression
    );

    return {
      overallGrowthRate,
      complexityProgression,
      densityProgression,
      criticalTransitionPoints: transitionPoints,
      stabilityMetrics,
    };
  }

  private calculateStabilityMetrics(
    complexityProgression: number[],
    densityProgression: number[]
  ): {
    structuralStability: number;
    characterStability: number;
    conflictStability: number;
  } {
    const complexityVariance = this.calculateVariance(complexityProgression);
    const densityVariance = this.calculateVariance(densityProgression);

    const structuralStability = 1 / (1 + complexityVariance);

    return {
      structuralStability,
      characterStability: 1 / (1 + densityVariance),
      conflictStability: structuralStability,
    };
  }

  private calculateVariance(values: number[]): number {
    if (values.length <= 1) {
      return 0;
    }

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  trackCharacterDevelopment(
    network: ConflictNetwork,
    timeline: TimelineEvent[]
  ): Map<string, CharacterEvolution> {
    const evolutionMap = new Map<string, CharacterEvolution>();

    for (const [charId, character] of Array.from(
      network.characters.entries()
    )) {
      const developmentStages: CharacterEvolution["developmentStages"] = [];
      const keyMoments: CharacterEvolution["keyMoments"] = [];

      for (const snapshot of network.snapshots) {
        if (!snapshot.networkState.characters?.has(charId)) continue;

        const charState = snapshot.networkState.characters.get(charId);
        if (!charState) continue;

        const relationships: string[] = [];
        const conflicts: string[] = [];

        if (snapshot.networkState.relationships) {
          for (const [relId, rel] of Array.from(
            snapshot.networkState.relationships.entries()
          )) {
            if (rel.source === charId || rel.target === charId) {
              relationships.push(relId);
            }
          }
        }

        if (snapshot.networkState.conflicts) {
          for (const [confId, conf] of Array.from(
            snapshot.networkState.conflicts.entries()
          )) {
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
          conflicts,
        });
      }

      for (const event of timeline) {
        if (event.involvedEntities.characters?.includes(charId)) {
          keyMoments.push({
            timestamp: event.timestamp,
            event: event.description,
            impact: `Significance: ${event.significance}/10`,
          });
        }
      }

      const arcType = this.determineArcType(developmentStages);

      const transformationScore =
        this.calculateTransformationScore(developmentStages);

      evolutionMap.set(charId, {
        characterId: charId,
        characterName: character.name,
        developmentStages,
        arcType,
        transformationScore,
        keyMoments,
      });
    }

    return evolutionMap;
  }

  private determineArcType(
    stages: CharacterEvolution["developmentStages"]
  ): "positive" | "negative" | "flat" | "complex" {
    if (stages.length < 2) return "flat";

    const firstStage = safeGet(stages, 0);
    const lastStage = safeGet(stages, stages.length - 1);

    if (!firstStage || !lastStage) {
      return "flat";
    }

    const conflictChange =
      lastStage.conflicts.length - firstStage.conflicts.length;
    const relationshipChange =
      lastStage.relationships.length - firstStage.relationships.length;

    const totalChange = conflictChange + relationshipChange;

    if (totalChange > 2) return "positive";
    if (totalChange < -2) return "negative";
    if (Math.abs(totalChange) > 4) return "complex";
    return "flat";
  }

  private calculateTransformationScore(
    stages: CharacterEvolution["developmentStages"]
  ): number {
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

  trackConflictProgression(
    network: ConflictNetwork,
    timeline: TimelineEvent[]
  ): Map<string, ConflictProgression> {
    const progressionMap = new Map<string, ConflictProgression>();

    for (const [confId, conflict] of Array.from(network.conflicts.entries())) {
      const phaseTransitions: ConflictProgression["phaseTransitions"] = [];
      const intensityProgression: number[] = [];

      let previousPhase: ConflictPhase | null = null;

      for (const snapshot of network.snapshots) {
        if (!snapshot.networkState.conflicts?.has(confId)) continue;

        const confState = snapshot.networkState.conflicts.get(confId);
        if (!confState) continue;

        intensityProgression.push(confState.strength);

        if (previousPhase !== null && confState.phase !== previousPhase) {
          const catalyst =
            timeline.find(
              (event) =>
                event.timestamp.getTime() === snapshot.timestamp.getTime() &&
                event.involvedEntities.conflicts?.includes(confId)
            )?.description || "Unknown catalyst";

          phaseTransitions.push({
            timestamp: snapshot.timestamp,
            fromPhase: previousPhase,
            toPhase: confState.phase,
            catalyst,
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
        stagnationRisk,
      });
    }

    return progressionMap;
  }

  private calculateResolutionProbability(
    conflict: Conflict,
    transitions: ConflictProgression["phaseTransitions"]
  ): number {
    let probability = 0.5;

    if (conflict.phase === ConflictPhase.RESOLUTION) {
      probability = 0.95;
    } else if (conflict.phase === ConflictPhase.DEESCALATING) {
      probability = 0.75;
    } else if (conflict.phase === ConflictPhase.AFTERMATH) {
      probability = 1.0;
    } else if (conflict.phase === ConflictPhase.CLIMAX) {
      probability = 0.6;
    } else if (conflict.phase === ConflictPhase.LATENT) {
      probability = 0.2;
    }

    const transitionBonus = Math.min(0.3, transitions.length * 0.05);
    probability += transitionBonus;

    return Math.max(0, Math.min(1, probability));
  }

  private calculateStagnationRisk(
    intensityProgression: number[],
    transitions: ConflictProgression["phaseTransitions"]
  ): number {
    if (intensityProgression.length < 3) return 0.5;

    const variance = this.calculateVariance(intensityProgression);

    const transitionFactor =
      transitions.length === 0 ? 0.8 : transitions.length < 2 ? 0.5 : 0.2;

    const varianceFactor = variance < 1 ? 0.7 : variance < 3 ? 0.4 : 0.1;

    const risk = (transitionFactor + varianceFactor) / 2;

    return Math.max(0, Math.min(1, risk));
  }
}

/**
 * Episodic Integration Engine
 */
class EpisodicIntegrationEngine {
  createSeriesStructure(
    network: ConflictNetwork,
    targetEpisodesPerSeason: number = 10
  ): SeriesStructure {
    const numConflicts = network.conflicts.size;

    const estimatedEpisodes = Math.ceil(numConflicts / 2.5);

    const totalEpisodes = Math.max(targetEpisodesPerSeason, estimatedEpisodes);

    const totalSeasons = Math.ceil(totalEpisodes / targetEpisodesPerSeason);

    return {
      totalSeasons,
      episodesPerSeason: targetEpisodesPerSeason,
      totalEpisodes,
      recommendedRuntime: 45,
    };
  }

  distributeConflicts(
    network: ConflictNetwork,
    structure: SeriesStructure
  ): Map<string, EpisodeAssignment> {
    const assignments = new Map<string, EpisodeAssignment>();
    const conflicts = Array.from(network.conflicts.values());

    conflicts.sort((a, b) => b.strength - a.strength);

    let currentEpisode = 1;

    for (const conflict of conflicts) {
      const episodes: number[] = [];

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
        distributionQuality: this.evaluateDistributionQuality(episodes),
      });
    }

    return assignments;
  }

  private evaluateDistributionQuality(episodes: number[]): number {
    if (episodes.length === 0) return 0;
    if (episodes.length === 1) return 1;

    const gaps: number[] = [];
    for (let i = 1; i < episodes.length; i++) {
      const current = episodes[i];
      const previous = episodes[i - 1];
      if (current !== undefined && previous !== undefined) {
        gaps.push(current - previous);
      }
    }

    // حساب متوسط الفجوات لتقييم جودة التوقيت
    const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    const variance = this.calculateVariance(gaps);
    const gapConsistency = 1 / (1 + Math.abs(averageGap - 1));
    const varianceStability = 1 / (1 + variance);
    const quality = (gapConsistency + varianceStability) / 2;

    return Math.max(0, Math.min(1, quality));
  }

  private calculateVariance(values: number[]): number {
    if (values.length <= 1) {
      return 0;
    }

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  createSeasonBreakdown(
    network: ConflictNetwork,
    structure: SeriesStructure,
    assignments: Map<string, EpisodeAssignment>
  ): Map<number, SeasonDetails> {
    const seasonMap = new Map<number, SeasonDetails>();

    for (let s = 1; s <= structure.totalSeasons; s++) {
      const startEpisode = (s - 1) * structure.episodesPerSeason + 1;
      const endEpisode = Math.min(
        s * structure.episodesPerSeason,
        structure.totalEpisodes
      );

      const episodes: Episode[] = [];
      const seasonConflicts = new Set<string>();

      for (let e = startEpisode; e <= endEpisode; e++) {
        const episodeConflicts: string[] = [];
        const featuredCharacters = new Set<string>();

        for (const [conflictId, assignment] of Array.from(
          assignments.entries()
        )) {
          if (assignment.episodes.includes(e)) {
            episodeConflicts.push(conflictId);
            seasonConflicts.add(conflictId);

            const conflict = network.conflicts.get(conflictId);
            if (conflict) {
              conflict.involvedCharacters.forEach((charId) =>
                featuredCharacters.add(charId)
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
        estimatedIntensity = Math.min(
          10,
          estimatedIntensity / episodeConflicts.length
        );

        const relativePosition =
          (e - startEpisode) / (endEpisode - startEpisode);
        const narrativeFunction =
          relativePosition < 0.3
            ? "setup"
            : relativePosition < 0.7
              ? "development"
              : relativePosition < 0.9
                ? "climax"
                : "resolution";

        episodes.push({
          episodeNumber: e,
          seasonNumber: s,
          title: `Episode ${e}`,
          assignedConflicts: episodeConflicts,
          featuredCharacters: Array.from(featuredCharacters),
          estimatedIntensity,
          narrativeFunction,
        });
      }

      const seasonDetails: SeasonDetails = {
        seasonNumber: s,
        seasonTitle: `Season ${s}`,
        episodes,
        majorConflicts: Array.from(seasonConflicts),
        seasonArc: `Season ${s} arc description`,
      };
      if (s < structure.totalSeasons) {
        seasonDetails.cliffhanger = `Cliffhanger for Season ${s}`;
      }
      seasonMap.set(s, seasonDetails);
    }

    return seasonMap;
  }

  evaluateEpisodicBalance(
    network: ConflictNetwork,
    seasonBreakdown: Map<number, SeasonDetails>
  ): EpisodicBalanceReport {
    const allEpisodes: Episode[] = [];
    for (const season of Array.from(seasonBreakdown.values())) {
      allEpisodes.push(...season.episodes);
    }

    const conflictsPerEpisode = allEpisodes.map(
      (ep) => ep.assignedConflicts.length
    );
    const conflictDistributionScore =
      1 -
      this.calculateVariance(conflictsPerEpisode) /
        Math.max(...conflictsPerEpisode);

    const charAppearances = new Map<string, number>();
    for (const episode of allEpisodes) {
      for (const charId of episode.featuredCharacters) {
        charAppearances.set(charId, (charAppearances.get(charId) || 0) + 1);
      }
    }

    const appearanceCounts = Array.from(charAppearances.values());
    const characterAppearanceBalance =
      appearanceCounts.length > 0
        ? 1 -
          this.calculateVariance(appearanceCounts) /
            Math.max(...appearanceCounts)
        : 0;

    const intensities = allEpisodes.map((ep) => ep.estimatedIntensity);
    const intensityFlowScore = this.evaluateIntensityFlow(intensities);

    const overallBalance =
      conflictDistributionScore * 0.4 +
      characterAppearanceBalance * 0.3 +
      intensityFlowScore * 0.3;

    const recommendations = this.generateBalanceRecommendations({
      conflictDistributionScore,
      characterAppearanceBalance,
      intensityFlowScore,
      overallBalance,
    });

    return {
      overallBalance,
      conflictDistributionScore,
      characterAppearanceBalance,
      intensityFlowScore,
      recommendations,
    };
  }

  private evaluateIntensityFlow(intensities: number[]): number {
    if (intensities.length < 2) return 1;

    let score = 1.0;

    const variance = this.calculateVariance(intensities);
    if (variance < 1) {
      score -= 0.3;
    }

    const firstHalf = intensities.slice(0, Math.floor(intensities.length / 2));
    const secondHalf = intensities.slice(Math.floor(intensities.length / 2));

    const firstHalfAvg =
      firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    if (secondHalfAvg > firstHalfAvg) {
      score += 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }

  private generateBalanceRecommendations(metrics: {
    conflictDistributionScore: number;
    characterAppearanceBalance: number;
    intensityFlowScore: number;
    overallBalance: number;
  }): string[] {
    const recommendations: string[] = [];

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
}

/**
 * Station 5: Dynamic, Symbolic, and Stylistic Analysis
 */
export class Station5DynamicSymbolicStylistic extends BaseStation<
  Station5Input,
  Station5Output
> {
  private dynamicEngine: DynamicAnalysisEngine;
  private episodicEngine: EpisodicIntegrationEngine;

  constructor(
    config: StationConfig<Station5Input, Station5Output>,
    geminiService: GeminiService
  ) {
    super(config, geminiService);
    this.dynamicEngine = new DynamicAnalysisEngine();
    this.episodicEngine = new EpisodicIntegrationEngine();
  }

  protected async process(input: Station5Input): Promise<Station5Output> {
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
        analysisTimestamp: new Date(),
        status: "Success",
        analysisTime,
      },
    };
  }

  private async performDynamicAnalysis(
    network: ConflictNetwork
  ): Promise<DynamicAnalysisResults> {
    const eventTimeline = this.dynamicEngine.constructEventTimeline(network);

    const networkEvolutionAnalysis = this.dynamicEngine.analyzeNetworkEvolution(
      network,
      eventTimeline
    );

    const characterDevelopmentTracking =
      this.dynamicEngine.trackCharacterDevelopment(network, eventTimeline);

    const conflictProgressionTracking =
      this.dynamicEngine.trackConflictProgression(network, eventTimeline);

    return {
      eventTimeline,
      networkEvolutionAnalysis,
      characterDevelopmentTracking,
      conflictProgressionTracking,
    };
  }

  private async performEpisodicIntegration(
    network: ConflictNetwork
  ): Promise<EpisodicIntegrationResults> {
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
      balanceReport,
    };
  }

  private async performSymbolicAnalysis(
    fullText: string
  ): Promise<SymbolicAnalysisResults> {
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

    const result = await this.geminiService.generate<string>({
      prompt,
      context: safeSub(fullText, 0, 30000),
      model: GeminiModel.FLASH,
      temperature: 0.7,
    });

    return {
      keySymbols: [
        {
          symbol: "رمز رئيسي",
          interpretation: result.content || "تحليل رمزي",
          frequency: 1,
          contextualMeanings: [],
        },
      ],
      recurringMotifs: [],
      centralThemesHintedBySymbols: [],
      symbolicNetworks: [],
      depthScore: 5,
      consistencyScore: 5,
    };
  }

  private async performStylisticAnalysis(
    fullText: string
  ): Promise<StylisticAnalysisResults> {
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

    const result = await this.geminiService.generate<string>({
      prompt,
      context: safeSub(fullText, 0, 30000),
      model: GeminiModel.FLASH,
      temperature: 0.6,
    });

    return {
      overallToneAssessment: {
        primaryTone: result.content || "غير محدد",
        secondaryTones: [],
        toneConsistency: 5,
        explanation: "تحليل أسلوبي",
      },
      languageComplexity: {
        level: "moderate",
        readabilityScore: 5,
        vocabularyRichness: 5,
      },
      pacingImpression: {
        overallPacing: "balanced",
        pacingVariation: 5,
        sceneLengthDistribution: [],
      },
      dialogueStyle: {
        characterization: "تحليل الحوار",
        naturalness: 5,
        effectiveness: 5,
        distinctiveness: 5,
      },
      descriptiveRichness: {
        visualDetailLevel: 5,
        sensoryEngagement: 5,
        atmosphericQuality: 5,
      },
      stylisticConsistencyImpression: {
        consistencyScore: 5,
        deviations: [],
      },
    };
  }

  private getDefaultSymbolicResults(): SymbolicAnalysisResults {
    return {
      keySymbols: [],
      recurringMotifs: [],
      centralThemesHintedBySymbols: [],
      symbolicNetworks: [],
      depthScore: 0,
      consistencyScore: 0,
    };
  }

  private getDefaultStylisticResults(): StylisticAnalysisResults {
    return {
      overallToneAssessment: {
        primaryTone: "Unknown",
        secondaryTones: [],
        toneConsistency: 0,
        explanation: "Analysis failed",
      },
      languageComplexity: {
        level: "moderate",
        readabilityScore: 5,
        vocabularyRichness: 5,
      },
      pacingImpression: {
        overallPacing: "balanced",
        pacingVariation: 5,
        sceneLengthDistribution: [],
      },
      dialogueStyle: {
        characterization: "Unknown",
        naturalness: 5,
        effectiveness: 5,
        distinctiveness: 5,
      },
      descriptiveRichness: {
        visualDetailLevel: 5,
        sensoryEngagement: 5,
        atmosphericQuality: 5,
      },
      stylisticConsistencyImpression: {
        consistencyScore: 5,
        deviations: [],
      },
    };
  }

  protected extractRequiredData(input: Station5Input): Record<string, unknown> {
    return {
      charactersCount: input.conflictNetwork.characters.size,
      conflictsCount: input.conflictNetwork.conflicts.size,
      station4Score:
        input.station4Output.efficiencyMetrics.overallEfficiencyScore,
      fullTextLength: input.fullText.length,
    };
  }

  protected getErrorFallback(): Station5Output {
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
            conflictStability: 0,
          },
        },
        characterDevelopmentTracking: new Map(),
        conflictProgressionTracking: new Map(),
      },
      episodicIntegrationResults: {
        seriesStructure: {
          totalSeasons: 0,
          episodesPerSeason: 0,
          totalEpisodes: 0,
          recommendedRuntime: 0,
        },
        seasonBreakdown: new Map(),
        episodeDistribution: new Map(),
        balanceReport: {
          overallBalance: 0,
          conflictDistributionScore: 0,
          characterAppearanceBalance: 0,
          intensityFlowScore: 0,
          recommendations: ["Analysis failed"],
        },
      },
      symbolicAnalysisResults: this.getDefaultSymbolicResults(),
      stylisticAnalysisResults: this.getDefaultStylisticResults(),
      metadata: {
        analysisTimestamp: new Date(),
        status: "Failed",
        analysisTime: 0,
      },
    };
  }
}
