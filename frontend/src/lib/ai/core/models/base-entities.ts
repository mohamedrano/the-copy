
import { z } from 'zod';

// Base entity for any uniquely identifiable item in the system.
export const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
});
export type BaseEntity = z.infer<typeof BaseEntitySchema>;

// Represents a character in the narrative.
export const CharacterSchema = BaseEntitySchema.extend({
  profile: z.object({
    personalityTraits: z.string().optional(),
    motivationsGoals: z.string().optional(),
    potentialArc: z.string().optional(),
  }).optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type Character = z.infer<typeof CharacterSchema>;

// Enum for relationship types
export enum RelationshipType {
  FAMILY = 'FAMILY',
  ROMANTIC = 'ROMANTIC',
  FRIENDSHIP = 'FRIENDSHIP',
  PROFESSIONAL = 'PROFESSIONAL',
  RIVALRY = 'RIVALRY',
  MENTORSHIP = 'MENTORSHIP',
  OTHER = 'OTHER',
}

// Enum for relationship nature
export enum RelationshipNature {
  SUPPORTIVE = 'SUPPORTIVE',
  CONFLICTUAL = 'CONFLICTUAL',
  AMBIGUOUS = 'AMBIGUOUS',
  NEUTRAL = 'NEUTRAL',
}

// Enum for relationship direction
export enum RelationshipDirection {
  UNIDIRECTIONAL = 'UNIDIRECTIONAL',
  BIDIRECTIONAL = 'BIDIRECTIONAL',
}

// Represents a relationship between two characters.
export const RelationshipSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.nativeEnum(RelationshipType),
  nature: z.nativeEnum(RelationshipNature),
  direction: z.nativeEnum(RelationshipDirection),
  strength: z.number().min(1).max(10),
  description: z.string().optional(),
  triggers: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type Relationship = z.infer<typeof RelationshipSchema>;

// Enum for conflict subject matter
export enum ConflictSubject {
  POWER = 'POWER',
  LOVE = 'LOVE',
  REVENGE = 'REVENGE',
  IDEOLOGY = 'IDEOLOGY',
  SURVIVAL = 'SURVIVAL',
  RESOURCES = 'RESOURCES',
  IDENTITY = 'IDENTITY',
  OTHER = 'OTHER',
}

// Enum for conflict scope
export enum ConflictScope {
  INTERNAL = 'INTERNAL',
  PERSONAL = 'PERSONAL',
  GROUP = 'GROUP',
  SOCIETAL = 'SOCIETAL',
  UNIVERSAL = 'UNIVERSAL',
}

// Enum for conflict phases
export enum ConflictPhase {
  LATENT = 'LATENT',
  EMERGING = 'EMERGING',
  ESCALATING = 'ESCALATING',
  CLIMAX = 'CLIMAX',
  DEESCALATING = 'DEESCALATING',
  RESOLUTION = 'RESOLUTION',
  AFTERMATH = 'AFTERMATH',
}

// Represents a conflict in the narrative.
export const ConflictSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  involvedCharacters: z.array(z.string()),
  subject: z.nativeEnum(ConflictSubject),
  scope: z.nativeEnum(ConflictScope),
  phase: z.nativeEnum(ConflictPhase),
  strength: z.number().min(1).max(10),
  relatedRelationships: z.array(z.string()).optional(),
  pivotPoints: z.array(z.string()).optional(),
  timestamps: z.array(z.date()).optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type Conflict = z.infer<typeof ConflictSchema>;


export interface NetworkState {
  characters: Map<string, Character>;
  relationships: Map<string, Relationship>;
  conflicts: Map<string, Conflict>;
}

export interface NetworkSnapshot {
  timestamp: Date;
  description: string;
  networkState: NetworkState;
}

export interface ConflictNetwork {
  id: string;
  name: string;
  characters: Map<string, Character>;
  relationships: Map<string, Relationship>;
  conflicts: Map<string, Conflict>;
  snapshots: NetworkSnapshot[];

  addCharacter(character: Character): void;
  addRelationship(relationship: Relationship): void;
  addConflict(conflict: Conflict): void;
  createSnapshot(description: string): void;
}

export class ConflictNetworkImpl implements ConflictNetwork {
  id: string;
  name: string;
  characters: Map<string, Character>;
  relationships: Map<string, Relationship>;
  conflicts: Map<string, Conflict>;
  snapshots: NetworkSnapshot[];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.characters = new Map();
    this.relationships = new Map();
    this.conflicts = new Map();
    this.snapshots = [];
  }

  addCharacter(character: Character): void {
    this.characters.set(character.id, character);
  }

  addRelationship(relationship: Relationship): void {
    this.relationships.set(relationship.id, relationship);
  }

  addConflict(conflict: Conflict): void {
    this.conflicts.set(conflict.id, conflict);
  }

  createSnapshot(description: string): void {
    const snapshotState: NetworkState = {
      characters: new Map(this.characters),
      relationships: new Map(this.relationships),
      conflicts: new Map(this.conflicts),
    };
    this.snapshots.push({
      timestamp: new Date(),
      description,
      networkState: snapshotState,
    });
  }
}
