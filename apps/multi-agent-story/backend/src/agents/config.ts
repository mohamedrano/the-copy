import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface AgentConfig {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  description: string;
  systemPrompt: string;
  capabilities: string[];
}

export const AGENTS: AgentConfig[] = [
  {
    id: 'story-engineer',
    name: 'Story Engineer',
    nameAr: 'مهندس القصة',
    role: 'Structure & Architecture',
    roleAr: 'البناء الهيكلي',
    description: 'Designs narrative structure and ensures story coherence',
    systemPrompt: `You are the Story Engineer. Your role is to:
    - Design and validate story structure
    - Ensure narrative coherence and flow
    - Create compelling three-act structures
    - Balance pacing and tension throughout
    - Identify and resolve plot holes`,
    capabilities: ['structure', 'pacing', 'plot-development']
  },
  {
    id: 'reality-critic',
    name: 'Reality Critic',
    nameAr: 'ناقد الواقعية',
    role: 'Logic & Believability',
    roleAr: 'التحقق من المنطق',
    description: 'Ensures story logic and real-world believability',
    systemPrompt: `You are the Reality Critic. Your role is to:
    - Verify logical consistency
    - Check real-world accuracy
    - Ensure believable character actions
    - Validate cause-and-effect relationships
    - Point out implausible elements`,
    capabilities: ['logic-check', 'fact-verification', 'believability']
  },
  {
    id: 'character-developer',
    name: 'Character Developer',
    nameAr: 'مطور الشخصيات',
    role: 'Character Depth',
    roleAr: 'عمق الشخصيات',
    description: 'Creates deep, multi-dimensional characters',
    systemPrompt: `You are the Character Developer. Your role is to:
    - Create complex, relatable characters
    - Develop authentic character arcs
    - Design meaningful relationships
    - Ensure diverse representation
    - Build compelling backstories`,
    capabilities: ['character-creation', 'psychology', 'relationships']
  },
  {
    id: 'dialogue-coordinator',
    name: 'Dialogue Coordinator',
    nameAr: 'منسق الحوارات',
    role: 'Natural Dialogue',
    roleAr: 'الحوارات الطبيعية',
    description: 'Crafts authentic and impactful dialogue',
    systemPrompt: `You are the Dialogue Coordinator. Your role is to:
    - Write natural, authentic dialogue
    - Ensure distinct character voices
    - Balance exposition with naturalism
    - Create memorable lines
    - Maintain cultural authenticity`,
    capabilities: ['dialogue-writing', 'voice-distinction', 'subtext']
  },
  {
    id: 'market-analyst',
    name: 'Market Analyst',
    nameAr: 'محلل السوق',
    role: 'Commercial Viability',
    roleAr: 'الجدوى التجارية',
    description: 'Evaluates market potential and audience appeal',
    systemPrompt: `You are the Market Analyst. Your role is to:
    - Assess commercial potential
    - Identify target audiences
    - Analyze market trends
    - Evaluate production feasibility
    - Suggest marketable elements`,
    capabilities: ['market-research', 'audience-analysis', 'trends']
  },
  {
    id: 'genre-expert',
    name: 'Genre Expert',
    nameAr: 'خبير النوع',
    role: 'Genre Conventions',
    roleAr: 'معايير النوع الأدبي',
    description: 'Ensures adherence to genre expectations',
    systemPrompt: `You are the Genre Expert. Your role is to:
    - Apply genre conventions effectively
    - Balance familiarity with innovation
    - Identify genre-specific requirements
    - Suggest genre-appropriate elements
    - Ensure tonal consistency`,
    capabilities: ['genre-knowledge', 'conventions', 'innovation']
  },
  {
    id: 'tension-editor',
    name: 'Tension Editor',
    nameAr: 'محرر التوتر',
    role: 'Pacing & Suspense',
    roleAr: 'الإيقاع والتشويق',
    description: 'Manages dramatic tension and pacing',
    systemPrompt: `You are the Tension Editor. Your role is to:
    - Build and release tension effectively
    - Create compelling cliffhangers
    - Manage story pacing
    - Design plot twists
    - Maintain audience engagement`,
    capabilities: ['suspense', 'pacing', 'plot-twists']
  },
  {
    id: 'culture-consultant',
    name: 'Culture Consultant',
    nameAr: 'مستشار الثقافة',
    role: 'Cultural Sensitivity',
    roleAr: 'الحساسية الثقافية',
    description: 'Ensures cultural authenticity and sensitivity',
    systemPrompt: `You are the Culture Consultant. Your role is to:
    - Ensure cultural authenticity
    - Avoid stereotypes and clichés
    - Provide cultural context
    - Suggest culturally appropriate elements
    - Ensure respectful representation`,
    capabilities: ['cultural-awareness', 'authenticity', 'sensitivity']
  },
  {
    id: 'scene-planner',
    name: 'Scene Planner',
    nameAr: 'مخطط المشاهد',
    role: 'Visual Storytelling',
    roleAr: 'البناء البصري',
    description: 'Designs visually compelling scenes',
    systemPrompt: `You are the Scene Planner. Your role is to:
    - Design visually striking scenes
    - Create memorable locations
    - Plan effective scene transitions
    - Suggest visual metaphors
    - Ensure production feasibility`,
    capabilities: ['visual-design', 'scene-planning', 'transitions']
  },
  {
    id: 'theme-analyst',
    name: 'Theme Analyst',
    nameAr: 'محلل المواضيع',
    role: 'Thematic Depth',
    roleAr: 'العمق الموضوعي',
    description: 'Develops and maintains thematic consistency',
    systemPrompt: `You are the Theme Analyst. Your role is to:
    - Identify and develop themes
    - Ensure thematic consistency
    - Create symbolic elements
    - Layer meaning and subtext
    - Connect themes to character arcs`,
    capabilities: ['theme-development', 'symbolism', 'meaning']
  },
  {
    id: 'master-orchestrator',
    name: 'Master Orchestrator',
    nameAr: 'المنسق الرئيسي',
    role: 'Final Decision',
    roleAr: 'التنسيق والقرار',
    description: 'Coordinates all agents and makes final decisions',
    systemPrompt: `You are the Master Orchestrator. Your role is to:
    - Coordinate all agent inputs
    - Synthesize diverse perspectives
    - Make final creative decisions
    - Resolve conflicts between suggestions
    - Ensure overall story quality`,
    capabilities: ['coordination', 'synthesis', 'decision-making']
  }
];

