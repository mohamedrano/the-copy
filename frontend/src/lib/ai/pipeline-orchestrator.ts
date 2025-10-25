/**
 * Pipeline Orchestrator - Text-Only Sequential Stations
 *
 * Each station receives outputs from previous stations and produces pure text.
 * NO JSON. All stations are coupled sequentially.
 */

import {
  callGeminiText,
  toText,
  safeSub,
  safeSplit,
  type ModelId,
} from "./gemini-core";

// =====================================================
// Types
// =====================================================

export type StationCtx = {
  inputText: string;
  s1?: string;
  s2?: string;
  s3?: string;
  s4?: string;
  s5?: string;
  s6?: string;
  s7?: string;
};

export type PipelineResult = {
  success: boolean;
  stations: StationCtx;
  errors: string[];
};

// =====================================================
// Station 1: Basic Text Analysis
// =====================================================

async function station1_basic(text: string): Promise<string> {
  const prompt = `قم بتحليل النص التالي وحدد:
1. الشخصيات الرئيسية (3-7 شخصيات)
2. الأسلوب السردي العام
3. نغمة النص
4. وتيرة السرد
5. أسلوب اللغة

النص:
${safeSub(text, 0, 30000)}

قدم تحليلاً نصياً مفصلاً بدون JSON.`;

  return await callGeminiText({
    model: "gemini-2.5-flash-lite",
    prompt,
    temperature: 0.3,
  });
}

// =====================================================
// Station 2: Conceptual Analysis
// =====================================================

async function station2_conceptual(context: string): Promise<string> {
  const prompt = `بناءً على التحليل السابق والنص الأصلي، حدد:
1. بيان القصة الأساسي (Story Statement)
2. النوع الأدبي الهجين
3. الموضوعات الرئيسية
4. الرسالة المركزية

السياق والتحليل السابق:
${safeSub(context, 0, 35000)}

قدم تحليلاً مفاهيمياً عميقاً بدون JSON.`;

  return await callGeminiText({
    model: "gemini-2.5-flash",
    prompt,
    temperature: 0.3,
  });
}

// =====================================================
// Station 3: Network Builder
// =====================================================

async function station3_network(context: string): Promise<string> {
  const prompt = `بناءً على التحليلات السابقة، قم ببناء شبكة الصراع:
1. رسم العلاقات بين الشخصيات
2. تحديد نقاط الصراع الرئيسية
3. تحليل ديناميكيات القوة
4. تتبع تطور الصراعات

السياق من المحطات السابقة:
${safeSub(context, 0, 40000)}

قدم وصفاً تفصيلياً لشبكة الصراع بدون JSON.`;

  return await callGeminiText({
    model: "gemini-2.5-flash-lite",
    prompt,
    temperature: 0.3,
  });
}

// =====================================================
// Station 4: Efficiency Metrics
// =====================================================

async function station4_efficiency(context: string): Promise<string> {
  const prompt = `بناءً على جميع التحليلات السابقة، قيّم كفاءة النص:
1. كفاءة تطوير الشخصيات
2. كفاءة بناء الصراع
3. كفاءة الحبكة
4. توازن العناصر السردية
5. نقاط القوة والضعف
6. توصيات للتحسين

السياق الكامل:
${safeSub(context, 0, 45000)}

قدم تقييماً شاملاً للكفاءة مع توصيات عملية بدون JSON.`;

  return await callGeminiText({
    model: "gemini-2.5-flash-lite",
    prompt,
    temperature: 0.3,
  });
}

// =====================================================
// Station 5: Dynamic Analysis
// =====================================================

async function station5_dynamic(context: string): Promise<string> {
  const prompt = `قم بالتحليل الديناميكي للنص:
1. تتبع تطور الشخصيات عبر الأحداث
2. التحليل الرمزي والدلالي
3. الأنماط الأسلوبية المتكررة
4. التحولات الدرامية
5. الإيقاع الداخلي للنص

السياق من التحليلات السابقة:
${safeSub(context, 0, 45000)}

قدم تحليلاً ديناميكياً معمقاً بدون JSON.`;

  return await callGeminiText({
    model: "gemini-2.5-flash-lite",
    prompt,
    temperature: 0.3,
  });
}

// =====================================================
// Station 6: Diagnostics
// =====================================================

async function station6_diagnostics(context: string): Promise<string> {
  const prompt = `قم بتشخيص صحة النص وحدد المشاكل:
1. تشخيص المشاكل البنيوية
2. تحديد الثغرات في الحبكة
3. مشاكل تطوير الشخصيات
4. قضايا الإيقاع والتوازن
5. خطة علاجية مفصلة

السياق الكامل من جميع المحطات:
${safeSub(context, 0, 47000)}

قدم تشخيساً شاملاً مع خطة علاج واضحة بدون JSON.`;

  return await callGeminiText({
    model: "gemini-2.5-flash",
    prompt,
    temperature: 0.3,
  });
}

// =====================================================
// Station 7: Finalization
// =====================================================

