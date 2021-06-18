import { Facing, MapDefinition, Pos } from "@/types/Map.types";

export const canMoveForwards = (map: MapDefinition, x: number, y: number, facing: Facing): boolean => {
    const tiles = map.tiles;
    const key = `${x}:${y}`;
    const tile = tiles[key] || {};
    return !tile[facing];
}

export const rightFrom = (facing: Facing): Facing => {
  switch(facing) {
    case 'north':
      return 'east';
    case 'east':
      return 'south';
    case 'south':
      return 'west';
    case 'west':
      return 'north';
  }
}

export const leftFrom = (facing: Facing): Facing => {
  switch(facing) {
    case 'north':
      return 'west';
    case 'east':
      return 'north';
    case 'south':
      return 'east';
    case 'west':
      return 'south';
  }
}


export const goTowards = (facing: Facing): Pos => {
  switch(facing) {
    case 'north':
      return { x: 0, y: -1 };
    case 'east':
      return { x: 1, y: 0 };
    case 'south':
      return { x: 0, y: 1 };
    case 'west':
      return { x: -1, y: 0 };
  }
}