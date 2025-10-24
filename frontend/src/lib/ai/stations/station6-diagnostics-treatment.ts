import { BaseStation, type StationConfig } from '../core/pipeline/base-station';
import { GeminiService } from './gemini-service';
import type { ConflictNetwork } from '../core/models/base-entities';
import logger from '../utils/logger';

export interface Station6Input {
  conflictNetwork: ConflictNetwork;
  station5Output: unknown;
}

export interface DiagnosticIssue {
  issueId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'character' | 'conflict' | 'relationship' | 'structure' | 'pacing';
  description: string;
  affectedElements: string[];
  suggestedFix: string;
}

export interface TreatmentRecommendation {
  recommendationId: string;
  targetIssue: string;
  priority: number;
  actionType: 'add' | 'modify' | 'remove' | 'strengthen' | 'weaken';
  specificAction: string;
  expectedImpact: string;
  implementationNotes: string;
}

export interface Station6Output {
  diagnosticsReport: {
    overallHealthScore: number;
    criticalIssues: DiagnosticIssue[];
    warnings: DiagnosticIssue[];
    suggestions: DiagnosticIssue[];
  };
  treatmentPlan: {
    prioritizedRecommendations: TreatmentRecommendation[];
    estimatedImprovementScore: number;
    implementationComplexity: 'low' | 'medium' | 'high';
  };
  metadata: {
    analysisTimestamp: Date;
    totalIssuesFound: number;
    status: 'Success' | 'Partial' | 'Failed';
  };
}

export class Station6DiagnosticsAndTreatment extends BaseStation<Station6Input, Station6Output> {
  constructor(config: StationConfig<Station6Input, Station6Output>, geminiService: GeminiService) {
    super(config, geminiService);
  }

