import { Request, Response } from 'express';
import { PipelineInputSchema, ApiResponse } from '@/types';
import { AnalysisService } from '@/services/analysis.service';
import { GeminiService } from '@/services/gemini.service';
import { logger } from '@/utils/logger';

export class AnalysisController {
  private analysisService: AnalysisService;
  private geminiService: GeminiService;

  constructor() {
    this.analysisService = new AnalysisService();
    this.geminiService = new GeminiService();
  }

  async runPipeline(req: Request, res: Response): Promise<void> {
    try {
      const validatedInput = PipelineInputSchema.parse(req.body);
      
      logger.info('Pipeline request received', {
        projectName: validatedInput.projectName,
        textLength: validatedInput.fullText.length,
      });

      const result = await this.analysisService.runFullPipeline(validatedInput);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'تم تشغيل التحليل بنجاح',
      };

      res.json(response);
    } catch (error) {
      logger.error('Pipeline execution failed:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'خطأ غير معروف',
      };

      res.status(500).json(response);
    }
  }

  async reviewScreenplay(req: Request, res: Response): Promise<void> {
    try {
      const { text } = req.body;

      if (!text || text.length < 50) {
        const response: ApiResponse = {
          success: false,
          error: 'النص قصير جداً للمراجعة',
        };
        res.status(400).json(response);
        return;
      }

      const review = await this.geminiService.reviewScreenplay(text);
      
      const response: ApiResponse = {
        success: true,
        data: { review },
        message: 'تمت مراجعة السيناريو بنجاح',
      };

      res.json(response);
    } catch (error) {
      logger.error('Screenplay review failed:', error);
      
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'فشل في مراجعة السيناريو',
      };

      res.status(500).json(response);
    }
  }

  async getHealth(req: Request, res: Response): Promise<void> {
    const response: ApiResponse = {
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime(),
      },
    };

    res.json(response);
  }
}