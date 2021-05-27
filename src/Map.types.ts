export const tools = ['floor', 'north', 'east', 'south', 'west'] as const;
export type Tool = typeof tools[number];
export type Tile = {
  floor: string;
  north: string;
  east: string;
  south: string;
  west: string;
  faces: Tool[];
  x: number;
  y: number;
};
export type Row = Tile[];
export type MapViewMode = 'individual' | 'complete';
export interface Map {
  startTile: Tile;
  rows: Row[];
}