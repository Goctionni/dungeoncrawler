<template>
  <div class="app">
    <div class="statebar">
      <button
        type="button"
        :class="{ active: state === 'editor'}"
        @click="state = 'editor'"
        v-text="'Editor'"
      ></button>
      <button
        type="button"
        :class="{ active: state === 'viewer'}"
        @click="state = 'viewer'"
        v-text="'Viewer'"
        :disabled="!map"
      ></button>
    </div>
    <Editor
      :show="state === 'editor'"
      @map="updateMap($event)"
      key="editor"
    />
    <Viewer
      v-if="state === 'viewer'"
      :show="state === 'viewer'"
      :map="map"
      key="viewer"
    />
  </div>
</template>

<script lang="ts">
import { Component, ProvideReactive, Vue, Watch } from 'vue-property-decorator';

import { Map } from './Map.types';
import Editor from './components/Editor/Editor.vue';
import Viewer from './components/Viewer/Viewer.vue';

type AppState = 'editor' | 'viewer';
interface TwineDungeonCrawlerData {
  activeSave?: string;
}

const lsPrefix = 'tdc_';

@Component({
  components: {
    Editor,
    Viewer,
  },
})
export default class App extends Vue {
  state: AppState = 'editor';
  map: Map | null = null;
  styleElement!: HTMLStyleElement;

  @ProvideReactive() texturesMap: Record<string, string> = {};

  get textureCSS(): string {
    return Object.keys(this.texturesMap).reduce((css, name) => {
      return css + `.texture__${name} { ${this.texturesMap[name]} } `;
    }, '');
  }

  updateMap(map: Map): void {
    this.map = map;
  }

  initSaves(): boolean {
    const data: TwineDungeonCrawlerData = JSON.parse(localStorage[`${lsPrefix}global`] || '{}');
    if (!data?.activeSave) {
      return false;
    } else {
      return this.loadSave(data.activeSave);
    }
  }

  loadSave(name: string): boolean {
    if (!localStorage[`${lsPrefix}${name}`]) return false;
    // actually load stuff
    return true;
  }

  initDefaultTextures(): void {
    this.$set(this.texturesMap, 'ph1', `background-color: #f00`);
    this.$set(this.texturesMap, 'ph2', `background-color: #0f0`);
    this.$set(this.texturesMap, 'ph3', `background-color: #00f`);
    this.$set(this.texturesMap, 'ph4', `background-color: #ff0`);
    this.$set(this.texturesMap, 'ph5', `background-color: #f0f`);
    this.$set(this.texturesMap, 'ph6', `background-color: #0ff`);
    this.$set(this.texturesMap, 'ph7', `background-color: #999`);
  }

  initStyleTarget(): void {
    const oldStylElements = document.head.querySelectorAll(`style[data-tdc]`);
    while (oldStylElements.length) {
      oldStylElements[0].remove();
    }

    this.styleElement = document.createElement('style');
    this.styleElement.setAttribute('data-tdc', '');
    document.head.appendChild(this.styleElement);
  }

  @Watch('textureCSS')
  updateDomTextureCSS(): void {
    this.styleElement.innerHTML = this.textureCSS;
  }

  created(): void {
    this.initStyleTarget();
    if (!this.initSaves()) {
      this.initDefaultTextures();
    }
  }
}
</script>

<style lang="scss">
* {
  box-sizing: border-box;
}

body, html {
  padding: 0;
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
}

.statebar {
  background-color: #B00B13;
  display: flex;
  gap: 5px;
  padding: .25em 1em;

  button {
    padding: .4em 1em;
    border: 0;
    background: 0;
    color: #FFF;
    font-size: 18px;
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, .1);
    }

    &.active {
      font-weight: bold;
    }

    &[disabled] {
      cursor: default;
      pointer-events: none;
      opacity: .5;
    }
  }
}
</style>
