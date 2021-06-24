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
        <button v-else @click="downloadFiles()">Download files</button>
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
      :state="state"
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
    {{ test }}
  </div>
</template>

<script lang="ts">
import { Component, Prop, ProvideReactive, Vue, Watch } from 'vue-property-decorator';

import { MapDefinition, ProjectDefintion, Tile } from '@/types/Map.types';

import Editor from '@/components/Editor/Editor.vue';
import Viewer from '@/components/Viewer/Viewer.vue';
import ProjectManager from '@/components/ProjectManager/ProjectManager.vue';
import MapPicker from '@/components/MapPicker/MapPicker.vue';
import { store } from './store';
import { ProjectListItem } from './types/store.types';
import { getUsedTextures, getTextureBlobsAndFiles } from '@/util/texture-helper';
import { Texture } from './types/Texture.types';

type AppState = 'editor' | 'viewer' | 'project-manager';
interface MapsData {
  [name: string]: MapDefinition;
}

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
  @Prop() test!: number;

  get textureCSS(): string {
    return this.project ? this.generateTextureCSS(this.project.textures) : '';
  }

  @Watch('project', { immediate: true })
  initDefaultMap(): void {
    this.selectedMap = this.project?.maps[0].name || '';
  }

  generateTextureCSS(textures: Texture[]): string {
    return textures.map((texture): string => {
      const cssBody = texture.properties.map((property) => {
        const { name, value } = property;
        return `  ${name}: ${value};`
      }).join('\n');
      return `.texture__${texture.name} {\n${cssBody}\n}`;
    }).join('\n\n') || '';
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

  async downloadFiles(): Promise<void> {
    if (!this.project) return;

    // create zip
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // maps
    const maps: MapsData = this.project.maps.reduce((acc: MapsData, cur: MapDefinition): MapsData => ({ ...acc, [cur.name]: cur }), {});
    const setupScript = `setup.tdc = { viewportSize: '800px', maps: ${JSON.stringify(maps)} };\n`;
    zip.file('tdc/tdc-setup.js', setupScript);

    // textures
    const textures = getUsedTextures(this.project);
    let textureCSS = this.generateTextureCSS(textures);
    const imagesAndBlobs = await getTextureBlobsAndFiles(textureCSS);
    for (let imageAndBlob of imagesAndBlobs) {
      let filepath = `textures/${imageAndBlob.filename}`;
      if (imageAndBlob.url.includes(filepath)) {
        filepath = filepath.replace('textures/', `textures/${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36)}_`);
      }
      zip.file(filepath, imageAndBlob.blob);
      while (textureCSS.includes(imageAndBlob.url)) {
        textureCSS = textureCSS.replace(imageAndBlob.url, filepath);
      }
    }
    zip.file('tdc/tdc-textures.css', textureCSS);
    zip.file('tdc/tdc-nofade.css', `.passage.tdc { transition-property: none; }`);

    // viewer plugin
    const viewerResponse = await fetch('//raw.githubusercontent.com/Goctionni/dungeoncrawler/viewerjs/tdc-plugin.js');
    const viewerjs = await viewerResponse.text();
    zip.file('tdc/tdc-plugin.js', viewerjs);

    // TDC macro
    const tdcMacroResponse = await fetch('//raw.githubusercontent.com/Goctionni/dungeoncrawler/viewerjs/tdc-macro.js');
    const tdcMacroJs = await tdcMacroResponse.text();
    zip.file('tdc/tdc-macro.js', tdcMacroJs);

    // TDC template
    const tdcTemplateResponse = await fetch('//raw.githubusercontent.com/Goctionni/dungeoncrawler/viewerjs/tdc-template.tw');
    const tdcTemplateJs = await tdcTemplateResponse.text();
    zip.file('tdc/tdc-template.tw', tdcTemplateJs);

    // passages
    for(const map of this.project.maps) {
      const passages = Object.values(map.tiles).map((tile: Tile): string => {
        return `:: tdc-${map.name} (${tile.x},${tile.y}) [tdc]\n\n<<DungeonCrawler '${map.name}' ${tile.x} ${tile.y} $tdcFacing>><</DungeonCrawler>>\n`;
      });
      const mapInitPassage = `:: tdc-${map.name} [tdc]\n\n<<DungeonCrawler '${map.name}'>><</DungeonCrawler>>\n` +
        `<<done>><<replace ".tdc-description">>You enter the dungeon... (You can use this to place text into the sample UI)<</replace>><</done>>`;
      zip.file(`tdc-passages/${map.name}.tw`, [ mapInitPassage, ...passages].join('\n\n'));
    }

    // zip the data
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // download zip
    const saveAs = (await import('file-saver')).saveAs;
    saveAs(zipBlob, `tdc_${this.project.name}.zip`);
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

html {
  overflow: hidden;
}
body {
  overflow: auto;
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
