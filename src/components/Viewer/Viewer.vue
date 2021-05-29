<template>
  <div class="viewer" v-if="show">
    <div class="viewport">
      <div class="tilt">
        <div class="player" :class="`facing-${facing}`" :style="`transform: rotateZ(${angle}deg);`">
          <div class="map">
            <div class="row" v-for="(row, r) in viewMap" :key="r">
              <div
                class="tile"
                v-for="(tile, c) in row"
                :key="`${r},${c}`"
              >
                <template v-for="face in tile.faces">
                  <transition name="hide" :key="`viewer_transition_${r},${c},${face}`">
                    <div
                      v-if="!tile.hide && tile.fade !== face"
                      :key="`viewer_${r},${c},${face}`"
                      :class="`face ${face} texture__${tile[face]}`"
                    ></div>
                  </transition>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="controls">
      <button class="turn-left" @click="rotateLeft()"></button>
      <button class="go-forwards" @click="goForwards()" :disabled="!canMoveForwards"></button>
      <button class="turn-right" @click="rotateRight()"></button>
    </div>
  </div>
</template>

<script lang="ts">
import { Map, Tile } from "@/Map.types";
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

type Facing = 'north' | 'east' | 'south' | 'west';

interface TileWithFade extends Tile {
  fade?: Facing;
  hide?: boolean;
}

type RowWithFade = TileWithFade[];

@Component
export default class Sidebar extends Vue {
  @Prop() map!: Map;
  @Prop() show!: boolean;
  angle = 0;
  x = 0;
  y = 0;

  get facing(): Facing {
    const baseAngle = ((this.angle % 360) + 360) % 360;
    switch (baseAngle) {
      case 0: return 'north';
      case 90: return 'west';
      case 180: return 'south';
      case 270: return 'east';
    }
    return 'north';
  }

  get viewMap(): RowWithFade[] {
    const facing = this?.facing || 'north';
    const rows = this.map?.rows || [];
    const { x, y } = this;

    return rows.map((row) => {
      return row.map((tile) => {
        switch (facing) {
          case 'north':
            if (tile.y > y) return { ...tile, hide: true };
            else if (tile.y === y) return { ...tile, fade: 'south' };
            else return { ...tile };
          case 'east':
            if (tile.x < x) return { ...tile, hide: true };
            else if (tile.x === x) return { ...tile, fade: 'west' };
            else return { ...tile };
          case 'south':
            if (tile.y < y) return { ...tile, hide: true };
            else if (tile.y === y) return { ...tile, fade: 'north' };
            else return { ...tile };
          case 'west':
            if (tile.x > x) return { ...tile, hide: true };
            else if (tile.x === x) return { ...tile, fade: 'east' };
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

  get canMoveForwards(): boolean {
    const facing = this?.facing || 'north';
    const rows = this.map?.rows || [];
    const { x, y } = this;
    const tile = rows[y][x];
    return !tile[facing];
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

  @Watch('viewXOffset')
  @Watch('viewYOffset')
  updateCSSVariables(): void {
    if (!this.$el) return;
    (this.$el as HTMLElement).style.setProperty('--viewportXOffset', this.viewXOffset.toString());
    (this.$el as HTMLElement).style.setProperty('--viewportYOffset', this.viewYOffset.toString());
  }

  rotateRight(): void {
    this.angle -= 90;
  }

  rotateLeft(): void {
    this.angle += 90;
  }

  goForwards(): void {
    switch(this.facing) {
      case 'north':
        this.y--;
        break;
      case 'east':
        this.x++;
        break;
      case 'south':
        this.y++;
        break;
      case 'west':
        this.x--;
        break;
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../faces';

.viewer {
  --viewportSize: 800px;
  position: fixed;
  display: flex;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(1.5 * var(--viewportSize));
  gap: 10px;
}

.viewport {
  overflow: hidden;
  width: 800px;
  height: 800px;
  outline: solid #000 1px;
  outline-offset: -1px;
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
  transform: rotateZ(270deg);
  .map {
    left: calc(-1 * (var(--viewportXOffset) + 0.5) * var(--viewportSize));
  }
}
.player.facing-south {
  transform: rotateZ(180deg);
  .map {
    top: calc(-1 * (var(--viewportYOffset) + 0.5) * var(--viewportSize));
  }
}
.player.facing-west {
  transform: rotateZ(90deg);
  .map {
    left: calc(-1 * (var(--viewportXOffset) - 0.5) * var(--viewportSize));
  }
}

.player, .tilt {
  width: var(--viewportSize);
  height: var(--viewportSize);
  transform-style: preserve-3d;
}

.player {
  transition: transform ease-in-out .5s;
  transform-style: preserve-3d;
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

  .face {
    // transition: opacity .5s ease-in-out;
  }
}

.controls {
  display: flex;
  width: fit-content;
  gap: 10px;

  > button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    overflow: hidden;
    cursor: pointer;
    border-radius: 5px;;
    border: 0;
    background: #999;

    &:hover {
      background-color: #CCC;
    }

    &:disabled {
      opacity: .5;
      pointer-events: none;
    }

    &::before,
    &::after {
        content: '';
        position: absolute;
        display: block;
    }

    &.turn-left {
      &::before {
        width: 125%;
        height: 125%;
        border: solid #000 6px;
        border-radius: 50%;
        top: 20%;
        left: -50%;
        clip-path: polygon(50% 0%, 100% 0%, 100% 50%, 50% 50%);
      }

      &::after {
        left: 10px;
        top: 9px;
        width: 20px;
        height: 30px;
        background-color: #000;
        clip-path: polygon(0% 50%, 100% 0%, 100% 100%);
      }
    }

    &.turn-right {
      &::before {
        width: 125%;
        height: 125%;
        border: solid #000 6px;
        border-radius: 50%;
        top: 20%;
        right: -50%;
        clip-path: polygon(50% 0%, 0% 0%, 0% 50%, 50% 50%);
      }

      &::after {
        right: 10px;
        top: 9px;
        width: 20px;
        height: 30px;
        background-color: #000;
        clip-path: polygon(0% 0%, 100% 50%, 0% 100%);
      }
    }

    &.go-forwards {
      &::before {
        left: 50%;
        width: 6px;
        top: 15%;
        bottom: 10%;
        margin-left: -3px;
        background-color: #000;
      }
      &::after {
        height: 20px;
        background-color: #000;
        left: 30%;
        right: 30%;
        top: 10%;
        transform-origin: top left;
        clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
      }
    }
  }
}

.hide-enter-active, .hide-leave-active {
  transition: opacity .5s;
}
.hide-enter, .hide-leave-to {
  opacity: 0;
}
</style>