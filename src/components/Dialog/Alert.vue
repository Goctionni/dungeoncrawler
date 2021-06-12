<template>
    <Dialog :title="title">
        {{ message }}
        <template v-slot:actions>
            <button type="button" class="primary" @click="$emit('btn')">Ok</button>
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
export default class Alert extends Vue {
    @Prop() title!: string;
    @Prop() message!: string;
}
</script>
