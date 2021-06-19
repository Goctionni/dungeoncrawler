<template>
  <div class="viewer">
    <GameView
      :map="map"
      :x="x"
      :y="y"
      :facing="facing"
    />
    <Controls
      :canMoveForwards="canMoveForwards"
      @turnLeft="turnLeft()"
      @turnRight="turnRight()"
      @goForwards="goForwards()"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, InjectReactive } from "vue-property-decorator";

import { MapDefinition, ProjectDefintion } from "@/types/Map.types";
import { Facing } from "@/types/Map.types";
import { canMoveForwards, goTowards, leftFrom, rightFrom } from '@/util/helper';

import GameView from './GameView.vue';
import Controls from './Controls.vue';

@Component({
  components: {
    GameView,
    Controls,
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
    return canMoveForwards(this.map, this.x, this.y, this.facing);
  }

  @Watch('map.start', { immediate: true, deep: true })
  initStartingPosition(): void {
    const { start } = this.map
    this.x = start.x;
    this.y = start.y;
  }

  turnRight(): void {
    this.facing = rightFrom(this.facing);
  }

  turnLeft(): void {
    this.facing = leftFrom(this.facing);
  }

  goForwards(): void {
    const move = goTowards(this.facing);
    this.x += move.x;
    this.y += move.y;
  }
}
</script>

<style lang="scss" scoped>
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
</style>