<template>
  <div class="viewport">
    <div class="tilt">
      <div
        class="player"
        :class="{ [`facing-${facing}`]: true, ['action-transition']: action, ['transition-' + action]: action }"
        :style="`transform: rotateZ(${angle}deg);`"
        @transitionend="onTransitionEnd()"
      >
        <div class="map">
          <div class="row" v-for="(row, r) in viewMap" :key="r">
            <div
              class="tile"
              v-for="(tile, c) in row"
              :key="`${r},${c}`"
            >
              <template v-for="face in tile.faces">
                <div
                  :key="`viewer_${r},${c},${face}`"
                  :class="`face ${face} texture__${tile[face]}`"
                ></div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { MapDefinition } from "@/types/Map.types";
import { Facing, Row } from "@/types/Map.types";
import { createEmptyTile } from "@/util";
import { IGameView, leftFrom, rightFrom } from "@/util/map-helper";
import { Component, Vue, Watch, Prop } from "vue-property-decorator";

type Action = 'turn-left' | 'turn-right' | 'go-forwards' | null;
const directions: Facing[] = ['north', 'east', 'south', 'west'];

@Component
export default class GameView extends Vue implements IGameView {
  @Prop() readonly map!: MapDefinition;
  @Prop() readonly x!: number;
  @Prop() readonly y!: number;
  @Prop() readonly facing!: Facing;
  
  action: Action = null;
  angle = 0;

  get rows(): Row[] {
    const { map } = this;
    const rows: Row[] = [];
    for (let y = 0; y < map.size.y; y++) {
      const row: Row = [];
      rows.push(row);
      for (let x = 0; x < map.size.x; x++) {
        const key = `${x}:${y}`;
        const tile = map.tiles[key] || createEmptyTile(x, y);
        row.push(tile);
      }
    }
    return rows;
  }

  get viewMap(): Row[] {
    const facing = this?.facing || 'north';
    const { action } = this;
    const rows = this.rows || [];
    // When moving we change these to only cull stuff afterwards
    let { x, y } = this;
    // when rotation, we want to know where we were looking before
    let wasFacing = facing;

    if (action === 'go-forwards') {
      if (facing === 'north') y++;
      if (facing === 'south') y--;
      if (facing === 'east') x--;
      if (facing === 'west') x++;
    } else if (action === 'turn-right') {
      wasFacing = rightFrom(facing);
    } else if (action === 'turn-left') {
      wasFacing = leftFrom(facing);
    }

    const playerTile = this.map.tiles[`${x}:${y}`];

    return rows.map((row) => {
      return row.map((tile) => {
        let shouldHide = true;
        const facedDirections = [wasFacing, facing];
        if (facedDirections.includes('north') && tile.y <= y) shouldHide = false;
        if (facedDirections.includes('south') && tile.y >= y) shouldHide = false;
        if (facedDirections.includes('east') && tile.x >= x) shouldHide = false;
        if (facedDirections.includes('west') && tile.x <= x) shouldHide = false;

        if (action !== 'go-forwards' && !shouldHide) {
          if ((tile.x === x || tile.y === y) && playerTile) {
            if (playerTile.north && tile.y < y && tile.south) tile = { ...tile, south: '' };
            if (playerTile.south && tile.y > y && tile.north) tile = { ...tile, north: '' };
            if (playerTile.west && tile.x < x && tile.east) tile = { ...tile, east: '' };
            if (playerTile.east && tile.x > x && tile.west) tile = { ...tile, west: '' };
          }
        }

        return shouldHide ? createEmptyTile(tile.x, tile.y) : tile;
      });
    });
  }

  mounted(): void {
    Object.assign(window, { gameview: this });
    this.updateCSSVariables();
  }

  getFacingForAngle(angle: number): Facing {
    const baseAngle = ((angle % 360) + 360) % 360;
    switch (baseAngle) {
      case 0: return 'north';
      case 90: return 'west';
      case 180: return 'south';
      case 270: return 'east';
    }
    return 'north';
  }

  @Watch('facing', { immediate: true })
  updateAngle(newFacing: Facing, oldFacing: Facing): void {
    const newIndex = directions.indexOf(newFacing);
    if (oldFacing) {
      const oldIndex = directions.indexOf(oldFacing);
      if (Math.abs(oldIndex - newIndex) === 1) {
        if (newIndex > oldIndex) {
          return this.turnLeft();
        } else {
          return this.turnRight();
        }
      } else {
        if (newFacing === 'north' && oldFacing === 'west') {
          return this.turnLeft();
        } else if (newFacing === 'west' && oldFacing === 'north') {
          return this.turnRight();
        }
      }
    }
    // Fallback just in case
    this.angle = 360 - (newIndex * 90);
  }

  turnLeft(): void {
    this.action = 'turn-left';
    this.angle -= 90;
  }

  turnRight(): void {
    this.action = 'turn-right';
    this.angle += 90;
  }

  @Watch('action')
  emitActionComplete(newAction: Action, oldAction: Action): void {
    if (newAction === null && oldAction) {
      this.$emit('actionComplete', oldAction);
    }
  }

  @Watch('x')
  @Watch('y')
  setForwardsAction(): void {
    this.action = 'go-forwards';
  }

  @Watch('x')
  @Watch('y')
  updateCSSVariables(): void {
    if (!this.$el) return;
    (this.$el as HTMLElement).style.setProperty('--viewportXOffset', this.x.toString());
    (this.$el as HTMLElement).style.setProperty('--viewportYOffset', this.y.toString());
  }

  onTransitionEnd(): void {
    this.action = null;
  }
}
</script>

<style lang="scss" scoped>
@import '../../faces';

.viewport {
  overflow: hidden;
  width: var(--viewportSize);
  height: var(--viewportSize);
  outline: solid #000 1px;
  outline-offset: -1px;
  perspective: calc(1.5 * var(--viewportSize));

  &, & * {
    transform-style: preserve-3d;
  }
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
    top: calc(-1 * (var(--viewportYOffset) - 0.8) * var(--viewportSize));
  }
}
.player.facing-east {
  transform: rotateZ(270deg);
  .map {
    left: calc(-1 * (var(--viewportXOffset) + 0.8) * var(--viewportSize));
  }
}
.player.facing-south {
  transform: rotateZ(180deg);
  .map {
    top: calc(-1 * (var(--viewportYOffset) + 0.8) * var(--viewportSize));
  }
}
.player.facing-west {
  transform: rotateZ(90deg);
  .map {
    left: calc(-1 * (var(--viewportXOffset) - 0.8) * var(--viewportSize));
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
  transform: rotateX(90deg);
  transform-origin: bottom;
}


.row {
  display: flex;
}

.tile {
  width: var(--viewportSize);
  height: var(--viewportSize);
  min-width: var(--viewportSize);
  min-height: var(--viewportSize);
  max-width: var(--viewportSize);
  max-height: var(--viewportSize);
  position: relative;

  .face {
    backface-visibility: hidden;
  }
}
</style>