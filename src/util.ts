import { Tile } from "@/types/Map.types";

export const createEmptyTile = (x: number, y: number): Tile => {
    return {
      x,
      y,
      floor: '',
      north: '',
      east: '',
      south: '',
      west: '',
      faces: [],
    }
  };
  