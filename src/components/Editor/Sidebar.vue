<template>
  <div class="sidebar">
    <TextureEditor
      v-if="editingTexture !== null"
      :textureName="editingTexture"
      @close="editingTexture = null"
      @save="saveTexture(editingTexture, $event)"
    />
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
      <div class="faces">
        <button
          v-for="tool in tools"
          :key="tool"
          type="button"
          class="tool-btn"
          :class="{ active: tool === activeTool, [tool]: true}"
          @click="setTool(tool)"
        >{{ keyBindings[tool] }}</button>
      </div>
    </div>
    <div class="textures">
      <h2>Texture</h2>
      <div>
        <button
          type="button"
          class="texture-btn"
          @click="setTexture('')"
          :class="{ active: activeTexture === '', texture__: true}"
        >Clear</button>

        <button
          v-for="texture in textures"
          :key="texture"
          type="button"
          class="texture-btn"
          :class="{ active: texture === activeTexture, [`texture__${texture}`]: true}"
          @click="setTexture(texture)"
        >
          <button class="edit-texture" @click.prevent.stop="editTexture(texture)">Edit</button>
          <button class="remove-texture" @click.prevent.stop="removeTexture(texture)">Remove</button>
        </button>
        <button
          type="button"
          class="texture-btn texture-new"
          @click="newTexture()"
        >New Texture</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Tool, MapViewMode, Size } from '@/types/Map.types';
import { Texture } from '@/types/Texture.types';
import { Component, Prop, Vue } from 'vue-property-decorator';

import TextureEditor from './TextureEditor.vue';

type WheelHandler = (e: WheelEvent) => void;

@Component({
  components: {
    TextureEditor,
  },
})
export default class Sidebar extends Vue {
  @Prop() activeTool!: Tool;
  @Prop() activeTexture!: string;
  @Prop() mapViewMode!: MapViewMode;
  @Prop() tools!: Tool[];
  @Prop() textures!: string[];
  @Prop() mapSize!: Size;

  editingTexture: string | null = null;
  wheelHandler: WheelHandler | null = null;
  keyBindings: {[tool in Tool]: string} = {
    floor: 'f',
    north: 'w',
    east: 'd',
    south: 's',
    west: 'a',
  };

  get mapSizeXModel(): number {
    return this.mapSize.x;
  }
  set mapSizeXModel(x: number) {
    const newSize: Size = { ...this.mapSize, x };
    this.$emit('setMapSize', newSize);
  }

  get mapSizeYModel(): number {
    return this.mapSize.y;
  }
  set mapSizeYModel(y: number) {
    const newSize: Size = { ...this.mapSize, y };
    this.$emit('setMapSize', newSize);
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

  nextTexture(): void {
    console.log('nextTexture');
    const currentIndex = this.textures.indexOf(this.activeTexture);
    if ((currentIndex + 1) >= this.textures.length) {
      this.setTexture(this.textures[0]);
    } else {
      this.setTexture(this.textures[currentIndex + 1]);
    }
  }

  lastTexture(): void {
    console.log('lastTexture');
    const currentIndex = this.textures.indexOf(this.activeTexture);
    if ((currentIndex - 1) < 0) {
      this.setTexture(this.textures.slice().pop() as Tool);
    } else {
      this.setTexture(this.textures[currentIndex - 1]);
    }
  }

  newTexture(): void {
    this.editingTexture = '';
  }

  editTexture(texture: string): void {
    this.editingTexture = texture;
  }

  removeTexture(texture: string): void {
    this.$emit('removeTexture', texture);
  }

  saveTexture(oldName: string, texture: Texture): void {
    this.$emit('saveTexture', { oldName, texture });
  }

  created(): void {
    // create handler
    this.wheelHandler = (function(this: Sidebar, e: WheelEvent) {
      if (!e.shiftKey) return;
      e.preventDefault();
      if (e.deltaY > 0) this.nextTexture();
      else if (e.deltaY < 0) this.lastTexture();
    }).bind(this);
    // Bind
    window.addEventListener('wheel', this.wheelHandler, { passive: false });
  }

  beforeDestroy(): void {
    if (this.wheelHandler) window.removeEventListener('wheel', this.wheelHandler);
  }

}
</script>

<style lang="scss" scoped>
@import '../../faces';

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
  .faces {
    display: grid;
    width: fit-content;
    grid-template-areas:
      "x north y"
      "west floor east"
      "z south a";
    background-color: #CCC;
    padding: 5px;
  }

  .tool-btn {
    width: 40px;
    height: 40px;
    border: solid rgba(0, 0, 0, .15) 1px;
    background-color: #F4F4F4;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-weight: bold;

    &.floor {
      background-color: #999;
      border: 0;
      grid-area: floor;
    }

    &.north {
      border-top: solid #000 2px;
      grid-area: north;
    }

    &.east {
      border-right: solid #000 2px;
      grid-area: east;
    }

    &.south {
      border-bottom: solid #000 2px;
      grid-area: south;
    }

    &.west {
      border-left: solid #000 2px;
      grid-area: west;
    }
  }
}

.textures {
  .texture-btn {
    width: 100px;
    height: 100px;
    color: #000;
    text-shadow: -1px -1px 0 #FFF,
        0   -1px 0 #FFF,
        1px -1px 0 #FFF,
        1px  0   0 #FFF,
        1px  1px 0 #FFF,
        0    1px 0 #FFF,
        -1px  1px 0 #FFF,
        -1px  0   0 #FFF;    

    .remove-texture,
    .edit-texture {
      display: none;
      position: absolute;
      top: 0;
      padding: 0;
      background: 0;
      border: 0;
      font-size: 12px;
      color: #FFF;
      text-shadow: -1px -1px 0 #000,
          0   -1px 0 #000,
          1px -1px 0 #000,
          1px  0   0 #000,
          1px  1px 0 #000,
          0    1px 0 #000,
          -1px  1px 0 #000,
          -1px  0   0 #000;    

      &:hover {
        outline: 0;
        text-decoration: underline;
      }
    }

    &:hover .remove-texture,
    &:hover .edit-texture {
      display: block;
    }

    .remove-texture {
      right: 10px;
    }

    .edit-texture {
      left: 10px;
    }
  }
}

.clear {
  background-color: rgba(255, 255, 255, .5);
}
</style>