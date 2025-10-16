/**
 * Provides utilities for smoke testing the dynamic instruction loading
 * subsystem to ensure the JSON prompt assets remain accessible.
 */

import { agentInstructions } from './agent-instructions';

// قائمة الوكلاء المتوقعة
const EXPECTED_AGENTS = [
  'analysis',
  'creative',
  'character-analyzer',
  'dialogue-forensics',
  'style-fingerprint',
  'platform-adapter',
  'adaptive-rewriting',
  'integrated',
  'thematic-mining',
  'world-builder',
  'tension-optimizer',
  'audience-resonance',
  'character-deep-analyzer',
  'dialogue-advanced-analyzer',
  'visual-cinematic-analyzer',
  'themes-messages-analyzer',
  'cultural-historical-analyzer',
  'producibility-analyzer',
  'target-audience-analyzer',
  'literary-quality-analyzer',
  'recommendations-generator',
  'character-network',
  'character-voice',
  'conflict-dynamics',
  'plot-predictor'
];

export class InstructionsSystemTester {

  /**
   * Executes a comprehensive verification over the expected agents list and
   * reports aggregate success metrics.
   *
   * @returns A structured {@link TestResults} summary describing load outcomes.
   */
  async runFullTest(): Promise<TestResults> {
    console.log('🧪 بدء اختبار نظام تعليمات الوكلاء...');
    
    const results: TestResults = {
      totalAgents: EXPECTED_AGENTS.length,
      successfulLoads: 0,
      failedLoads: 0,
      errors: [],
      loadedAgents: [],
      missingAgents: []
    };

    // اختبار تحميل كل وكيل
    for (const agentId of EXPECTED_AGENTS) {
      try {
        console.log(`📋 اختبار تحميل وكيل: ${agentId}`);
        const instructions = await agentInstructions.getInstructions(agentId);
        
        if (this.validateInstructions(instructions, agentId)) {
          results.successfulLoads++;
          results.loadedAgents.push(agentId);
          console.log(`✅ نجح تحميل ${agentId}`);
        } else {
          results.failedLoads++;
          results.errors.push(`تعليمات غير صالحة للوكيل: ${agentId}`);
          console.log(`❌ تعليمات غير صالحة: ${agentId}`);
        }
      } catch (error) {
        results.failedLoads++;
        results.missingAgents.push(agentId);
        results.errors.push(`فشل تحميل ${agentId}: ${error}`);
        console.log(`❌ فشل تحميل ${agentId}:`, error);
      }
    }

    // اختبار حالة التخزين المؤقت
    const cacheStatus = agentInstructions.getCacheStatus();
    console.log(`💾 حالة التخزين المؤقت: ${cacheStatus.cached.length} وكيل محمل`);

    return results;
  }

  /**
   * Validates that a loaded instruction payload satisfies the minimum schema.
   *
   * @param instructions - The instruction object returned by the loader.
   * @param agentId - Identifier of the agent being validated for logging context.
   * @returns {@code true} when the instruction set includes mandatory fields.
   */
  private validateInstructions(instructions: any, agentId: string): boolean {
    if (!instructions) return false;
    
    // التحقق من الحقول الأساسية
    if (!instructions.systemPrompt || typeof instructions.systemPrompt !== 'string') {
      console.warn(`⚠️ systemPrompt مفقود أو غير صالح للوكيل ${agentId}`);
      return false;
    }

    if (!instructions.instructions || !Array.isArray(instructions.instructions)) {
      console.warn(`⚠️ instructions مفقود أو غير صالح للوكيل ${agentId}`);
      return false;
    }

    return true;
  }

  /**
   * Performs a lightweight availability check for a single agent.
   *
   * @param agentId - Identifier of the agent to test.
   * @returns {@code true} when the agent's instructions are valid and loadable.
   */
  async testSingleAgent(agentId: string): Promise<boolean> {
    try {
      const instructions = await agentInstructions.getInstructions(agentId);
      return this.validateInstructions(instructions, agentId);
    } catch {
      return false;
    }
  }

  /**
   * Emits a human-readable report to the console summarizing a full test run.
   *
   * @param results - Aggregate metrics previously produced by {@link runFullTest}.
   */
  printReport(results: TestResults): void {
    console.log('\n📊 تقرير اختبار نظام التعليمات:');
    console.log('================================');
    console.log(`📈 إجمالي الوكلاء: ${results.totalAgents}`);
    console.log(`✅ تم تحميلها بنجاح: ${results.successfulLoads}`);
    console.log(`❌ فشل التحميل: ${results.failedLoads}`);
    console.log(`📊 معدل النجاح: ${((results.successfulLoads / results.totalAgents) * 100).toFixed(1)}%`);
    
    if (results.missingAgents.length > 0) {
      console.log('\n🚫 الوكلاء المفقودون:');
      results.missingAgents.forEach(agent => console.log(`  - ${agent}`));
    }
    
    if (results.errors.length > 0) {
      console.log('\n⚠️ الأخطاء:');
      results.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('\n✅ الوكلاء المحملون بنجاح:');
    results.loadedAgents.forEach(agent => console.log(`  - ${agent}`));
  }
}

export interface TestResults {
  totalAgents: number;
  successfulLoads: number;
  failedLoads: number;
  errors: string[];
  loadedAgents: string[];
  missingAgents: string[];
}

// تصدير مثيل للاختبار
export const instructionsTester = new InstructionsSystemTester();

// دالة مساعدة للاختبار السريع
/**
 * Convenience helper that runs the full test suite and prints the results in
 * a single invocation.
 *
 * @returns A promise that resolves once the report has been logged.
 */
export async function quickTest(): Promise<void> {
  const tester = new InstructionsSystemTester();
  const results = await tester.runFullTest();
  tester.printReport(results);
}