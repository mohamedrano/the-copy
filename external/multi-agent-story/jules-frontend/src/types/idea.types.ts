// Idea types
export type IdeaStatus = 'generating' | 'completed' | 'error' | 'regenerating'

export interface Idea {
  id: string
  sessionId: string
  title: string
  content: string
  status: IdeaStatus
  structure: IdeaStructure
  characters: Character[]
  world: WorldBuilding
  themes: string[]
  genre: string
  tone: string
  targetAudience: string
  estimatedLength: number
  complexity: number
  originality: number
  marketability: number
  createdAt: string
  updatedAt: string
}

export interface IdeaStructure {
  act1: ActStructure
  act2: ActStructure
  act3: ActStructure
  plotPoints: PlotPoint[]
  conflicts: Conflict[]
  resolutions: Resolution[]
}

export interface ActStructure {
  title: string
  description: string
  duration: number
  keyEvents: string[]
  characterArcs: string[]
}

export interface PlotPoint {
  id: string
  title: string
  description: string
  act: number
  importance: 'low' | 'medium' | 'high' | 'critical'
  timing: number
}

export interface Conflict {
  id: string
  type: 'internal' | 'external' | 'interpersonal' | 'societal'
  description: string
  intensity: number
  resolution: string
}

export interface Resolution {
  id: string
  conflictId: string
  description: string
  satisfaction: number
  believability: number
}

export interface Character {
  id: string
  name: string
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor'
  description: string
  personality: PersonalityTraits
  background: CharacterBackground
  arc: CharacterArc
  relationships: CharacterRelationship[]
}

export interface PersonalityTraits {
  primary: string[]
  secondary: string[]
  flaws: string[]
  strengths: string[]
  motivations: string[]
}

export interface CharacterBackground {
  age: number
  occupation: string
  education: string
  family: string
  history: string
  secrets: string[]
}

export interface CharacterArc {
  start: string
  end: string
  growth: string
  challenges: string[]
  transformation: string
}

export interface CharacterRelationship {
  characterId: string
  relationshipType: string
  description: string
  tension: number
  importance: 'low' | 'medium' | 'high'
}

export interface WorldBuilding {
  setting: Setting
  rules: WorldRule[]
  culture: Culture
  technology: Technology
  history: History
}

export interface Setting {
  time: string
  place: string
  atmosphere: string
  mood: string
  description: string
}

export interface WorldRule {
  category: string
  rule: string
  importance: 'low' | 'medium' | 'high'
  consistency: number
}

export interface Culture {
  values: string[]
  traditions: string[]
  language: string[]
  socialStructure: string
  conflicts: string[]
}

export interface Technology {
  level: string
  capabilities: string[]
  limitations: string[]
  impact: string
}

export interface History {
  majorEvents: HistoricalEvent[]
  timeline: TimelineEvent[]
  consequences: string[]
}

export interface HistoricalEvent {
  title: string
  description: string
  year: number
  impact: string
}

export interface TimelineEvent {
  date: string
  event: string
  importance: 'low' | 'medium' | 'high'
}

// Idea generation types
export interface GenerateIdeasRequest {
  count?: number
  focus?: string
  constraints?: IdeaConstraints
}

export interface IdeaConstraints {
  maxLength?: number
  minLength?: number
  requiredThemes?: string[]
  forbiddenThemes?: string[]
  targetGenre?: string
  complexityLevel?: 'low' | 'medium' | 'high'
}

export interface UpdateIdeaRequest {
  title?: string
  content?: string
  structure?: Partial<IdeaStructure>
  characters?: Character[]
  world?: Partial<WorldBuilding>
  themes?: string[]
  genre?: string
  tone?: string
  targetAudience?: string
}

export interface IdeaProgress {
  sessionId: string
  phase: 'generating' | 'reviewing' | 'completed'
  progress: number
  currentIdea?: number
  totalIdeas: number
  estimatedTimeRemaining?: number
  status: string
}

// Idea comparison types
export interface IdeaComparison {
  idea1: Idea
  idea2: Idea
  comparison: ComparisonMetrics
  winner?: string
  reasoning: string
}

export interface ComparisonMetrics {
  structure: number
  characters: number
  originality: number
  marketability: number
  feasibility: number
  emotionalImpact: number
  overall: number
}

// Idea statistics types
export interface IdeaStats {
  totalIdeas: number
  averageLength: number
  averageComplexity: number
  averageOriginality: number
  averageMarketability: number
  mostCommonThemes: string[]
  mostCommonGenres: string[]
  averageGenerationTime: number
}

