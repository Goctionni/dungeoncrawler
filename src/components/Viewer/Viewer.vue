<template>
  <div class="viewer" v-if="show">
    <div class="viewport">
      <div class="map">
        <div class="scene">
          <div class="row" v-for="(row, r) in viewMap" :key="r">
            <div
              class="tile"
              v-for="(tile, c) in row"
              :key="`${r},${c}`"
            >
              <div v-for="face in tile.faces" :key="`viewer_${r},${c},${face}`" :class="`face ${face} ${tile[face]}`"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Map, Row } from "@/Map.types";
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

type Facing = 'north' | 'east' | 'south' | 'west';

@Component
export default class Sidebar extends Vue {
  @Prop() map!: Map;
  @Prop() show!: boolean;
  facing: Facing = 'north';
  x = 0;
  y = 0;

  get viewMap(): Row[] {
    return this.createViewMap().map((row, index, arr) => {
      if (index !== arr.length - 1) {
        return row;
      } else {
        return row.map((tile) => ({
          ...tile,
          south: '',
        }));
      }
    });
  }

  get viewXOffset(): number {
    const { rows } = this.map;
    const { x, y } = this;

    switch (this.facing) {
      case 'north':
        return x;
      case 'south':
        return rows[0].length - x;
      case 'east':
        return y;
      case 'west':
        return rows.length - y;
      default:
        return 0;
    }
  }

  get viewYOffset(): number {
    const { viewMap } = this;
    return viewMap.length ? viewMap.length - 1 : 0;
  }

  mounted(): void {
    this.updateCSSVariables();
    Object.assign(window, { viewer: this });
  }

  @Watch('map.startTile', { immediate: true, deep: true })
  initStartingPosition(): void {
    const { startTile } = this.map;
    this.x = startTile.x;
    this.y = startTile.y;
  }

  createViewMap(): Row[] {
    const { facing } = this;
    const { startTile, rows } = this.map;
    if (!startTile) return [];

    // TODO: I also need to rotate all the north east south west textures, when not facing north
    switch(facing) {
      case 'north':
        return rows.slice(0, this.y + 1);
      case 'south':
        return rows.slice(this.y).reverse().map((row) => row.slice().reverse());
      case 'east':
        {
          const rotated: Row[] = [];
          const oldW = rows[0].length;
          const oldH = rows.length;
          for (let y = 0; y < oldW; y++) {
            const rotatedRow: Row = [];
            for (let x = 0; x < oldH; x++) {
              let oldY = x;
              let oldX = oldH - y;
              rotatedRow.push({
                ...rows[oldY][oldX],
              })
            }
            rotated.push(rotatedRow);
          }
          return rotated.slice(0, this.x + 1);
        }
      case 'west':
        {
          const rotated: Row[] = [];
          const oldW = rows[0].length;
          const oldH = rows.length;
          for (let y = 0; y < oldW; y++) {
            const rotatedRow: Row = [];
            for (let x = 0; x < oldH; x++) {
              let oldY = oldW - x;
              let oldX = y;
              rotatedRow.push({
                ...rows[oldY][oldX],
              })
            }
            rotated.push(rotatedRow);
          }
          return rotated.slice(0, oldW - this.x);
        }
      default:
        return [];
    }
  }

  @Watch('viewXOffset')
  @Watch('viewYOffset')
  updateCSSVariables(): void {
    if (!this.$el) return;
    (this.$el as HTMLElement).style.setProperty('--viewportXOffset', this.viewXOffset.toString());
    (this.$el as HTMLElement).style.setProperty('--viewportYOffset', this.viewYOffset.toString());
  }
}
</script>

<style lang="scss" scoped>
@import '../../faces';

.viewport {
  --viewportSize: 800px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  overflow: hidden;
  width: 800px;
  height: 800px;
  outline: solid #000 1px;
  transform-style: preserve-3d;
  perspective: calc(1.5 * var(--viewportSize));
}

.map {
  
  transform-origin: bottom;
}

.scene {
  position: absolute;
  left: calc(-1 * var(--viewportXOffset) * var(--viewportSize));
  top: calc(-1 * var(--viewportYOffset) * var(--viewportSize));
  transform-style: preserve-3d;
  transform: rotateX(90deg);
  transform-origin: bottom;
}

.row {
  display: flex;
}

.tile {
  border: solid #000 1px;
  width: var(--viewportSize);
  height: var(--viewportSize);
  min-width: var(--viewportSize);
  min-height: var(--viewportSize);
  max-width: var(--viewportSize);
  max-height: var(--viewportSize);
  position: relative;
}
</style>