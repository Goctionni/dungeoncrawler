import { MapDefinition } from "@/types/Map.types";

export const DEFAULT_MAP_FACTORY: () => MapDefinition = () => ({
    name: '',
    size: { x: 7, y: 7 },
    start: { x: 3, y: 3, facing: 'north' },
    tiles: {},
});