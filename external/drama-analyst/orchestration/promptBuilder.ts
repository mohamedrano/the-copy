import { AIRequest } from '../core/types';
import * as TaskInstructions from '../agents/taskInstructions';

export function buildPrompt(req: AIRequest): string {
  const base = TaskInstructions.getInstructionFor(req.agent);
  const filesHint = req.files?.map(f => `• ${f.fileName} (${f.sizeBytes} bytes)`).join('\n') ?? '';
  const paramsHint = req.params ? `\n[PARAMS]\n${JSON.stringify(req.params, null, 2)}` : '';
  return `${base}\n\n[USER PROMPT]\n${req.prompt}\n\n[FILES]\n${filesHint}${paramsHint}`;
}
