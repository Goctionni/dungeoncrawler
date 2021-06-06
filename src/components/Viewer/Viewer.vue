<template>
  <div class="viewer">
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
    <div class="controls">
      <button class="turn-left" @click="rotateLeft()"></button>
      <button class="go-forwards" @click="goForwards()" :disabled="!canMoveForwards"></button>
      <button class="turn-right" @click="rotateRight()"></button>
    </div>
  </div>
</template>

<script lang="ts">
import { MapDefinition, ProjectDefintion } from "@/types/Map.types";
import { Facing, Row } from "@/types/Map.types";
import { createEmptyTile } from "@/util";
import { Component, Vue, Watch, InjectReactive } from "vue-property-decorator";

type Action = 'turn-left' | 'turn-right' | 'go-forwards' | null;

@Component
export default class Sidebar extends Vue {
  @InjectReactive() project!: ProjectDefintion;
  @InjectReactive() selectedMap!: string;

  get map(): MapDefinition {
    const { project, selectedMap } = this;
    return project.maps.find((map) => map.name === selectedMap) || project.maps[0];
  }

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

  action: Action = null;
  angle = 0;
  x = 0;
  y = 0;

  get facing(): Facing {
    return this.getFacingForAngle(this.angle);
  }

  get viewMap(): Row[] {
    const facing = this?.facing || 'north';
    const rows = this.rows || [];
    // When moving we change these to only cull stuff afterwards
    let { x, y } = this;
    // when rotation, we want to know where we were looking before
    let wasFacing = facing;

    if (this.action === 'go-forwards') {
      if (facing === 'north') y++;
      if (facing === 'south') y--;
      if (facing === 'east') x--;
      if (facing === 'west') x++;
    } else if (this.action === 'turn-left') {
      wasFacing = this.getFacingForAngle(this.angle - 90);
    } else if (this.action === 'turn-right') {
      wasFacing = this.getFacingForAngle(this.angle + 90);
    }


    return rows.map((row) => {
      return row.map((tile) => {
        let shouldHide = true;
        const facedDirections = [wasFacing, facing];
        if (facedDirections.includes('north') && tile.y <= y) shouldHide = false;
        if (facedDirections.includes('south') && tile.y >= y) shouldHide = false;
        if (facedDirections.includes('east') && tile.x >= x) shouldHide = false;
        if (facedDirections.includes('west') && tile.x <= x) shouldHide = false;

        return shouldHide ? createEmptyTile(tile.x, tile.y) : tile;
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
    const rows = this.rows || [];
    const { x, y } = this;
    const tile = rows[y][x];
    return !tile[facing];
  }

  mounted(): void {
    this.updateCSSVariables();
    Object.assign(window, { viewer: this });
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

  @Watch('map.start', { immediate: true, deep: true })
  initStartingPosition(): void {
    const { start } = this.map
    this.x = start.x;
    this.y = start.y;
  }

  @Watch('viewXOffset')
  @Watch('viewYOffset')
  updateCSSVariables(): void {
    if (!this.$el) return;
    (this.$el as HTMLElement).style.setProperty('--viewportXOffset', this.viewXOffset.toString());
    (this.$el as HTMLElement).style.setProperty('--viewportYOffset', this.viewYOffset.toString());
  }

  @Watch('action')
  logAction(): void {
    console.log(this.action || 'action complete');
  }

  onTransitionEnd(): void {
    this.action = null;
  }

  rotateRight(): void {
    this.action = 'turn-right';
    this.angle -= 90;
  }

  rotateLeft(): void {
    this.action = 'turn-left';
    this.angle += 90;
  }

  goForwards(): void {
    this.action = 'go-forwards';
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
  width: var(--viewportSize);
  height: var(--viewportSize);
  min-width: var(--viewportSize);
  min-height: var(--viewportSize);
  max-width: var(--viewportSize);
  max-height: var(--viewportSize);
  position: relative;

  .face {
    backface-visibility: hidden;
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
</style>