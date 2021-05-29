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

import { Map } from '@/Map.types';
import { Texture } from '@/Texture.types';

import Editor from '@/components/Editor/Editor.vue';
import Viewer from '@/components/Viewer/Viewer.vue';

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

  @ProvideReactive() textureList: Texture[] = [];

  get textureCSS(): string {
    return this.textureList.map((texture): string => {
      let cssBody = '';
      for (const property of texture.properties) {
        const { name, value } = property;
        if (!value) { // Specialcase! Probably like `&::before` { or whatever
          cssBody += name.replace(/&/g, `.texture__${name}`);
        } else {
          cssBody += `${name}: ${value};`;
        }
      }
      return `.texture__${texture.name} { ${cssBody} }`;
    }).join(' ');
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
    this.textureList.push({ name: 'ph1', properties: [{ name: 'background-color', value: '#f00' }] });
    this.textureList.push({ name: 'ph2', properties: [{ name: 'background-color', value: '#0f0' }] });
    this.textureList.push({ name: 'ph3', properties: [{ name: 'background-color', value: '#00f' }] });
    this.textureList.push({ name: 'ph4', properties: [{ name: 'background-color', value: '#ff0' }] });
    this.textureList.push({ name: 'ph5', properties: [{ name: 'background-color', value: '#f0f' }] });
    this.textureList.push({ name: 'ph6', properties: [{ name: 'background-color', value: '#0ff' }] });
    this.textureList.push({ name: 'ph7', properties: [{ name: 'background-color', value: '#999' }] });
  }

  initStyleTarget(): void {
    const oldStylElements = Array.from(document.head.querySelectorAll(`style[data-tdc]`));
    while (oldStylElements.length) {
      oldStylElements.pop()?.remove();
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
