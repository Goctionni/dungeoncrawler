<template>
  <div class="tabs">
    <button
      v-for="map in maps"
      :key="`select-map__${map}`"
      class="tab"
      :class="{ active: map === selectedMap }"
      @click="selectMap(map)"
    >
      {{ map }}
      <div v-if="canEdit" class="actions">
        <button class="edit" @click="renameMap(map)">Edit</button>
        <button class="delete" @click="removeMap(map)">Delete</button>
      </div>
    </button>
    <label class="add-map" v-if="canEdit">
      <input v-model="newMapName" @keydown.enter.prevent="addMap()" />
      <button @click.prevent="addMap()" :disabled="!validMapName">+</button>
    </label>
  </div>
</template>

<script lang="ts">
import { Component, Vue, InjectReactive, Prop } from "vue-property-decorator";
import { MapDefinition, ProjectDefintion } from "@/types/Map.types";
import { DEFAULT_MAP_FACTORY } from '@/data/defaultMap';
import { Dialogs } from "../Dialog/dialogs";

@Component
export default class MapPicker extends Vue {
  @InjectReactive() project!: ProjectDefintion;
  @InjectReactive() selectedMap!: string;
  newMapName = "";

  @Prop() state!: string;

  get maps(): string[] {
    return this.project.maps.map((map) => map.name);
  }

  get validMapName(): boolean {
    return this.isValidMapName(this.newMapName)
  }

  get canEdit(): boolean {
    return this.state === 'editor';
  }

  isValidMapName(mapName: string): boolean {
    if (!mapName) return false;
    const currentNames = this.maps.map((name) => name.toLowerCase());
    return !currentNames.includes(mapName.toLowerCase().trim());
  }

  selectMap(map: string): void {
    this.$emit('setMap', map);
  }

  addMap(): void {
      if (!this.validMapName) {
        Dialogs.alert('Error', 'This name is either invalid or already in use');
        return;
      }
      this.project.maps.push({
          ...DEFAULT_MAP_FACTORY(),
          name: this.newMapName.trim(),
      });
      this.newMapName = '';
  }

  async renameMap(oldName: string): Promise<void> {
    const newName = await Dialogs.prompt('Rename map', `Enter a new name for "${oldName}"`, oldName);
    if (newName === oldName) return;
    if (newName) {
      const isSameish = newName.trim().toLowerCase() === oldName.trim().toLowerCase();
      if (!this.isValidMapName(newName) && !isSameish) {
        Dialogs.alert('Error', 'This name is either invalid or already in use');
      } else {
        const sanitizedName = newName.trim()
        const map = this.project.maps.find((map) => map.name === oldName) as MapDefinition;
        map.name = sanitizedName;
        if (this.selectedMap === oldName) {
          this.selectMap(sanitizedName)
        }
      }
    }
  }

  async removeMap(mapName: string): Promise<void> {
    if (await Dialogs.confirm('Remove map', 'Are you sure you want to delete this map?', ['No', '!Yes']) === 'Yes') {
      if (this.maps.length <= 1) {
        const newMapName = this.generateMapName();
        this.project.maps.push({
            ...DEFAULT_MAP_FACTORY(),
            name: newMapName.trim(),
        });        
      }
      this.selectMap(this.maps.find((m) => m !== mapName) as string);
      this.project.maps = this.project.maps.filter((map) => map.name !== mapName);
    }
  }

  generateMapName(): string {
    for (let i = 1;; i++) {
      if (!this.maps.includes(`Map ${i}`)) return `Map ${i}`;
    }
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
  display: flex;
  gap: 5px;
  align-items: center;
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

  .actions {
    display: flex;
    margin: -10px -10px 0 5px;
    gap: 5px;

    .edit, .delete {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      border: 0;
      width: 15px;
      height: 15px;
      color: transparent;
      font-size: 0;
      background: transparent;
      outline: 0;
      cursor: pointer;

      &::before {
        content: '';
        position: absolute;
        background-color: #333;
        inset: 0;
        z-index: 1;
      }

      &::after {
          content: '';
          position: absolute;
          inset: -3px;
          pointer-events: none;
          transition: background-color .2s ease-in-out;
      }

      &:hover {
        &::before {
          background-color: #FFF;
          transition: background-color .2s ease-in-out;
        }
      }
    }

    .edit {
      &::before {
        clip-path: path('M 0 15 L 0 13 L 10 3 L 12 5 L 2 15 L 0 15 M 11 2 L 13 0 L 15 2 L 13 4');
      }
      &:hover::after {
        background-color: #369;
      }
    }

    .delete {
      &::before {
        clip-path: path('M 0 2 L 2 0 L 7.5 5.5 L 13 0 L 15 2 L 9.5 7.5 L 15 13 L 13 15 L 7.5 9.5 L 2 15 L 0 13 L 5.5 7.5 L 0 2');
      }
      &:hover::after {
        background-color: #B00B13;
      }
    }
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