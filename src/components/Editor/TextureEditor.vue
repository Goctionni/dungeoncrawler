<template>
    <div class="overlay">
        <div class="dialog" @input="error = ''">
            <div class="dialog-head">
                {{ titleText }}
                <button type="button" class="close" @click="cancel()"></button>
            </div>
            <div class="dialog-body">
                <div class="error" v-if="error">{{ error }}</div>
                <label class="name">
                    Name:
                    <input type="text" v-model="nameModel" />
                </label>
                <h3>CSS Properties</h3>
                <div class="properties">
                    <div class="property" v-for="(property, index) in properties" :key="`cssproperty-${index}`">
                        <input type="text" v-model="property.name" class="property-name">
                        <input type="text" v-model="property.value" class="property-value">
                        <button class="remove-property" @click="removeProperty(property)">&times;</button>
                    </div>
                </div>
                <button type="button" class="add-property" @click="addProperty()">Add new property</button>
            </div>
            <div class="dialog-footer">
                <button type="button" @click="cancel()">Cancel</button>
                <button type="button" @click="save()">Save</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { CSSProperty, Texture } from '@/types/Texture.types';
import { Component, Vue, Prop, InjectReactive } from 'vue-property-decorator';

@Component
export default class TextureEditor extends Vue {
    @Prop() textureName!: string;
    @InjectReactive() textureList!: Texture[];
    nameModel = '';
    error = '';
    properties: CSSProperty[] = [];

    get titleText(): string {
        return this.textureName ? `Edit ${this.textureName}` : 'New texture';
    }

    removeProperty(property: CSSProperty): void {
        this.properties = this.properties.filter((curProp) => curProp !== property);
    }

    addProperty(): void {
        this.properties.push({ name: '', value: '' });
    }

    cancel(): void {
        this.$emit('close');
    }

    save(): void {
        if (!this.nameModel.trim()) {
            this.error = 'Texture must have a name';
            return;
        }
        if (this.properties.some((property) => !property.name)) {
            this.error = 'Cannot have css properties without a name';
            return;
        }
        // TODO: I should make the name 'safe'
        this.$emit('save', { name: this.nameModel.trim(), properties: this.properties });
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
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, .5);
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
}

.dialog {
    display: flex;
    flex-direction: column;
    padding: 5px;
    gap: 10px;
    min-width: 400px;
    background-color: #EEE;

    .dialog-head {
        display: flex;
        gap: 10px;
        justify-content: space-between;
        padding: 5px;
        background-color: #369;
        color: #FFF;
        font-size: 18px;
        font-weight: bold;

        .close {
            &::before { content: '\d7'; }

            display: flex;
            justify-content: center;
            align-items: center;
            width: 20px;
            height: 20px;
            font-size: 20px;
            line-height: 1;
            border: 0;
            background-color: #FFF;
            color: #000;
            cursor: pointer;

            &:hover {
                background-color: #000;
                color: #FFF;
            }
        }
    }

    .dialog-body {
        max-height: calc(100vh - 120px);
        padding: 5px;
        overflow: auto;
    }

    .dialog-footer {
        display: flex;
        gap: 10px;
        justify-content: flex-end;

        button {
            border: 0;
            padding: .5em 1em;
            cursor: pointer;
            font-weight: bold;
            background-color: transparent;
            border-radius: 4px;

            &:hover {
                background-color: rgba(0, 0, 0, .2);
            }
        }
    }
}

.name {
    input {
        display: block;
        width: 100%;
        padding: .25em .5em;
        border-radius: 4px;
        border: solid #CCC 1px;
    }
}

h3 {
    font-size: 14px;
    margin: .5em 0;
}

.properties {
    display: flex;
    flex-direction: column;
    gap: 5px;

    .property {
        display: flex;
        gap: 5px;

        input {
            flex: 1;
            height: 20px;
            border: solid #CCC 1px;
        }

        button {
            border: 0;
            background-color: #666;
            color: #FFF;
            font-size: 20px;
            font-weight: bold;
            height: 20px;
            width: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }
    }
}

.error {
    border: solid #B00B13 1px;
    background-color: #FEE;
    padding: .25em 5px;
    color: #60060b;
    margin: -5px -5px .5em;
}

.add-property {
    width: 100%;
    margin-top: 5px;
    border: solid #CCC 1px;
    background-color: #FFF;
    padding: .5em 1em;
    cursor: pointer;

    &:hover {
        background-color: rgba(0, 0, 0, .2);
        color: #FFF;
    }
}
</style>