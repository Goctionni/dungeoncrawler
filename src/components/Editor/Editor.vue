<template>
  <div class="editor">
    <Map
      :rows="rows"
      :activeTool="activeTool"
      :activeTexture="activeTexture"
      :mapViewMode="mapViewMode"
      :startTile="startTile"
      @updateTile="updateTile($event)"
      @setStart="setStart($event)"
    />
    <Sidebar
      :activeTool="activeTool"
      :activeTexture="activeTexture"
      :mapViewMode="mapViewMode"
      :textures="textures"
      :tools="tools"
      :mapSize="mapSize"
      @setTexture="activeTexture = $event"
      @setTool="activeTool = $event"
      @setMapViewMode="mapViewMode = $event"
      @setMapSize="setMapSize($event)"
      @saveTexture="saveTexture($event)"
      @removeTexture="removeTextureByName($event)"
    />
  </div>
</template>

<script lang="ts">
import { Texture } from '@/types/Texture.types';
import { Component, Vue, Watch, InjectReactive } from 'vue-property-decorator';

import { Row, Tile, Tool, tools, MapViewMode, ProjectDefintion, MapDefinition, StartPos, Size } from '@/types/Map.types';
import { createEmptyTile } from '@/util';

import Map from './Map.vue';
import Sidebar from './Sidebar.vue';

@Component({
  components: {
    Map,
    Sidebar,
  },
})
export default class Editor extends Vue {
  @InjectReactive() project!: ProjectDefintion;
  selectedMap = '';
  mapViewMode: MapViewMode = 'individual';
  tools: Tool[] = tools.slice();
  activeTool: Tool = 'floor';
  activeTexture = '';

  get map(): MapDefinition {
    return this.project.maps.find((map) => map.name === this.selectedMap) || this.project.maps[0];
  }

  get mapSize(): Size {
    return this.map.size;
  }

  set mapSize(size: Size) {
    this.map.size = size;
  }

  get startTile(): StartPos {
    return this.map.start;
  }

  set startTile(start: StartPos) {
    this.map.start = start;
  }

  get tiles(): { [pos: string]: Tile }  {
    return this.map.tiles;
  }

  @InjectReactive() textureList!: Texture[];
  get textures(): string[] {
    return this.project.textures.map((texture) => texture.name);
  }

  get rows(): Row[] {
    const { mapSize, tiles } = this;
    const rows: Row[] = [];
    for (let y = 0; y < mapSize.y; y++) {
      const row: Row = [];
      for (let x = 0; x < mapSize.x; x++) {
        let tile = tiles[`${x}:${y}`] || createEmptyTile(x, y);
        row.push(tile);
      }
      rows.push(row);
    }
    return rows;
  }

  @Watch('project', { immediate: true })
  initSelectedMap(): void {
    this.selectedMap = this.project.maps[0]?.name;
  }

  updateTile({ tile, tool }: { tile: Tile, tool: Tool }): void {
    const {x, y} = tile;
    const pos = `${x}:${y}`;

    const posTile = this.tiles[pos] || createEmptyTile(x, y);
    posTile[tool] = this.activeTexture;
    // Remove the tool from tile faces
    posTile.faces = posTile.faces.filter((face) => face !== tool);
    // But if texture isnt empty, add it back
    if (this.activeTexture) posTile.faces.push(tool);

    if (posTile.floor || posTile.north || posTile.east || posTile.south || posTile.west) {
      this.$set(this.tiles, pos, posTile);
    } else {
      this.$delete(this.tiles, pos);
    }
  }

  saveTexture({ oldName, texture }: { oldName: string, texture: Texture }): void {
    let obj = this.textureList.find((oldTexture) => oldTexture.name === oldName);
    if (!obj) {
      this.textureList.push(texture);
    } else {
      Object.assign(obj, texture);
    }
  }

  removeTextureByName(name: string): void {
    const index = this.textureList.findIndex((texture) => texture.name === name);
    if (index >= 0) {
      this.textureList.splice(index, 1);
    }
  }

  setStart(startTile: StartPos): void {
    this.startTile = startTile;
    this.emitUpdate();
  }

  @Watch('rows')
  emitUpdate(): void {
    this.$emit('map', { rows: this.rows, startTile: this.startTile });
  }
}
</script>

<style lang="scss" scoped>
.editor {
  display: flex;
  padding: 10px;
}
</style>