  protected async process(input: Station6Input): Promise<Station6Output> {
    try {
      logger.info('Starting Station 6: Diagnostics & Treatment Analysis');

      const diagnosticsReport = await this.runDiagnostics(input.conflictNetwork);
      const treatmentPlan = await this.generateTreatmentPlan(diagnosticsReport);

      return {
        diagnosticsReport,
        treatmentPlan,
        metadata: {
          analysisTimestamp: new Date(),
          totalIssuesFound:
            diagnosticsReport.criticalIssues.length +
            diagnosticsReport.warnings.length +
            diagnosticsReport.suggestions.length,
          status: 'Success'
        }
      };
    } catch (error) {
      logger.error(
        `Error in Station 6: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  private async runDiagnostics(
    network: ConflictNetwork
  ): Promise<Station6Output['diagnosticsReport']> {
    const issues: DiagnosticIssue[] = [];

    issues.push(...this.diagnoseCharacterIssues(network));
    issues.push(...this.diagnoseConflictIssues(network));
    issues.push(...this.diagnoseRelationshipIssues(network));

    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    const warnings = issues.filter(issue => issue.severity === 'high' || issue.severity === 'medium');
    const suggestions = issues.filter(issue => issue.severity === 'low');

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

  private diagnoseCharacterIssues(network: ConflictNetwork): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = [];

    network.characters.forEach((character, charId) => {
      const hasRelationships = Array.from(network.relationships.values()).some(
        relationship => relationship.source === charId || relationship.target === charId
      );

      if (!hasRelationships) {
        issues.push({
          issueId: `char-isolated-${charId}`,
          severity: 'medium',
          category: 'character',
          description: `Character "${character.name}" has no relationships`,
          affectedElements: [charId],
          suggestedFix:
            'Consider adding at least one meaningful relationship for this character'
        });
      }

      const hasConflicts = Array.from(network.conflicts.values()).some(conflict =>
        conflict.involvedCharacters.includes(charId)
      );

      if (!hasConflicts && network.conflicts.size > 0) {
        issues.push({
          issueId: `char-no-conflict-${charId}`,
          severity: 'low',
          category: 'character',
          description: `Character "${character.name}" is not involved in any conflicts`,
          affectedElements: [charId],
          suggestedFix:
            'Consider involving this character in at least one conflict or subplot'
        });
      }
    });

    return issues;
  }

  private diagnoseConflictIssues(network: ConflictNetwork): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = [];

    if (network.conflicts.size === 0) {
      issues.push({
        issueId: 'no-conflicts',
        severity: 'critical',
        category: 'conflict',
        description: 'No conflicts detected in the story',
        affectedElements: [],
        suggestedFix: 'Add at least one central conflict to drive the narrative'
      });
    } else if (network.conflicts.size < 2) {
      issues.push({
        issueId: 'few-conflicts',
        severity: 'medium',
        category: 'conflict',
        description: 'Story has very few conflicts',
        affectedElements: [],
        suggestedFix: 'Consider adding subplots or secondary conflicts for depth'
      });
    }

    const strengths = Array.from(network.conflicts.values()).map(conflict => conflict.strength);
    const averageStrength =
      strengths.length > 0
        ? strengths.reduce((sum, value) => sum + value, 0) / strengths.length
        : 0;

    if (averageStrength < 3) {
      issues.push({
        issueId: 'low-conflict-strength',
        severity: 'medium',
        category: 'conflict',
        description: 'Overall conflict strength is low',
        affectedElements: Array.from(network.conflicts.keys()),
        suggestedFix: 'Consider raising the stakes or intensifying existing conflicts'
      });
    }

    return issues;
  }

  private diagnoseRelationshipIssues(network: ConflictNetwork): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = [];

    const relationshipTypes = new Set(
      Array.from(network.relationships.values()).map(relationship => relationship.type)
    );

    if (relationshipTypes.size < 3 && network.relationships.size > 5) {
      issues.push({
        issueId: 'low-relationship-diversity',
        severity: 'low',
        category: 'relationship',
        description: 'Limited variety in relationship types',
        affectedElements: [],
        suggestedFix:
          'Consider adding different types of relationships (friendship, rivalry, mentorship, etc.)'
      });
    }

    return issues;
  }

  private calculateHealthScore(critical: number, warnings: number, suggestions: number): number {
    let score = 100;

    score -= critical * 20;
    score -= warnings * 5;
    score -= suggestions * 2;

    return Math.max(0, Math.min(100, score));
  }

  private async generateTreatmentPlan(
    diagnostics: Station6Output['diagnosticsReport']
  ): Promise<Station6Output['treatmentPlan']> {
    const recommendations: TreatmentRecommendation[] = [];

    diagnostics.criticalIssues.forEach((issue, index) => {
      recommendations.push({
        recommendationId: `rec-critical-${index}`,
        targetIssue: issue.issueId,
        priority: 1,
        actionType: 'add',
        specificAction: issue.suggestedFix,
        expectedImpact: 'High impact on story coherence',
        implementationNotes: 'Address this immediately'
      });
    });

    diagnostics.warnings.forEach((issue, index) => {
      recommendations.push({
        recommendationId: `rec-warning-${index}`,
        targetIssue: issue.issueId,
        priority: 2,
        actionType: 'modify',
        specificAction: issue.suggestedFix,
        expectedImpact: 'Moderate impact on story quality',
        implementationNotes: 'Address after critical issues'
      });
    });

    diagnostics.suggestions.forEach((issue, index) => {
      recommendations.push({
        recommendationId: `rec-suggestion-${index}`,
        targetIssue: issue.issueId,
        priority: 3,
        actionType: 'strengthen',
        specificAction: issue.suggestedFix,
        expectedImpact: 'Incremental improvement to story depth',
        implementationNotes: 'Schedule when higher priority work is complete'
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

  private estimateImprovement(diagnostics: Station6Output['diagnosticsReport']): number {
    let improvement = 0;
    improvement += diagnostics.criticalIssues.length * 17;
    improvement += diagnostics.warnings.length * 4;
    improvement += diagnostics.suggestions.length * 1.5;
    return improvement;
  }

  private determineComplexity(
    recommendations: TreatmentRecommendation[]
  ): 'low' | 'medium' | 'high' {
    if (recommendations.length === 0) {
      return 'low';
    }

    if (recommendations.length <= 3) {
      return 'low';
    }

    if (recommendations.length <= 7) {
      return 'medium';
    }

    return 'high';
  }

  protected extractRequiredData(input: Station6Input): Record<string, unknown> {
    return {
      networkSize: input.conflictNetwork.characters.size,
      conflictsCount: input.conflictNetwork.conflicts.size
    };
  }

  protected getErrorFallback(): Station6Output {
    return {
      diagnosticsReport: {
        overallHealthScore: 0,
        criticalIssues: [
          {
            issueId: 'error-occurred',
            severity: 'critical',
            category: 'structure',
            description: 'Analysis failed due to an error',
            affectedElements: [],
            suggestedFix: 'Please retry the analysis'
          }
        ],
        warnings: [],
        suggestions: []
      },
      treatmentPlan: {
        prioritizedRecommendations: [],
        estimatedImprovementScore: 0,
        implementationComplexity: 'high'
      },
      metadata: {
        analysisTimestamp: new Date(),
        totalIssuesFound: 1,
        status: 'Failed'
      }
    };
  }
}
