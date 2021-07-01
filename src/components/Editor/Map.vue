<template>
  <div class="container" :style="{ '--numRows': rows.length, '--numCols': rows[0].length }">
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
import { Row, Tile, Face, MapViewMode } from '@/types/Map.types';
import { Component, Prop, Vue } from 'vue-property-decorator';

type KeypressHandler = (e: KeyboardEvent) => void;

@Component
export default class Map extends Vue {
  @Prop() rows!: Row[];
  @Prop() activeTool!: Face;
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

  updateTile(tile: Tile, tool?: Face, clear?: boolean): void {
    if (!tool) tool = this.activeTool;
    this.$emit('updateTile', { tile, tool, clear });
  }

  setStart(tile: Tile): void {
    this.$emit('setStart', {
      x: tile.x,
      y: tile.y,
      facing: 'north',
    });
  }

  created(): void {
    // create handler
    this.keydownHandler = (function(this: Map, e: KeyboardEvent) {
      if (!this.hover) return;
      if (e.key === 'W') this.updateTile(this.hover, 'north', true);
      if (e.key === 'A') this.updateTile(this.hover, 'west', true);
      if (e.key === 'S') this.updateTile(this.hover, 'south', true);
      if (e.key === 'D') this.updateTile(this.hover, 'east', true);
      if (e.key === 'F') this.updateTile(this.hover, 'floor', true);
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
  height: fit-content;
  width: fit-content;
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
  // These 157 and 525 are magic numbers. :(
  --vMargin: max(10px, calc((100vh - 157px - (var(--numRows) * 100px)) / 2));
  --hMargin: max(10px, calc((100vw - 525px - (var(--numCols) * 100px)) / 2));
  padding: var(--vMargin) var(--hMargin);
  background-color: #333;
}

.map {
  --tileSize: 100px;

  &.individual .tile {
    margin: calc((var(--tileSize) - 85px) / 2);
    width: 85px;
    height: 85px;
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
  white-space: nowrap;
  height: var(--tileSize);
}

.tile {
  display: inline-block;
  border: solid #FFF 1px;
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