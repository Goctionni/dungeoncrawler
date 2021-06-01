<template>
  <div class="editor" v-if="show">
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
      :mapSizeX="mapSizeX"
      :mapSizeY="mapSizeY"
      @setTexture="activeTexture = $event"
      @setTool="activeTool = $event"
      @setMapViewMode="mapViewMode = $event"
      @setMapSizeX="mapSizeX = $event"
      @setMapSizeY="mapSizeY = $event"
      @saveTexture="saveTexture($event)"
      @removeTexture="removeTextureByName($event)"
    />
  </div>
</template>

<script lang="ts">
import { Texture } from '@/Texture.types';
import { Component, Vue, Prop, Watch, InjectReactive } from 'vue-property-decorator';

import { Row, Tile, Tool, tools, MapViewMode } from '@/Map.types';
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
  @Prop() show!: boolean;

  mapSizeX = 7;
  mapSizeY = 7;
  mapViewMode: MapViewMode = 'individual';
  startTile: Tile | null = null;
  tiles: { [pos: string]: Tile } = {};
  tools: Tool[] = tools.slice();
  activeTool: Tool = 'floor';
  activeTexture = '';

  @InjectReactive() textureList!: Texture[];
  get textures(): string[] {
    return this.textureList.map((texture) => texture.name);
  }

  get rows(): Row[] {
    const { mapSizeX, mapSizeY, tiles } = this;
    const rows: Row[] = [];
    for (let y = 0; y < mapSizeY; y++) {
      const row: Row = [];
      for (let x = 0; x < mapSizeX; x++) {
        let tile = tiles[`${x}:${y}`] || createEmptyTile(x, y);
        row.push(tile);
      }
      rows.push(row);
    }
    return rows;
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

  setStart(startTile: Tile): void {
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
