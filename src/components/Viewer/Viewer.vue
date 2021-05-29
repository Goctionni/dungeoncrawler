<template>
  <div class="viewer" v-if="show">
    <div class="viewport">
      <div class="tilt">
        <div class="player" :class="`facing-${facing}`">
          <div class="map">
            <div class="row" v-for="(row, r) in viewMap" :key="r">
              <div
                class="tile"
                v-for="(tile, c) in row"
                :key="`${r},${c}`"
              >
                <div v-for="face in tile.faces" :key="`viewer_${r},${c},${face}`" :class="`face ${face} texture__${tile[face]}`"></div>
              </div>
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
import { createEmptyTile } from '@/util';

type Facing = 'north' | 'east' | 'south' | 'west';

@Component
export default class Sidebar extends Vue {
  @Prop() map!: Map;
  @Prop() show!: boolean;
  facing: Facing = 'north';
  x = 0;
  y = 0;

  get viewMap(): Row[] {
    const facing = this?.facing || 'north';
    const rows = this.map?.rows || [];
    const { x, y } = this;

    return rows.map((row) => {
      return row.map((tile) => {
        switch (facing) {
          case 'north':
            if (tile.y > y) return createEmptyTile(tile.x, tile.y);
            else if (tile.y === y) return { ...tile, south: '' };
            else return { ...tile };
          case 'east':
            if (tile.x > x) return createEmptyTile(tile.x, tile.y);
            else if (tile.x === x) return { ...tile, west: '' };
            else return { ...tile };
          case 'south':
            if (tile.y < y) return createEmptyTile(tile.x, tile.y);
            else if (tile.y === y) return { ...tile, north: '' };
            else return { ...tile };
          case 'west':
            if (tile.x < x) return createEmptyTile(tile.x, tile.y);
            else if (tile.x === x) return { ...tile, east: '' };
            else return { ...tile };
          default:
            return { ...tile };
        }
      });
    });
  }

  get viewXOffset(): number {
    return this.x;
  }

  get viewYOffset(): number {
    return this.y;
  }

  mounted(): void {
    this.updateCSSVariables();
    Object.assign(window, { viewer: this });
    setInterval(() => {
      this.rotateCW();
    }, 3000);
  }

  @Watch('map.startTile', { immediate: true, deep: true })
  initStartingPosition(): void {
    const { startTile } = this.map;
    this.x = startTile.x;
    this.y = startTile.y;
  }

  @Watch('viewXOffset')
  @Watch('viewYOffset')
  updateCSSVariables(): void {
    if (!this.$el) return;
    (this.$el as HTMLElement).style.setProperty('--viewportXOffset', this.viewXOffset.toString());
    (this.$el as HTMLElement).style.setProperty('--viewportYOffset', this.viewYOffset.toString());
  }

  rotateCW(): void {
    switch(this.facing) {
      case 'north':
        this.facing = 'east';
        break;
      case 'east':
        this.facing = 'south';
        break;
      case 'south':
        this.facing = 'west';
        break;
      case 'west':
        this.facing = 'north';
        break;
    }
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
  position: absolute;
  left: calc(-1 * var(--viewportXOffset) * var(--viewportSize));
  top: calc(-1 * var(--viewportYOffset) * var(--viewportSize));
  transition: left ease-in-out .5s, top ease-in-out .5s;
}

.player.facing-north {
  transform: rotateZ(0deg);
  .map {
    top: calc(-1 * (var(--viewportYOffset) - 0.5) * var(--viewportSize));
  }
}
.player.facing-east {
  transform: rotateZ(90deg);
  .map {
    left: calc(-1 * (var(--viewportXOffset) - 0.5) * var(--viewportSize));
  }
}
.player.facing-south {
  transform: rotateZ(180deg);
  .map {
    top: calc(-1 * (var(--viewportYOffset) + 0.5) * var(--viewportSize));
  }
}
.player.facing-west {
  transform: rotateZ(270deg);
  .map {
    left: calc(-1 * (var(--viewportXOffset) + 0.5) * var(--viewportSize));
  }
}

.player, .tilt {
  width: var(--viewportSize);
  height: var(--viewportSize);
}

.player {
  transition: transform ease-in-out .5s;
}

.tilt {
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