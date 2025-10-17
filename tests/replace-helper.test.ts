import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { applyRegexReplacementToTextNodes } from '../src/components/editor/textReplacement.js';

type StubNode = {
  nodeType: number;
  nodeValue?: string;
  textContent?: string;
  childNodes?: StubNode[];
};

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

const createTextNode = (text: string): StubNode => ({
  nodeType: TEXT_NODE,
  nodeValue: text,
});

const createElementNode = (children: StubNode[] = []): StubNode => ({
  nodeType: ELEMENT_NODE,
  childNodes: children,
});

const collectTextNodes = (node: StubNode): string[] => {
  if (node.nodeType === TEXT_NODE) {
    return [node.nodeValue ?? node.textContent ?? ''];
  }

  return (node.childNodes ?? []).flatMap(collectTextNodes);
};

describe('applyRegexReplacementToTextNodes', () => {
  it('preserves screenplay block structure while replacing text occurrences', () => {
    const root = createElementNode([
      createElementNode([createTextNode('بسم الله الرحمن الرحيم')]),
      createElementNode([createTextNode('مشهد 1')]),
      createElementNode([createTextNode('مرحبا بك في المشهد'), createTextNode('مرحبا مجدداً')]),
    ]);

    const originalChildCount = root.childNodes?.length ?? 0;

    const replacements = applyRegexReplacementToTextNodes(
      root as unknown as HTMLElement,
      'مرحبا',
      'gi',
      'أهلاً',
      true
    );

    assert.equal(replacements, 2, 'should report both replacements');
    assert.equal(root.childNodes?.length ?? 0, originalChildCount, 'should retain block elements');

    const textContents = collectTextNodes(root);
    assert.deepEqual(textContents, [
      'بسم الله الرحمن الرحيم',
      'مشهد 1',
      'أهلاً بك في المشهد',
      'أهلاً مجدداً',
    ]);
  });

  it('honours replaceAll=false by updating only the first occurrence', () => {
    const root = createElementNode([
      createElementNode([createTextNode('الاسم'), createTextNode('OLD NAME')]),
      createElementNode([createTextNode('OLD NAME')]),
    ]);

    const replacements = applyRegexReplacementToTextNodes(
      root as unknown as HTMLElement,
      'OLD NAME',
      'g',
      'NEW NAME',
      false
    );

    assert.equal(replacements, 1, 'should stop after first replacement');

    const textContents = collectTextNodes(root);
    assert.deepEqual(textContents, ['الاسم', 'NEW NAME', 'OLD NAME']);
  });

  it('supports anchored rename patterns used for character headings', () => {
    const root = createElementNode([
      createElementNode([createTextNode('  سارة  ')]),
      createElementNode([createTextNode('سارة: تقول شيئاً')]),
    ]);

    const replacements = applyRegexReplacementToTextNodes(
      root as unknown as HTMLElement,
      '^\\s*سارة\\s*$',
      'gmi',
      'لينا',
      true
    );

    assert.equal(replacements, 1, 'should only rename standalone headings');

    const textContents = collectTextNodes(root);
    assert.deepEqual(textContents, ['لينا', 'سارة: تقول شيئاً']);
  });
});
