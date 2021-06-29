import { Texture } from "@/types/Texture.types";

export const faces = ['floor', 'north', 'east', 'south', 'west'] as const;
export type Face = typeof faces[number];
export type Tile = {
  floor: string;
  north: string;
  east: string;
  south: string;
  west: string;
  faces: Face[];
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

export interface FacingPos extends Pos {
  facing: Facing;
}

export interface FacePos extends Pos {
  facing: Face;
}

export interface ProjectDefintion {
  guid: string;
  name: string;
  maps: MapDefinition[];
  textures: Texture[];
  hasUnsavedChanges: boolean;
}

export interface MapDefinition {
  name: string;
  size: Size;
  start: FacingPos;
  tiles: { [pos: string]: Tile };
}