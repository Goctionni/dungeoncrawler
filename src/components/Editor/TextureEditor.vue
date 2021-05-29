<template>
    <div class="overlay">
        <div class="dialog">
            <div class="dialog-title">
                {{ titleText }}
                <button type="button" class="close"></button>
            </div>
            <div class="dialog-body"></div>
            <div class="dialog-footer">
                <button type="button" @click="cancel()">Cancel</button>
                <button type="button" @click="save()">Save</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { CSSProperty, Texture } from '@/Texture.types';
import { Component, Vue, Prop, InjectReactive } from 'vue-property-decorator';

@Component
export default class Editor extends Vue {
    @Prop() textureName!: string;
    @InjectReactive() textureList!: Texture[];
    nameModel = '';
    properties: CSSProperty[] = [];

    get titleText(): string {
        return this.textureName ? `Edit ${this.textureName}` : 'New texture';
    }

    cancel(): void {
        this.$emit('close');
    }

    save(): void {
        this.$emit('save', { name: this.nameModel, properties: this.properties });
        this.$emit('close');
    }

    created(): void {
        if (this.textureName) {
            this.nameModel = this.textureName;
            this.properties = this.textureList
                .find((texture) => texture.name === this.textureName)
                ?.properties.map((property) => ({ ...property }))
                || [];
        }
    }
}
</script>

<style lang="scss" scoped>

</style>