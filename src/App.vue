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
      ></button>
    </div>
    <ProjectManager
      v-if="state === 'project-manager'"
      @setProject="setProject($event)"
    />
    <Editor
      v-if="state === 'editor'"
      key="editor"
    />
    <Viewer
      v-if="state === 'viewer'"
      :show="state === 'viewer'"
      key="viewer"
    />
  </div>
</template>

<script lang="ts">
import { Component, ProvideReactive, Vue, Watch } from 'vue-property-decorator';

import { ProjectDefintion } from '@/types/Map.types';

import Editor from '@/components/Editor/Editor.vue';
import Viewer from '@/components/Viewer/Viewer.vue';
import ProjectManager from '@/components/ProjectManager/ProjectManager.vue';

type AppState = 'editor' | 'viewer' | 'project-manager';
interface TwineDungeonCrawlerData {
  activeSave?: string;
}

const lsPrefix = 'tdc_';

@Component({
  components: {
    Editor,
    Viewer,
    ProjectManager,
  },
})
export default class App extends Vue {
  state: AppState = 'project-manager';
  styleElement!: HTMLStyleElement;
  @ProvideReactive() project: ProjectDefintion | null = null;

  get textureCSS(): string {
    return this.project?.textures.map((texture): string => {
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
    }).join(' ') || '';
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

  initStyleTarget(): void {
    const oldStylElements = Array.from(document.head.querySelectorAll(`style[data-tdc]`));
    while (oldStylElements.length) {
      oldStylElements.pop()?.remove();
    }

    this.styleElement = document.createElement('style');
    this.styleElement.setAttribute('data-tdc', '');
    document.head.appendChild(this.styleElement);
  }

  setProject(project: ProjectDefintion): void {
    this.project = project;
    this.state = 'editor';
  }

  @Watch('textureCSS')
  updateDomTextureCSS(): void {
    this.styleElement.innerHTML = this.textureCSS;
  }

  created(): void {
    this.initStyleTarget();
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
  width: 100%;
  height: 100%;
  font-family: Arial, Helvetica, sans-serif;
}
</style>

<style lang="scss" scoped>
.app {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;

  > :not(.statebar) {
    flex: 1;
  }
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
