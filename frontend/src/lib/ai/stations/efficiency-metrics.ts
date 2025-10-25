import { ConflictNetwork } from '../core/models/base-entities';

export interface EfficiencyMetrics {
  overallEfficiencyScore: number;
  overallRating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  conflictCohesion: number;
  dramaticBalance: {
    balanceScore: number;
    characterInvolvementGini: number;
  };
  narrativeEfficiency: {
    characterEfficiency: number;
    relationshipEfficiency: number;
    conflictEfficiency: number;
  };
  narrativeDensity: number;
  redundancyMetrics: {
    characterRedundancy: number;
    relationshipRedundancy: number;
    conflictRedundancy: number;
  };
}

export class EfficiencyAnalyzer {
  
  calculateEfficiencyMetrics(network: ConflictNetwork): EfficiencyMetrics {
    const conflictCohesion = this.calculateConflictCohesion(network);
    const dramaticBalance = this.calculateDramaticBalance(network);
    const narrativeEfficiency = this.calculateNarrativeEfficiency(network);
    const narrativeDensity = this.calculateNarrativeDensity(network);
    const redundancyMetrics = this.calculateRedundancyMetrics(network);
    
    const overallScore = this.calculateOverallScore({
      conflictCohesion,
      dramaticBalance: dramaticBalance.balanceScore,
      narrativeEfficiency: (narrativeEfficiency.characterEfficiency + 
                          narrativeEfficiency.relationshipEfficiency + 
                          narrativeEfficiency.conflictEfficiency) / 3,
      narrativeDensity,
      redundancy: 1 - ((redundancyMetrics.characterRedundancy + 
                       redundancyMetrics.relationshipRedundancy + 
                       redundancyMetrics.conflictRedundancy) / 3)
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

  private calculateConflictCohesion(network: ConflictNetwork): number {
    if (network.conflicts.size === 0) return 0;
    
    let totalConnections = 0;
    let possibleConnections = 0;
    
    const conflicts = Array.from(network.conflicts.values());
    
    for (let i = 0; i < conflicts.length; i++) {
      for (let j = i + 1; j < conflicts.length; j++) {
        possibleConnections++;
        
        const conflict1 = conflicts[i];
        const conflict2 = conflicts[j];
        
        // Check if conflicts exist and have involvedCharacters
        if (!conflict1 || !conflict2 || !conflict1.involvedCharacters || !conflict2.involvedCharacters) {
          continue;
        }
        
        // Check if conflicts share characters
        const sharedCharacters = conflict1.involvedCharacters.filter(
          char => conflict2.involvedCharacters.includes(char)
        );
        
        if (sharedCharacters.length > 0) {
          totalConnections++;
        }
      }
    }
    
    return possibleConnections > 0 ? totalConnections / possibleConnections : 0;
  }

  private calculateDramaticBalance(network: ConflictNetwork): {
    balanceScore: number;
    characterInvolvementGini: number;
  } {
    const characters = Array.from(network.characters.values());
    const involvementCounts = characters.map(char => {
      return Array.from(network.conflicts.values()).filter(
        conflict => conflict.involvedCharacters.includes(char.id)
      ).length;
    });

    const giniCoefficient = this.calculateGiniCoefficient(involvementCounts);
    const balanceScore = 1 - giniCoefficient; // Lower Gini = better balance

    return {
      balanceScore,
      characterInvolvementGini: giniCoefficient
    };
  }

  private calculateNarrativeEfficiency(network: ConflictNetwork): {
    characterEfficiency: number;
    relationshipEfficiency: number;
    conflictEfficiency: number;
  } {
    const characterEfficiency = this.calculateCharacterEfficiency(network);
    const relationshipEfficiency = this.calculateRelationshipEfficiency(network);
    const conflictEfficiency = this.calculateConflictEfficiency(network);

    return {
      characterEfficiency,
      relationshipEfficiency,
      conflictEfficiency
    };
  }

  private calculateCharacterEfficiency(network: ConflictNetwork): number {
    if (network.characters.size === 0) return 0;
    
    let activeCharacters = 0;
    
    for (const character of Array.from(network.characters.values())) {
      const isInConflict = Array.from(network.conflicts.values()).some(
        conflict => conflict.involvedCharacters.includes(character.id)
      );
      
      const hasRelationships = Array.from(network.relationships.values()).some(
        rel => rel.source === character.id || rel.target === character.id
      );
      
      if (isInConflict || hasRelationships) {
        activeCharacters++;
      }
    }
    
    return activeCharacters / network.characters.size;
  }

  private calculateRelationshipEfficiency(network: ConflictNetwork): number {
    if (network.relationships.size === 0) return 0;
    
    let activeRelationships = 0;
    
    for (const relationship of Array.from(network.relationships.values())) {
      const isRelevantToConflict = Array.from(network.conflicts.values()).some(
        conflict => conflict.relatedRelationships?.includes(relationship.id)
      );
      
      if (isRelevantToConflict || relationship.strength >= 5) {
        activeRelationships++;
      }
    }
    
    return activeRelationships / network.relationships.size;
  }

  private calculateConflictEfficiency(network: ConflictNetwork): number {
    if (network.conflicts.size === 0) return 0;
    
    let activeConflicts = 0;
    
    for (const conflict of Array.from(network.conflicts.values())) {
      if (conflict.strength >= 5 && conflict.involvedCharacters.length >= 2) {
        activeConflicts++;
      }
    }
    
    return activeConflicts / network.conflicts.size;
  }

  private calculateNarrativeDensity(network: ConflictNetwork): number {
    const totalElements = network.characters.size + network.relationships.size + network.conflicts.size;
    if (totalElements === 0) return 0;
    
    const connections = Array.from(network.relationships.values()).length + 
                       Array.from(network.conflicts.values()).reduce(
                         (sum, conflict) => sum + conflict.involvedCharacters.length, 0
                       );
    
    return connections / totalElements;
  }

  private calculateRedundancyMetrics(network: ConflictNetwork): {
    characterRedundancy: number;
    relationshipRedundancy: number;
    conflictRedundancy: number;
  } {
    return {
      characterRedundancy: this.calculateCharacterRedundancy(network),
      relationshipRedundancy: this.calculateRelationshipRedundancy(network),
      conflictRedundancy: this.calculateConflictRedundancy(network)
    };
  }

  private calculateCharacterRedundancy(network: ConflictNetwork): number {
    // Simple redundancy check based on similar roles/functions
    const characters = Array.from(network.characters.values());
    if (characters.length <= 1) return 0;
    
    let redundantPairs = 0;
    let totalPairs = 0;
    
    for (let i = 0; i < characters.length; i++) {
      for (let j = i + 1; j < characters.length; j++) {
        totalPairs++;
        
        const char1 = characters[i];
        const char2 = characters[j];
        
        // Check if characters exist and have descriptions
        if (!char1 || !char2 || !char1.description || !char2.description) {
          continue;
        }
        
        // Check if characters have similar narrative functions
        if (char1.description === char2.description) {
          redundantPairs++;
        }
      }
    }
    
    return totalPairs > 0 ? redundantPairs / totalPairs : 0;
  }

  private calculateRelationshipRedundancy(network: ConflictNetwork): number {
    const relationships = Array.from(network.relationships.values());
    if (relationships.length <= 1) return 0;
    
    let redundantPairs = 0;
    let totalPairs = 0;
    
    for (let i = 0; i < relationships.length; i++) {
      for (let j = i + 1; j < relationships.length; j++) {
        totalPairs++;
        
        const rel1 = relationships[i];
        const rel2 = relationships[j];
        
        // Check if relationships exist and have required properties
        if (!rel1 || !rel2 || !rel1.source || !rel1.target || !rel1.type || 
            !rel2.source || !rel2.target || !rel2.type) {
          continue;
        }
        
        // Check for duplicate relationships
        if ((rel1.source === rel2.source && rel1.target === rel2.target) ||
            (rel1.source === rel2.target && rel1.target === rel2.source)) {
          if (rel1.type === rel2.type) {
            redundantPairs++;
          }
        }
      }
    }
    
    return totalPairs > 0 ? redundantPairs / totalPairs : 0;
  }

  private calculateConflictRedundancy(network: ConflictNetwork): number {
    const conflicts = Array.from(network.conflicts.values());
    if (conflicts.length <= 1) return 0;
    
    let redundantPairs = 0;
    let totalPairs = 0;
    
    for (let i = 0; i < conflicts.length; i++) {
      for (let j = i + 1; j < conflicts.length; j++) {
        totalPairs++;
        
        const conflict1 = conflicts[i];
        const conflict2 = conflicts[j];
        
        // Check if conflicts exist and have required properties
        if (!conflict1 || !conflict2 || !conflict1.subject || !conflict1.scope ||
            !conflict2.subject || !conflict2.scope || !conflict1.involvedCharacters || 
            !conflict2.involvedCharacters) {
          continue;
        }
        
        // Check for similar conflicts
        if (conflict1.subject === conflict2.subject && 
            conflict1.scope === conflict2.scope) {
          const sharedCharacters = conflict1.involvedCharacters.filter(
            char => conflict2.involvedCharacters.includes(char)
          );
          
          if (sharedCharacters.length > 0) {
            redundantPairs++;
          }
        }
      }
    }
    
    return totalPairs > 0 ? redundantPairs / totalPairs : 0;
  }

  private calculateGiniCoefficient(values: number[]): number {
    if (values.length === 0) return 0;
    
    const sortedValues = values.sort((a, b) => a - b);
    const n = sortedValues.length;
    const sum = sortedValues.reduce((a, b) => a + b, 0);
    
    if (sum === 0) return 0;
    
    let gini = 0;
    for (let i = 0; i < n; i++) {
      const value = sortedValues[i];
      if (value !== undefined) {
        gini += (2 * (i + 1) - n - 1) * value;
      }
    }
    
    return gini / (n * sum);
  }

  private calculateOverallScore(metrics: {
    conflictCohesion: number;
    dramaticBalance: number;
    narrativeEfficiency: number;
    narrativeDensity: number;
    redundancy: number;
  }): number {
    const weights = {
      conflictCohesion: 0.25,
      dramaticBalance: 0.25,
      narrativeEfficiency: 0.25,
      narrativeDensity: 0.15,
      redundancy: 0.10
    };
    
    return (
      metrics.conflictCohesion * weights.conflictCohesion +
      metrics.dramaticBalance * weights.dramaticBalance +
      metrics.narrativeEfficiency * weights.narrativeEfficiency +
      metrics.narrativeDensity * weights.narrativeDensity +
      metrics.redundancy * weights.redundancy
    ) * 100;
  }

  private getRating(score: number): 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical' {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Critical';
  }
}
