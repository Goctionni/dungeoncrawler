<template>
  <div class="tabs">
    <button
      v-for="map in maps"
      :key="`select-map__${map}`"
      class="tab"
      :class="{ active: map === selectedMap }"
      @click="selectMap(map)"
      v-text="map"
    />
    <label class="add-map">
      <input v-model="newMapName" @keydown.enter.prevent="addMap()" />
      <button @click.prevent="addMap()" :disabled="!validMapName">+</button>
    </label>
  </div>
</template>

<script lang="ts">
import { Component, Vue, InjectReactive } from "vue-property-decorator";
import { ProjectDefintion } from "@/types/Map.types";
import { DEFAULT_MAP_FACTORY } from '@/data/defaultMap';

@Component
export default class MapPicker extends Vue {
  @InjectReactive() project!: ProjectDefintion;
  @InjectReactive() selectedMap!: string;
  newMapName = "";

  get maps(): string[] {
    return this.project.maps.map((map) => map.name);
  }

  get validMapName(): boolean {
    if (!this.newMapName.trim()) return false;
    const currentNames = this.maps.map((name) => name.toLowerCase());
    return !currentNames.includes(this.newMapName.toLowerCase().trim());
  }

  selectMap(map: string): void {
    this.$emit('setMap', map);
  }

  addMap(): void {
      if (!this.validMapName) return;
      this.project.maps.push({
          ...DEFAULT_MAP_FACTORY(),
          name: this.newMapName.trim(),
      });
      console.log('maps', this.project.maps);
      this.newMapName = '';
  }
}
</script>

<style lang="scss" scoped>
.tabs {
  display: flex;
  padding: 10px 10px 0;
  border-bottom: solid #000 1px;
  justify-content: flex-start;
  align-items: flex-end;
}
.tab {
  border: solid #000;
  border-width: 1px 1px 0;
  padding: 0.5em 1em;

  + .tab {
    margin-left: -1px;
  }

  &.active {
    padding: 0.75em 1.25em;
    margin-bottom: -1px;
    border-radius: 3px 3px 0 0;
    background-color: #fff;
    z-index: 1;
  }

  &:hover:not(.active) {
    background-color: #ccc;
    cursor: pointer;
  }

  &:first-child {
    border-top-left-radius: 3px;
  }

  &:last-of-type {
    border-top-right-radius: 3px;
  }
}

.add-map {
  margin: 3px 5px;
  border: solid #000 1px;
  padding: 2px;
  display: flex;
  border-radius: 3px;

  input {
    border: 0;
    background: transparent;
    outline: 0;
  }

  button {
    border: 0;
    background: transparent;
    cursor: pointer;
    font-size: 24px;
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
        background-color: #CCC;
        border-radius: 2px;
    }
  }
}
</style>