import { PipelineInput, PipelineRunResult, Station1Output } from '@/types';
import { GeminiService } from './gemini.service';
import { logger } from '@/utils/logger';

export class AnalysisService {
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = new GeminiService();
  }

  async runFullPipeline(input: PipelineInput): Promise<PipelineRunResult> {
    const startTime = Date.now();
    logger.info('Starting analysis pipeline', { projectName: input.projectName });

    try {
      // Station 1: Text Analysis
      const station1Output = await this.runStation1(input);
      
      // Station 2-7: Mock implementations for now
      const mockStationOutput = {
        stationId: 2,
        stationName: 'Mock Station',
        executionTime: 100,
        status: 'completed' as const,
        timestamp: new Date().toISOString(),
      };

      const endTime = Date.now();
      
      return {
        stationOutputs: {
          station1: station1Output,
          station2: mockStationOutput,
          station3: mockStationOutput,
          station4: mockStationOutput,
          station5: mockStationOutput,
          station6: mockStationOutput,
          station7: mockStationOutput,
        },
        pipelineMetadata: {
          stationsCompleted: 7,
          totalExecutionTime: endTime - startTime,
          startedAt: new Date(startTime).toISOString(),
          finishedAt: new Date(endTime).toISOString(),
        },
      };
    } catch (error) {
      logger.error('Pipeline execution failed:', error);
      throw error;
    }
  }

  private async runStation1(input: PipelineInput): Promise<Station1Output> {
    const startTime = Date.now();
    
    try {
      const analysis = await this.geminiService.analyzeText(input.fullText, 'characters');
      
      // Parse AI response to extract structured data
      const characters = this.extractCharacters(analysis);
      const relationships = this.extractRelationships(analysis);
      
      return {
        stationId: 1,
        stationName: 'Text Analysis',
        executionTime: Date.now() - startTime,
        status: 'completed',
        timestamp: new Date().toISOString(),
        majorCharacters: characters,
        relationships: relationships,
        narrativeStyleAnalysis: {
          overallTone: 'درامي',
          pacing: 'متوسط',
          complexity: 7,
        },
      };
    } catch (error) {
      logger.error('Station 1 failed:', error);
      throw new Error('فشل في تحليل النص الأساسي');
    }
  }

  private extractCharacters(analysis: string): string[] {
    // Simple extraction - في التطبيق الحقيقي نحتاج parsing أكثر تعقيداً
    const lines = analysis.split('\n');
    const characters: string[] = [];
    
    for (const line of lines) {
      if (line.includes('شخصية') || line.includes('الشخصيات')) {
        const matches = line.match(/[\u0600-\u06FF\s]+/g);
        if (matches) {
          characters.push(...matches.filter(m => m.trim().length > 2));
        }
      }
    }
    
    return [...new Set(characters)].slice(0, 10); // أول 10 شخصيات فريدة
  }

  private extractRelationships(analysis: string): Array<{
    character1: string;
    character2: string;
    relationshipType: string;
    strength: number;
  }> {
    // Mock implementation - في التطبيق الحقيقي نحتاج parsing متقدم
    return [
      {
        character1: 'البطل',
        character2: 'البطلة',
        relationshipType: 'حب',
        strength: 0.9,
      },
    ];
  }
}