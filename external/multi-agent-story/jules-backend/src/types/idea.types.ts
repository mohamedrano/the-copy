export interface ThreeActStructure {
  act1: {
    setup: string;
    incitingIncident: string;
    plotPoint1: string;
  };
  act2: {
    risingAction: string;
    midpoint: string;
    plotPoint2: string;
  };
  act3: {
    climax: string;
    fallingAction: string;
    resolution: string;
  };
}

export interface Character {
  name: string;
  role: string;
  description: string;
  motivation: string;
  arc: string;
}

export interface KeyScene {
  title: string;
  description: string;
  purpose: string;
  emotionalBeat: string;
}

export interface Idea {
  id: string;
  sessionId: string;
  ideaNumber: 1 | 2;
  title: string;
  logline: string;
  synopsis: string;
  threeActStructure: ThreeActStructure;
  characters: Character[];
  keyScenes: KeyScene[];
  themes: string[];
  genre: string;
  tone: string;
  targetAudience: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
