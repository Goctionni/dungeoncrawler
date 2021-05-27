<template>
  <div class="sidebar">
    <div class="mapsize">
      <h2>Map size</h2>
      <label><input type="number" v-model="mapSizeXModel"> wide</label>
      <label><input type="number" v-model="mapSizeYModel"> high</label>
    </div>
    <div class="mapViewMode">
      <h2>View type</h2>
      <label><input type="radio" v-model="mapViewModeModel" value="individual">Individual 3D</label>
      <label><input type="radio" v-model="mapViewModeModel" value="complete">Complete 3D</label>
    </div>
    <div class="tools">
      <h2>Face</h2>
      <div>
        <button
          v-for="tool in tools"
          :key="tool"
          type="button"
          :class="{ active: tool === activeTool, [tool]: true}"
          @click="setTool(tool)"
        >{{ tool }}</button>
      </div>
    </div>
    <div class="textures">
      <h2>Texture</h2>
      <div>
        <button
          v-for="texture in textures"
          :key="texture"
          type="button"
          :class="{ active: texture === activeTexture, [texture]: true}"
          @click="setTexture(texture)"
        >{{ texture }}</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Tool, MapViewMode } from '@/Map.types';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Sidebar extends Vue {
  @Prop() activeTool!: Tool;
  @Prop() activeTexture!: string;
  @Prop() mapViewMode!: MapViewMode;
  @Prop() tools!: Tool[];
  @Prop() textures!: string[];
  @Prop() mapSizeX!: number;
  @Prop() mapSizeY!: number;

  get mapSizeXModel(): number {
    return this.mapSizeX;
  }
  set mapSizeXModel(n: number) {
    this.$emit('setMapSizeX', n);
  }

  get mapSizeYModel(): number {
    return this.mapSizeY;
  }
  set mapSizeYModel(n: number) {
    this.$emit('setMapSizeY', n);
  }

  get mapViewModeModel(): MapViewMode {
    return this.mapViewMode;
  }
  set mapViewModeModel(mapViewMode: MapViewMode) {
    this.$emit('setMapViewMode', mapViewMode);
  }

  setTexture(texture: string): void {
    this.$emit('setTexture', texture);
  }

  setTool(tool: string): void {
    this.$emit('setTool', tool);
  }
}
</script>

<style lang="scss" scoped>
@import '../../faces';
@import '../../textures';

.sidebar {
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  h2 {
    margin: 0;
  }
}

.mapsize {
  display: flex;
  flex-direction: column;

  label {
    padding: .15em 0;
  }
  input {
    width: 5ch;
    padding: 0 .25ch;
    border: solid #666 1px;
    border-radius: 4px;
    font-size: 20px;
    text-align: right;

    &::-webkit-inner-spin-button {
      opacity: 1;
      margin-left: .25ch;
    }
  }
}

.mapViewMode {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  label {
    position: relative;
    padding: 3px 0;
    cursor: pointer;

    &:hover::before {
      content: '';
      position: absolute;
      left: -5px;
      top: 0;
      right: -10px;
      bottom: 0;
      background-color: rgba(0, 0, 0, .05);
      border-radius: 4px;
      pointer-events: none;
    }

    input[type="radio"] {
      margin-right: 1ch;
    }
  }
}

.tools, .textures {
  width: 500px;

  > div {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  button {
    height: 30px;
    position: relative;
    cursor: pointer;
    padding: 5px 10px;
    outline-offset: 2px;

    &.active {
      outline: solid #000 2px;
      z-index: 1;
    }

    &:hover:not(.active) {
      outline: solid rgba(0, 0, 0, .25) 2px;
    }

    &:empty::before {
      content: 'clear';
      font-style: italic;
    }
  }
}

.tools {
  button {
    color: transparent;
    font-size: 0;
    width: 40px;
    height: 40px;
    border: solid rgba(0, 0, 0, .15) 1px;
    background-color: #F4F4F4;

    &.floor {
      background-color: #999;
      border: 0;
    }

    &.north {
      border-top: solid #000 2px;
    }

    &.east {
      border-right: solid #000 2px;
    }

    &.south {
      border-bottom: solid #000 2px;
    }

    &.west {
      border-left: solid #000 2px;
    }
  }
}

.textures {
  button {
    width: 100px;
    height: 100px;
  }
}

.clear {
  background-color: rgba(255, 255, 255, .5);
}
</style>