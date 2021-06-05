import { Texture } from "@/Texture.types";

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

export type Facing = 'north' | 'east' | 'south' | 'west';

export interface Pos {
  x: number;
  y: number;
}

export type Size = Pos;

export interface StartPos extends Pos {
  direction: Facing;
}

export interface ProjectDefintion {
  name: string;
  maps: MapDefinition[];
  textures: Texture[];
}

export interface MapDefinition {
  name: string;
  size: Size;
  start: StartPos;
  tiles: { [pos: string]: Tile };
}