async function station7_finalize(context: string): Promise<string> {
  const prompt = `قم بإعداد التقرير النهائي الشامل:
1. ملخص تنفيذي للتحليل الكامل
2. أهم النتائج من كل محطة
3. الاستنتاجات الرئيسية
4. خارطة طريق للتحسين
5. التوصيات ذات الأولوية

السياق الكامل من المحطات 1-6:
${safeSub(context, 0, 48000)}

قدم تقريراً نهائياً شاملاً ومنظماً بدون JSON.`;

  return await callGeminiText({
    model: "gemini-2.5-pro",
    prompt,
    temperature: 0.2,
  });
}

// =====================================================
// Pipeline Runner
// =====================================================

/**
 * Run the complete sequential pipeline
 * Each station receives output from previous stations
 */
export async function runPipeline(text: string): Promise<PipelineResult> {
  const errors: string[] = [];
  const c: StationCtx = { inputText: text };

  try {
    // Station 1: Basic Analysis
    console.log("[Pipeline] Running Station 1...");
    c.s1 = await station1_basic(c.inputText);
    console.log("[Pipeline] Station 1 completed");

    // Station 2: Conceptual Analysis (depends on S1)
    console.log("[Pipeline] Running Station 2...");
    c.s2 = await station2_conceptual(`${c.s1}\n\n===\n${c.inputText}`);
    console.log("[Pipeline] Station 2 completed");

    // Station 3: Network Builder (depends on S1, S2)
    console.log("[Pipeline] Running Station 3...");
    c.s3 = await station3_network(
      `${c.s2}\n\n[من مخرجات المحطة 1: ${safeSub(c.s1, 0, 2000)}]`
    );
    console.log("[Pipeline] Station 3 completed");

    // Station 4: Efficiency (depends on S1, S2, S3)
    console.log("[Pipeline] Running Station 4...");
    c.s4 = await station4_efficiency(`${c.s1}\n${c.s2}\n${c.s3}`);
    console.log("[Pipeline] Station 4 completed");

    // Station 5: Dynamic (depends on S2, S3, S4)
    console.log("[Pipeline] Running Station 5...");
    c.s5 = await station5_dynamic(`${c.s2}\n${c.s3}\n${c.s4}`);
    console.log("[Pipeline] Station 5 completed");

    // Station 6: Diagnostics (depends on all previous)
    console.log("[Pipeline] Running Station 6...");
    c.s6 = await station6_diagnostics(
      `${c.s1}\n${c.s2}\n${c.s3}\n${c.s4}\n${c.s5}`
    );
    console.log("[Pipeline] Station 6 completed");

    // Station 7: Finalization (depends on all previous)
    console.log("[Pipeline] Running Station 7...");
    c.s7 = await station7_finalize(
      `${c.s1}\n${c.s2}\n${c.s3}\n${c.s4}\n${c.s5}\n${c.s6}`
    );
    console.log("[Pipeline] Station 7 completed");

    return {
      success: true,
      stations: c,
      errors,
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Unknown pipeline error";
    errors.push(errorMsg);
    console.error("[Pipeline] Error:", errorMsg);

    return {
      success: false,
      stations: c,
      errors,
    };
  }
}

/**
 * Get station output safely as text
 */
export function getStationOutput(
  result: PipelineResult,
  stationNum: 1 | 2 | 3 | 4 | 5 | 6 | 7
): string {
  const key = `s${stationNum}` as keyof StationCtx;
  const output = result.stations[key];
  return toText(output);
}

/**
 * Export single station to text file
 */
export function exportStationText(
  result: PipelineResult,
  stationNum: 1 | 2 | 3 | 4 | 5 | 6 | 7
): string {
  const output = getStationOutput(result, stationNum);
  const header = `===========================================
المحطة ${stationNum} - تقرير التحليل
===========================================

`;
  return header + output;
}

/**
 * Export final combined report
 */
export function exportFinalReport(result: PipelineResult): string {
  const sections = [
    "===========================================",
    "التقرير النهائي الشامل - جميع المحطات",
    "===========================================",
    "",
    "## المحطة 1: التحليل النصي الأساسي",
    "-------------------------------------------",
    getStationOutput(result, 1),
    "",
    "## المحطة 2: التحليل المفاهيمي",
    "-------------------------------------------",
    getStationOutput(result, 2),
    "",
    "## المحطة 3: بناء شبكة الصراع",
    "-------------------------------------------",
    getStationOutput(result, 3),
    "",
    "## المحطة 4: مقاييس الكفاءة",
    "-------------------------------------------",
    getStationOutput(result, 4),
    "",
    "## المحطة 5: التحليل الديناميكي",
    "-------------------------------------------",
    getStationOutput(result, 5),
    "",
    "## المحطة 6: التشخيص والعلاج",
    "-------------------------------------------",
    getStationOutput(result, 6),
    "",
    "## المحطة 7: التقرير النهائي",
    "-------------------------------------------",
    getStationOutput(result, 7),
    "",
    "===========================================",
    "نهاية التقرير",
    "===========================================",
  ];

  return sections.join("\n");
}
