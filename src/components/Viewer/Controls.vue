<template>
  <div class="controls">
    <button class="turn-left" @click="$emit('turnLeft')"></button>
    <button class="go-forwards" @click="$emit('goForwards')" :disabled="!canMoveForwards"></button>
    <button class="turn-right" @click="$emit('turnRight')"></button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";


@Component
export default class Sidebar extends Vue {
  @Prop() canMoveForwards!: boolean;
  keyboardListener!: (e: KeyboardEvent) => void;

  created(): void {
    this.keyboardListener = (e: KeyboardEvent) => {
      if (e.key === 'w') return this.$emit('goForwards');
      if (e.key === 'a') return this.$emit('turnLeft');
      if (e.key === 'd') return this.$emit('turnRight');
    };
    document.body.addEventListener('keydown', this.keyboardListener);
  }

  beforeDestroy(): void {
    document.body.removeEventListener('keydown', this.keyboardListener);
  }

}
</script>

<style lang="scss" scoped>
.controls {
  display: flex;
  width: fit-content;
  gap: 10px;

  > button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    overflow: hidden;
    cursor: pointer;
    border-radius: 5px;;
    border: 0;
    background: #999;

    &:hover {
      background-color: #CCC;
    }

    &:disabled {
      opacity: .5;
      pointer-events: none;
    }

    &::before,
    &::after {
        content: '';
        position: absolute;
        display: block;
    }

    &.turn-left {
      &::before {
        width: 125%;
        height: 125%;
        border: solid #000 6px;
        border-radius: 50%;
        top: 20%;
        left: -50%;
        clip-path: polygon(50% 0%, 100% 0%, 100% 50%, 50% 50%);
      }

      &::after {
        left: 10px;
        top: 9px;
        width: 20px;
        height: 30px;
        background-color: #000;
        clip-path: polygon(0% 50%, 100% 0%, 100% 100%);
      }
    }

    &.turn-right {
      &::before {
        width: 125%;
        height: 125%;
        border: solid #000 6px;
        border-radius: 50%;
        top: 20%;
        right: -50%;
        clip-path: polygon(50% 0%, 0% 0%, 0% 50%, 50% 50%);
      }

      &::after {
        right: 10px;
        top: 9px;
        width: 20px;
        height: 30px;
        background-color: #000;
        clip-path: polygon(0% 0%, 100% 50%, 0% 100%);
      }
    }

    &.go-forwards {
      &::before {
        left: 50%;
        width: 6px;
        top: 15%;
        bottom: 10%;
        margin-left: -3px;
        background-color: #000;
      }
      &::after {
        height: 20px;
        background-color: #000;
        left: 30%;
        right: 30%;
        top: 10%;
        transform-origin: top left;
        clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
      }
    }
  }
}
</style>