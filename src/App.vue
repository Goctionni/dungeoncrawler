<template>
  <div class="app">
    <div class="appbar">
      <h1>Twine Dungeon Crawler System</h1>
      <template v-if="state !== 'project-manager'">
        <button
          type="button"
          :class="{ active: state === 'editor'}"
          @click="state = 'editor'"
          v-text="'Editor'"
        />
        <button
          type="button"
          :class="{ active: state === 'viewer'}"
          @click="state = 'viewer'"
          v-text="'Viewer'"
        />
        <span class="separator"></span>
        <button v-if="project.hasUnsavedChanges" @click="saveProject()">Save changes</button>
        <button @click="closeProject()" class="close" title="Close project">&times;</button>
      </template>
    </div>
    <ProjectManager
      v-if="state === 'project-manager'"
      @setProject="setProject($event)"
    />
    <MapPicker
      class="map-picker"
      v-if="state !== 'project-manager'"
      @setMap="setMap($event)"
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
import MapPicker from '@/components/MapPicker/MapPicker.vue';
import { store } from './store';
import { ProjectListItem } from './types/store.types';

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
    MapPicker,
  },
})
export default class App extends Vue {
  state: AppState = 'project-manager';
  styleElement!: HTMLStyleElement;
  @ProvideReactive() project: ProjectDefintion | null = null;
  @ProvideReactive() selectedMap = '';

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

  @Watch('project', { immediate: true })
  initDefaultMap(): void {
    this.selectedMap = this.project?.maps[0].name || '';
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

  setMap(mapname: string): void {
    this.selectedMap = mapname;
  }

  setProject(project: ProjectDefintion): void {
    this.project = project;
    this.state = 'editor';
  }

  @Watch('textureCSS')
  updateDomTextureCSS(): void {
    this.styleElement.innerHTML = this.textureCSS;
  }

  async saveProject(): Promise<void> {
    if (!this.project) return;
    const projectnames = await store.getItem<ProjectListItem[]>('project-list') || [];
    const filtered = projectnames.filter((pn) => pn.guid !== this.project?.guid);
    this.project.hasUnsavedChanges = false;
    store.setItem(`project-list`, [{ name: this.project.name, guid: this.project.guid }, ...filtered]);
    store.setItem(`project__${this.project.guid}`, this.project);
  }

  closeProject(): void {
    this.project = null;
    this.state = 'project-manager';
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

  > :not(.appbar, .map-picker) {
    flex: 1;
  }
}

.appbar {
  background-color: #B00B13;
  display: flex;
  gap: 5px;
  padding: .25em 1em;

  h1 {
    color: #FFF;
    font-size: 24px;
    margin-right: 1em;
  }

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

  .separator {
    flex: 1;
  }

  .close {
    display: flex;
    font-size: 24px;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }
}
</style>
