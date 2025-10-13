import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import AnalysisService from '../src/services/AnalysisService.js';
import type { Script, DialogueLine } from '../src/types/types.js';

class StubAIWritingAssistant {
  public readonly calls: Array<{ prompt: string; context: string }> = [];

  async generateText(prompt: string, context: string) {
    this.calls.push({ prompt, context });

    if (prompt.includes('ملخص')) {
      return { text: 'ملخص تجريبي' };
    }

    if (prompt.includes('Logline')) {
      return { text: 'Logline تجريبي' };
    }

    return { text: 'استجابة عامة' };
  }
}

describe('AnalysisService', () => {
  it('يجمع المقاييس الأساسية ويرتب الشخصيات حسب عدد سطور الحوار', async () => {
    const dialogueSara1: DialogueLine = {
      id: 'd1',
      character: 'سارة',
      text: 'مرحبا',
      lineNumber: 2,
      sceneId: 'scene-1',
      type: 'dialogue',
    };
    const dialogueSara2: DialogueLine = {
      id: 'd2',
      character: 'سارة',
      text: 'كيف حالك؟',
      lineNumber: 3,
      sceneId: 'scene-1',
      type: 'dialogue',
    };
    const dialogueOmar: DialogueLine = {
      id: 'd3',
      character: 'عمر',
      text: 'بخير والحمد لله.',
      lineNumber: 6,
      sceneId: 'scene-2',
      type: 'dialogue',
    };

    const script: Script = {
      rawText: 'مشهد 1\nسارة:\nمرحبا\nكيف حالك؟\n\nمشهد 2\nعمر:\nبخير والحمد لله.',
      totalLines: 8,
      scenes: [
        {
          id: 'scene-1',
          heading: 'مشهد 1',
          index: 0,
          startLineNumber: 1,
          endLineNumber: 4,
          lines: ['مشهد 1', 'سارة:', 'مرحبا', 'كيف حالك؟'],
          dialogues: [dialogueSara1, dialogueSara2],
          actionLines: [{ text: 'مشهد 1', lineNumber: 1 }],
        },
        {
          id: 'scene-2',
          heading: 'مشهد 2',
          index: 1,
          startLineNumber: 5,
          endLineNumber: 8,
          lines: ['مشهد 2', 'عمر:', 'بخير والحمد لله.'],
          dialogues: [dialogueOmar],
          actionLines: [],
        },
      ],
      characters: {
        'سارة': {
          name: 'سارة',
          dialogueCount: 2,
          dialogueLines: [dialogueSara1, dialogueSara2],
          firstSceneId: 'scene-1',
        },
        'عمر': {
          name: 'عمر',
          dialogueCount: 1,
          dialogueLines: [dialogueOmar],
          firstSceneId: 'scene-2',
        },
      },
      dialogueLines: [dialogueSara1, dialogueSara2, dialogueOmar],
    };

    const stubAssistant = new StubAIWritingAssistant();
    const service = new AnalysisService(stubAssistant);
    const result = await service.analyze(script);

    assert.equal(result.totalScenes, 2);
    assert.deepEqual(result.characterDialogueCounts, [
      { name: 'سارة', dialogueLines: 2 },
      { name: 'عمر', dialogueLines: 1 },
    ]);
    assert.ok(Math.abs(result.dialogueToActionRatio - 3) < 1e-6);
    assert.equal(result.synopsis, 'ملخص تجريبي');
    assert.equal(result.logline, 'Logline تجريبي');
    assert.equal(stubAssistant.calls.length, 2);
  });

  it('يُعيد رسائل افتراضية عندما لا يتوفر نص للتحليل', async () => {
    const emptyScript: Script = {
      rawText: '',
      totalLines: 0,
      scenes: [],
      characters: {},
      dialogueLines: [],
    };

    const stubAssistant = new StubAIWritingAssistant();
    const service = new AnalysisService(stubAssistant);
    const result = await service.analyze(emptyScript, '');

    assert.equal(result.synopsis, 'لم يتم توفير نص كافٍ لتحليل الذكاء الاصطناعي.');
    assert.equal(result.logline, 'لم يتم توفير نص كافٍ لتحليل الذكاء الاصطناعي.');
    assert.equal(result.dialogueToActionRatio, 0);
    assert.equal(stubAssistant.calls.length, 0);
  });
});
