import { describe, expect, it } from 'vitest';
import { computeStationProgress, type StationDefinition } from '../station-progress-utils';

const makeStation = (overrides: Partial<StationDefinition>): StationDefinition => ({
  id: overrides.id ?? 1,
  nameAr: overrides.nameAr ?? 'محطة',
  nameEn: overrides.nameEn ?? 'Station',
  status: overrides.status ?? 'pending'
});

describe('computeStationProgress', () => {
  it('returns pending summary when no stations are provided', () => {
    const result = computeStationProgress([]);

    expect(result).toEqual({
      currentStation: null,
      nextStation: null,
      phase: 'pending',
      allCompleted: false
    });
  });

  it('identifies the active station and its successor', () => {
    const stations: StationDefinition[] = [
      makeStation({ id: 1, status: 'completed' }),
      makeStation({ id: 2, status: 'active' }),
      makeStation({ id: 3, status: 'pending' })
    ];

    const result = computeStationProgress(stations);

    expect(result.currentStation?.id).toBe(2);
    expect(result.nextStation?.id).toBe(3);
    expect(result.phase).toBe('active');
    expect(result.allCompleted).toBe(false);
  });

  it('handles sequences where processing has not started', () => {
    const stations: StationDefinition[] = [
      makeStation({ id: 1, status: 'pending' }),
      makeStation({ id: 2, status: 'pending' })
    ];

    const result = computeStationProgress(stations);

    expect(result.currentStation?.id).toBe(1);
    expect(result.phase).toBe('pending');
    expect(result.nextStation?.id).toBe(1);
    expect(result.allCompleted).toBe(false);
  });

  it('reports completion when every station is finished', () => {
    const stations: StationDefinition[] = [
      makeStation({ id: 1, status: 'completed' }),
      makeStation({ id: 2, status: 'completed' })
    ];

    const result = computeStationProgress(stations);

    expect(result.currentStation?.id).toBe(2);
    expect(result.phase).toBe('completed');
    expect(result.nextStation).toBeNull();
    expect(result.allCompleted).toBe(true);
  });

  it('points to the last completed station when waiting to resume', () => {
    const stations: StationDefinition[] = [
      makeStation({ id: 1, status: 'completed' }),
      makeStation({ id: 2, status: 'completed' }),
      makeStation({ id: 3, status: 'pending' })
    ];

    const result = computeStationProgress(stations);

    expect(result.currentStation?.id).toBe(2);
    expect(result.phase).toBe('completed');
    expect(result.nextStation?.id).toBe(3);
    expect(result.allCompleted).toBe(false);
  });
});
