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
  
export const Timeout = (delay = 0): Promise<void> => {
  return new Promise((resolve) => window.setTimeout(resolve, delay));
};
