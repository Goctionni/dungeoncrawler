<template>
    <Dialog :title="title">
        {{ message }}
        <input v-model="model">
        <template v-slot:actions>
            <button type="button" @click="$emit('btn', false)">Cancel</button>
            <button type="button" class="primary" @click="$emit('btn', model)">Ok</button>
        </template>
    </Dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Dialog from './Dialog.vue';

@Component({
    components: {
        Dialog,
    }
})
export default class Prompt extends Vue {
    @Prop() title!: string;
    @Prop() message!: string;
    @Prop() initialValue!: string;

    model = '';

    created(): void {
        this.model = this.initialValue;
    }
}
</script>

<style scoped lang="scss">
input {
    display: block;
    width: calc(100% - 10px);
    margin: 1em 5px 0;
    padding: .25em .5em;
}
</style>