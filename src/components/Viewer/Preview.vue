<template>
  <div class="preview" :style="{ '--viewportSize': `${viewportSize}px` }">
    <GameView
      :map="map"
      :x="x"
      :y="y"
      :facing="facing"
      @actionComplete="onActionComplete()"
    />
    <div>
      <Controls
        :canMoveForwards="canMoveForwards"
        @turnLeft="turnLeft()"
        @turnRight="turnRight()"
        @goForwards="goForwards()"
      />
      <div style="width: 300px; height: 300px; margin-top: 1em; background: black; padding: 1em;">
        <MiniMap
          :faces="knownFaces"
          :player="{ x, y, facing}"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, InjectReactive } from "vue-property-decorator";

import { FacePos, MapDefinition, ProjectDefintion } from "@/types/Map.types";
import { Facing } from "@/types/Map.types";
import { addToKnownFaces, canMoveForwards, goTowards, leftFrom, rightFrom } from '@/util/map-helper';

import GameView from './GameView.vue';
import Controls from './Controls.vue';
import MiniMap from './MiniMap.vue';

@Component({
  components: {
    GameView,
    Controls,
    MiniMap,
  },
})
export default class Preview extends Vue {
  @InjectReactive() project!: ProjectDefintion;
  @InjectReactive() selectedMap!: string;

  facing: Facing = 'north';
  x = 0;
  y = 0;
  viewportSize = 800;
  isActionActive = false;
  updateSize!: () => void;
  knownFaces: FacePos[] = [];

  get map(): MapDefinition {
    const { project, selectedMap } = this;
    return project.maps.find((map) => map.name === selectedMap) || project.maps[0];
  }

  get canMoveForwards(): boolean {
    return canMoveForwards(this.map, this.x, this.y, this.facing);
  }

  @Watch('x')
  @Watch('y')
  @Watch('facing', { immediate: true })
  updateKnownTiles(): void {
    this.knownFaces = addToKnownFaces({ x: this.x, y: this.y, facing: this.facing }, this.map, this.knownFaces);
  }

  mounted(): void {
    this.updateSize = () => { this.viewportSize = Math.min(800, window.innerHeight - 160); };
    this.updateSize();
    window.addEventListener('resize', this.updateSize);
  }

  beforeDestroy(): void {
    window.removeEventListener('resize', this.updateSize);
  }

  @Watch('map.start', { immediate: true, deep: true })
  initStartingPosition(): void {
    const { start } = this.map
    this.x = start.x;
    this.y = start.y;
    this.facing = start.facing;
  }

  onActionComplete(): void {
    this.isActionActive = false;
  }

  turnRight(): void {
    if (this.isActionActive) return;
    this.isActionActive = true;
    this.facing = rightFrom(this.facing);
  }

  turnLeft(): void {
    if (this.isActionActive) return;
    this.isActionActive = true;
    this.facing = leftFrom(this.facing);
  }

  goForwards(): void {
    if (this.isActionActive || !canMoveForwards(this.map, this.x, this.y, this.facing)) {
      return;
    }
    this.isActionActive = true;
    const move = goTowards(this.facing);
    this.x += move.x;
    this.y += move.y;
  }
}
</script>

<style lang="scss" scoped>
.preview {
  display: flex;
  width: calc(1.5 * var(--viewportSize));
  gap: 10px;
  padding: 20px;  
}
</style>