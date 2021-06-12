<template>
    <div class="backdrop">
        <div class="dialog">
            <div class="dialog-title">
                {{ title }}
            </div>
            <div class="dialog-body">
                <slot />
            </div>
            <div class="dialog-actions">
                <slot name="actions" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Dialog extends Vue {
    @Prop() title!: string;
}
</script>

<style lang="scss" scoped>
.backdrop {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(150, 150, 150, .5);
}

.dialog {
    display: flex;
    flex-direction: column;
    min-width: 450px;
    background-color: #FFF;
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0 5px 5px -3px rgb(0 0 0 / 20%), 0 8px 10px 1px rgb(0 0 0 / 14%), 0 3px 14px 2px rgb(0 0 0 / 12%);

    &-title {
        font-weight: bold;
        padding: .5em;
        font-size: 1.25em;
    }

    &-body {
        padding: 10px;
    }

    &-actions {
        display: flex;
        justify-content: flex-end;
        // background-color: #eee;
        padding: .5em;
        gap: .5em;

        button {
            border: 0;
            padding: .5em 1em;
            cursor: pointer;
            border-radius: 3px;
            background: transparent;

            &:hover {
                background-color: rgba(0, 0, 0, .125);
            }

            &.primary {
                border: solid rgba(0, 0, 0, .25) 1px;
            }
        }
    }
}
</style>