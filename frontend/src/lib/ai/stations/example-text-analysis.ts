import { GeminiService } from './gemini-service';
import { AllStationsTextRunner } from './run-all-stations-text-output';

// مثال على كيفية استخدام النظام الجديد
export async function runTextAnalysisExample() {
  // إعداد خدمة Gemini
  const geminiService = new GeminiService();
  
  // إنشاء مشغل المحطات
  const runner = new AllStationsTextRunner(geminiService, './output');
  
  // النص المراد تحليله (مثال)
  const sampleText = `
في قرية صغيرة على ضفاف النيل، يعيش أحمد، شاب في العشرينات من عمره، يحلم بأن يصبح كاتباً مشهوراً. 
يواجه أحمد صراعاً داخلياً بين رغبته في تحقيق أحلامه وضغوط الأسرة التي تريده أن يعمل في التجارة.

تدخل فاطمة، الفتاة الجميلة والذكية، حياة أحمد وتصبح مصدر إلهام له. لكن والد فاطمة يرفض هذه العلاقة 
لأن أحمد ليس لديه مصدر دخل ثابت.

يقرر أحمد أن يثبت نفسه، فيبدأ في كتابة رواية عن قريته وأهلها. لكن الطريق ليس سهلاً، فهو يواجه 
انتقادات من المجتمع المحافظ الذي لا يقدر الفن والأدب.

في النهاية، ينجح أحمد في نشر روايته وتحقق نجاحاً كبيراً، مما يجعل والد فاطمة يوافق على زواجهما.
  `;

  try {
    // تشغيل التحليل
    await runner.runAllStationsWithTextOutput({
      outputDir: './drama-analysis-output',
      fullText: sampleText,
      projectName: 'قصة أحمد وفاطمة'
    });

    console.log('تم الانتهاء من التحليل بنجاح! تحقق من مجلد drama-analysis-output');
    
  } catch (error) {
    console.error('خطأ في التحليل:', error);
  }
}

// تشغيل المثال
// runTextAnalysisExample();