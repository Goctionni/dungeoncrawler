<template>
  <div class="viewer">
    <GameView
      :map="map"
      :x="x"
      :y="y"
      :facing="facing"
    />
    <div class="controls">
      <button class="turn-left" @click="rotateLeft()"></button>
      <button class="go-forwards" @click="goForwards()" :disabled="!canMoveForwards"></button>
      <button class="turn-right" @click="rotateRight()"></button>
    </div>
  </div>
</template>

<script lang="ts">
import { MapDefinition, ProjectDefintion } from "@/types/Map.types";
import { Facing } from "@/types/Map.types";
import { Component, Vue, Watch, InjectReactive } from "vue-property-decorator";

import GameView from './GameView.vue';

@Component({
  components: {
    GameView,
  },
})
export default class Sidebar extends Vue {
  @InjectReactive() project!: ProjectDefintion;
  @InjectReactive() selectedMap!: string;

  get map(): MapDefinition {
    const { project, selectedMap } = this;
    return project.maps.find((map) => map.name === selectedMap) || project.maps[0];
  }

  facing: Facing = 'north';
  x = 0;
  y = 0;

  get canMoveForwards(): boolean {
    const facing = this?.facing || 'north';
    const tiles = this.map.tiles;
    const key = `${this.x}:${this.y}`;
    const tile = tiles[key] || {};
    return !tile[facing];
  }

  mounted(): void {
    Object.assign(window, { viewer: this });
  }

  @Watch('map.start', { immediate: true, deep: true })
  initStartingPosition(): void {
    const { start } = this.map
    this.x = start.x;
    this.y = start.y;
  }

  rotateRight(): void {
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

  rotateLeft(): void {
    switch(this.facing) {
      case 'north':
        this.facing = 'west';
        break;
      case 'east':
        this.facing = 'north';
        break;
      case 'south':
        this.facing = 'east';
        break;
      case 'west':
        this.facing = 'south';
        break;
    }
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