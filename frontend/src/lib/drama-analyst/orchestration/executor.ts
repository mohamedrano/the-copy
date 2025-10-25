import { AIRequest, AIResponse, Result } from '../types';

export const submitTask = async (request: AIRequest): Promise<Result<AIResponse>> => {
  // محاكاة التحليل
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    ok: true,
    value: {
      raw: 'تم التحليل بنجاح. هذا نص تجريبي للتحليل الدرامي.',
      parsed: {
        overallAnalysis: 'تحليل عام للنص المقدم'
      }
    }
  };
};