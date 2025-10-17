export type StationStatus = 'completed' | 'active' | 'pending';

export interface StationDefinition {
  id: number;
  nameAr: string;
  nameEn: string;
  status: StationStatus;
}

export interface StationProgressComputation {
  currentStation: StationDefinition | null;
  nextStation: StationDefinition | null;
  phase: StationStatus;
  allCompleted: boolean;
}

function findNextStationAfter(
  stations: StationDefinition[],
  index: number
): StationDefinition | null {
  for (let i = index + 1; i < stations.length; i += 1) {
    const station = stations[i];
    if (station && station.status !== 'completed') {
      return station;
    }
  }
  return null;
}

export function computeStationProgress(
  stations: StationDefinition[]
): StationProgressComputation {
  if (stations.length === 0) {
    return {
      currentStation: null,
      nextStation: null,
      phase: 'pending',
      allCompleted: false
    };
  }

  const allCompleted = stations.every((station) => station.status === 'completed');
  const activeIndex = stations.findIndex((station) => station.status === 'active');

  if (activeIndex >= 0) {
    const currentStation = stations[activeIndex];
    return {
      currentStation: currentStation || null,
      nextStation: findNextStationAfter(stations, activeIndex),
      phase: 'active',
      allCompleted
    };
  }

  if (allCompleted) {
    const lastStation = stations[stations.length - 1];
    return {
      currentStation: lastStation || null,
      nextStation: null,
      phase: 'completed',
      allCompleted: true
    };
  }

  const nextPending = stations.find((station) => station.status === 'pending') ?? null;
  const lastCompleted = [...stations]
    .reverse()
    .find((station) => station.status === 'completed') ?? null;

  if (lastCompleted) {
    return {
      currentStation: lastCompleted,
      nextStation: nextPending,
      phase: 'completed',
      allCompleted: false
    };
  }

  return {
    currentStation: (nextPending ?? stations[0]) || null,
    nextStation: nextPending,
    phase: 'pending',
    allCompleted: false
  };
}
