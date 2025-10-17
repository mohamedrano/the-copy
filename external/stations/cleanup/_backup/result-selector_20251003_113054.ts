import { GeminiModel, GeminiResponse } from './gemini-service';

export interface SelectionCriteria {
  preferredModels: GeminiModel[];
  validationFunction?: (result: any) => boolean;
  scoreFunction?: (result: any) => number;
}

export class AIResultSelector {
  selectBest<T>(
    results: Map<GeminiModel, GeminiResponse<T>>,
    criteria: SelectionCriteria
  ): GeminiResponse<T> | null {
    const validResults = this.filterValid(results, criteria);

    if (validResults.size === 0) {
      return null;
    }

    for (const model of criteria.preferredModels) {
      if (validResults.has(model)) {
        return validResults.get(model)!;
      }
    }

    if (criteria.scoreFunction) {
      return this.selectByScore(validResults, criteria.scoreFunction);
    }

    return Array.from(validResults.values())[0];
  }

  private filterValid<T>(
    results: Map<GeminiModel, GeminiResponse<T>>,
    criteria: SelectionCriteria
  ): Map<GeminiModel, GeminiResponse<T>> {
    const filtered = new Map<GeminiModel, GeminiResponse<T>>();

    for (const [model, response] of Array.from(results.entries())) {
      if (!criteria.validationFunction || 
          criteria.validationFunction(response.content)) {
        filtered.set(model, response);
      }
    }

    return filtered;
  }

  private selectByScore<T>(
    results: Map<GeminiModel, GeminiResponse<T>>,
    scoreFunction: (result: any) => number
  ): GeminiResponse<T> {
    let bestScore = -Infinity;
    let bestResult: GeminiResponse<T> | null = null;

    for (const response of Array.from(results.values())) {
      const score = scoreFunction(response.content);
      if (score > bestScore) {
        bestScore = score;
        bestResult = response;
      }
    }

    return bestResult!;
  }
}