export class AgentManager {
  private model: any;
  
  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' 
    });
  }
  
  async executeAgent(agentId: string, prompt: string, context: any) {
    const agent = AGENTS.find(a => a.id === agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    const fullPrompt = `
${agent.systemPrompt}

Context:
${JSON.stringify(context, null, 2)}

Task:
${prompt}

Please provide your analysis in both English and Arabic where appropriate.
`;
    
    try {
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error(`Error executing agent ${agentId}:`, error);
      throw error;
    }
  }
  
  async runPhase(phase: number, sessionData: any) {
    const phaseAgents = this.getAgentsForPhase(phase);
    const results = [];
    
    for (const agentId of phaseAgents) {
      const result = await this.executeAgent(
        agentId,
        this.getPhasePrompt(phase),
        sessionData
      );
      results.push({ agentId, result });
    }
    
    return results;
  }
  
  private getAgentsForPhase(phase: number): string[] {
    switch (phase) {
      case 1: // Creative Brief
        return ['master-orchestrator'];
      case 2: // Idea Generation
        return ['story-engineer', 'character-developer', 'theme-analyst'];
      case 3: // Independent Review
        return AGENTS.filter(a => a.id !== 'master-orchestrator').map(a => a.id);
      case 4: // The Tournament
        return AGENTS.map(a => a.id);
      case 5: // Final Decision
        return ['master-orchestrator'];
      default:
        return [];
    }
  }
  
  private getPhasePrompt(phase: number): string {
    const prompts = {
      1: 'Analyze the creative brief and prepare initial assessment',
      2: 'Generate two competing story ideas based on the brief',
      3: 'Review and score both ideas from your perspective',
      4: 'Debate and defend your preferred idea',
      5: 'Make the final decision and provide comprehensive report'
    };
    return prompts[phase as keyof typeof prompts] || '';
  }
}

export const agentManager = new AgentManager();
