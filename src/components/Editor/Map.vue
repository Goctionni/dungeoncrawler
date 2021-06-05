<template>
  <div class="container">
    <div class="map" :class="mapViewMode">
      <div class="row" v-for="(row, r) in rowsWithHover" :key="r">
        <div
          class="tile"
          :class="{ ['tile--start']: isStartTile(tile) }"
          v-for="(tile, c) in row"
          :key="`${r},${c}`"
          @click="updateTile(tile)"
          @mouseenter="mouseEnter(tile)"
          @mouseleave="mouseLeave(tile)"
          @dblclick="setStart(tile)"
        >
          <div v-for="face in tile.faces" :key="`${r},${c},${face}`" :class="`face ${face} texture__${tile[face]}`"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Row, Tile, Tool, MapViewMode } from '@/types/Map.types';
import { Component, Prop, Vue } from 'vue-property-decorator';

type KeypressHandler = (e: KeyboardEvent) => void;

@Component
export default class Map extends Vue {
  @Prop() rows!: Row[];
  @Prop() activeTool!: Tool;
  @Prop() activeTexture!: string;
  @Prop() mapViewMode!: MapViewMode;
  @Prop() startTile!: Tile | null;
  hover: Tile | null = null;
  keydownHandler: KeypressHandler | null = null;

  get rowsWithHover(): Row[] {
    const { rows, hover, activeTool, activeTexture } = this;
    return rows.map((row) => {
      return row.map((tile) => {
        const tileWithHover = { ...tile }
        if (hover && hover.x === tile.x && hover.y === tile.y) {
          tileWithHover[activeTool] = activeTexture;
          tileWithHover.faces = [activeTool, ...tileWithHover.faces.filter((face) => face !== activeTool)];
        }
        return tileWithHover;
      });
    });
  }

  isStartTile(tile: Tile): boolean {
    if (this.startTile?.x !== tile.x) return false;
    if (this.startTile?.y !== tile.y) return false;
    return true;
  }

  mouseEnter(tile: Tile): void {
    this.hover = tile;
  }

  mouseLeave(tile: Tile): void {
    if (this.hover?.x === tile.x && this.hover?.y === tile.y) {
      this.hover = null;
    }
  }

  updateTile(tile: Tile, tool?: Tool): void {
    if (!tool) tool = this.activeTool;
    this.$emit('updateTile', { tile, tool });
  }

  setStart(tile: Tile): void {
    this.$emit('setStart', tile);
  }

  created(): void {
    // create handler
    this.keydownHandler = (function(this: Map, e: KeyboardEvent) {
      if (!this.hover) return;
      if (e.key === 'w') this.updateTile(this.hover, 'north');
      if (e.key === 'a') this.updateTile(this.hover, 'west');
      if (e.key === 's') this.updateTile(this.hover, 'south');
      if (e.key === 'd') this.updateTile(this.hover, 'east');
      if (e.key === 'f') this.updateTile(this.hover, 'floor');
      e.preventDefault();
    }).bind(this);
    // Bind
    window.addEventListener('keypress', this.keydownHandler);
  }

  beforeDestroy(): void {
    if (this.keydownHandler) window.removeEventListener('keypress', this.keydownHandler);
  }
}
</script>

<style lang="scss" scoped>
@import '../../faces';

.container {
  overflow: hidden;
}

.map {
  display: flex;
  flex-direction: column;
  --tileSize: 100px;

  &.individual .tile {
    --tileSize: 85px;
    margin: calc((100px - var(--tileSize)) / 2);
    transform-style: preserve-3d;
    transform: perspective(500px);
  }

  &.complete {
    transform-style: preserve-3d;
    transform: perspective(1000px);
    padding: var(--tileSize);
  }
}

.row {
  display: flex;
}

.tile {
  border: solid #000 1px;
  width: var(--tileSize);
  height: var(--tileSize);
  position: relative;

  &:hover::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    outline: solid #000 2px;
    outline-offset: 2px;
    z-index: 1;
  }

  &--start::after {
    --text-outline: rgba(255, 255, 255, 1);
    content: 'Start';
    font-weight: bold;
    font-size: 20px;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    box-shadow: 0px 0px 15px 5px #FC0;
    text-shadow: -1px -1px 0 var(--text-outline),
        0   -1px 0 var(--text-outline),
        1px -1px 0 var(--text-outline),
        1px  0   0 var(--text-outline),
        1px  1px 0 var(--text-outline),
        0    1px 0 var(--text-outline),
        -1px  1px 0 var(--text-outline),
        -1px  0   0 var(--text-outline);    
  }
}
</style>