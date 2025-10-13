export interface Character {
  id: string;
  name: string;
  description: string;
  profile: {
    personalityTraits: string;
    motivationsGoals: string;
    potentialArc: string;
  };
  metadata: Record<string, any>;
}

export enum RelationshipType {
  LOVE = 'LOVE',
  RIVALRY = 'RIVALRY',
  ALLIANCE = 'ALLIANCE',
  FAMILY = 'FAMILY',
  MENTORSHIP = 'MENTORSHIP',
  ENMITY = 'ENMITY',
  OTHER = 'OTHER'
}

export enum RelationshipNature {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
  NEUTRAL = 'NEUTRAL',
  AMBIVALENT = 'AMBIVALENT',
  OTHER = 'OTHER'
}

export enum RelationshipDirection {
  DIRECTED = 'DIRECTED',
  BIDIRECTIONAL = 'BIDIRECTIONAL'
}

export interface Relationship {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  nature: RelationshipNature;
  direction: RelationshipDirection;
  strength: number;
  description: string;
  triggers: string[];
  metadata: Record<string, any>;
}

export enum ConflictSubject {
  VALUE = 'VALUE',
  MATERIAL = 'MATERIAL',
  POWER = 'POWER',
  PSYCHOLOGICAL = 'PSYCHOLOGICAL',
  RELATIONSHIP = 'RELATIONSHIP',
  INFORMATIONAL = 'INFORMATIONAL',
  SURVIVAL = 'SURVIVAL',
  OTHER = 'OTHER'
}

export enum ConflictScope {
  INTERNAL = 'INTERNAL',
  PERSONAL = 'PERSONAL',
  GROUP = 'GROUP',
  SOCIETAL = 'SOCIETAL',
  UNIVERSAL = 'UNIVERSAL'
}

export enum ConflictPhase {
  LATENT = 'LATENT',
  EMERGING = 'EMERGING',
  ESCALATING = 'ESCALATING',
  STALEMATE = 'STALEMATE',
  CLIMAX = 'CLIMAX',
  DEESCALATING = 'DEESCALATING',
  RESOLUTION = 'RESOLUTION',
  AFTERMATH = 'AFTERMATH',
  OTHER = 'OTHER'
}

export interface Conflict {
  id: string;
  name: string;
  description: string;
  involvedCharacters: string[];
  subject: ConflictSubject;
  scope: ConflictScope;
  phase: ConflictPhase;
  strength: number;
  relatedRelationships: string[];
  pivotPoints: string[];
  timestamps: Date[];
  metadata: Record<string, any>;
}

export interface NetworkSnapshot {
  timestamp: Date;
  description: string;
  networkState: Partial<ConflictNetwork>;
}

export interface ConflictNetwork {
  id: string;
  name: string;
  characters: Map<string, Character>;
  relationships: Map<string, Relationship>;
  conflicts: Map<string, Conflict>;
  snapshots: NetworkSnapshot[];
  metadata: Record<string, any>;
}

export class ConflictNetworkImpl implements ConflictNetwork {
  id: string;
  name: string;
  characters: Map<string, Character>;
  relationships: Map<string, Relationship>;
  conflicts: Map<string, Conflict>;
  snapshots: NetworkSnapshot[];
  metadata: Record<string, any>;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.characters = new Map();
    this.relationships = new Map();
    this.conflicts = new Map();
    this.snapshots = [];
    this.metadata = {};
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
    this.snapshots.push({
      timestamp: new Date(),
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
}
