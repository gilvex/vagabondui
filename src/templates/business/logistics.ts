export const sortingLanes = [
  { id: 'A1', destination: 'Central Station', label: 'A1 — Central Station', capacity: 20 },
  { id: 'B2', destination: 'East Harbor', label: 'B2 — East Harbor', capacity: 20 },
  { id: 'C3', destination: 'Northgate', label: 'C3 — Northgate', capacity: 20 },
] as const
export const pickupLocations = sortingLanes.map((lane) => lane.destination)
export const sortLanes = sortingLanes.map((lane) => lane.label)
export const storageShelves = ['A-01', 'A-02', 'A-03', 'B-01', 'B-02', 'C-01'] as const
