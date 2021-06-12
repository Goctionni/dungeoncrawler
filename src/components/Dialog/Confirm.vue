<template>
    <Dialog :title="title">
        {{ message }}
        <template v-slot:actions>
            <button
                v-for="btn in buttonObjects"
                :key="btn.text"
                type="button"
                :class="{ primary: btn.primary }"
                v-text="btn.text"
                @click="$emit('btn', btn.text)"
            />
        </template>
    </Dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Dialog from './Dialog.vue';

interface Button {
    text: string;
    primary: boolean;
}

@Component({
    components: {
        Dialog,
    }
})
export default class Confirm extends Vue {
    @Prop() title!: string;
    @Prop() message!: string;
    @Prop({ default: ['Cancel', '!Ok']}) buttons!: string[];

    get buttonObjects(): Button[] {
        return this.buttons?.map((btn) => ({
            text: btn.startsWith('!') ? btn.slice(1) : btn,
            primary: btn.startsWith('!'),
        })) || [];
    }
}
</script>
