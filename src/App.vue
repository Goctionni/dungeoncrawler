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
import { Component, Vue } from 'vue-property-decorator';

import { Map } from './Map.types';
import Editor from './components/Editor/Editor.vue';
import Viewer from './components/Viewer/Viewer.vue';

type AppState = 'editor' | 'viewer';

@Component({
  components: {
    Editor,
    Viewer,
  },
})
export default class App extends Vue {
  state: AppState = 'editor';
  map: Map | null = null;

  updateMap(map: Map): void {
    this.map = map;
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
