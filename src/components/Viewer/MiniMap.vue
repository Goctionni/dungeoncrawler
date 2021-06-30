<template>
    <div class="minimap" :style="{ ['--tdc-mm-cell-size']: `${cellSize}px` }">
        <template v-if="isMounted">
            <div class="mm-tile-row" v-for="(row, y) in rows" :key="`tdc-mm-row-${y}`">
                <div class="mm-tile-cell" v-for="(tile, x) in row" :key="`tdc-mm-cell-${x}-${y}`">
                    <div :class="`mm-tile-cell-face mm-tile-cell-face--${face}`" v-for="face in tile" :key="`tdc-mm-face-${face}-${x}-${y}`"></div>
                    <div v-if="player && (player.x - boundaries.x.min) === x && (player.y - boundaries.y.min) === y" :class="`tdc-mm-player tdc-mm-player--${player.facing}`"></div>
                </div>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { Pos, Face, FacePos, faces as allFaces } from '@/types/Map.types';
import { IMiniMap } from '@/util/map-helper';
import { Component, Prop, Vue } from 'vue-property-decorator';

type MiniTile = Face[];

interface Boundaries {
    x: {
        min: number;
        max: number;
    };
    y: {
        min: number;
        max: number;
    };
}

const matchesPos = (pos: Pos, x: number, y: number): boolean => {
    return pos.x === x && pos.y === y;
}

@Component
export default class MiniMap extends Vue implements IMiniMap {
    @Prop() faces!: FacePos[];
    @Prop() player!: FacePos;
    observer!: ResizeObserver;

    size: Pos = { x: 200, y: 200 };
    isMounted = false;

    get boundaries(): Boundaries {
        const { faces } = this;
        let xMin = Number.MAX_SAFE_INTEGER;
        let yMin = Number.MAX_SAFE_INTEGER;
        let xMax = 0;
        let yMax = 0;
        for (const face of faces) {
            xMin = Math.min(xMin, face.x);
            yMin = Math.min(yMin, face.y);
            xMax = Math.max(xMax, face.x);
            yMax = Math.max(yMax, face.y);
        }
        return {
            x: { min: xMin, max: xMax },
            y: { min: yMin, max: yMax },
        };
    }

    get cellSize(): number {
        const { boundaries, size } = this;
        const numRows = boundaries.y.max - boundaries.y.min + 1;
        const numCols = boundaries.x.max - boundaries.x.min + 1;
        const maxHeight = Math.floor(size.y / numRows);
        const maxWidth = Math.floor(size.x / numCols);

        return Math.min(maxWidth, maxHeight);
    }

    get rows(): MiniTile[][] {
        const { boundaries, faces } = this;
        const rows: MiniTile[][] = [];
        for (let y = boundaries.y.min; y <= boundaries.y.max; y++) {
            const row: MiniTile[] = [];
            for (let x = boundaries.x.min; x <= boundaries.x.max; x++) {
                const posFaces = faces.filter((f) => matchesPos(f, x, y));
                const tile: MiniTile = [];
                for (const face of allFaces) {
                    if (posFaces.some((w) => w.facing === face)) tile.push(face);
                }
                row.push(tile);
            }
            rows.push(row);
        }
        return rows;
    }

    updateSize(): void {
        const parent = this.$el.parentElement as HTMLElement;
        const parentComputedStyle = window.getComputedStyle(parent);
        const xPadding = parseFloat(parentComputedStyle.paddingLeft.replace('px', '')) + parseFloat(parentComputedStyle.paddingRight.replace('px', ''));
        const yPadding = parseFloat(parentComputedStyle.paddingTop.replace('px', '')) + parseFloat(parentComputedStyle.paddingBottom.replace('px', ''));
        this.size.x = parent.clientWidth ? (parent.clientWidth - xPadding) : 200;
        this.size.y = parent.clientHeight ? (parent.clientHeight - yPadding) : this.size.x;
    }

    mounted(): void {
        const parent = this.$el.parentElement as HTMLElement;
        this.updateSize();
        this.observer = new ResizeObserver(() => this.updateSize());
        this.observer.observe(parent);
        this.isMounted = true;
    }

    beforeDestroy(): void {
        this.observer?.disconnect();
    }
}
</script>

<style lang="scss" scoped>
.minimap {
    background-color: #000;
    display: flex;
    justify-content: center;
    flex-direction: column;
}

.mm-tile-row {
    display: flex;
    justify-content: center;
    height: var(--tdc-mm-cell-size);
}

.mm-tile-cell {
    position: relative;
    width: var(--tdc-mm-cell-size);
    height: var(--tdc-mm-cell-size);
}

.mm-tile-cell-face {
    position: absolute;
    background-color: #FFF;

    &--floor {
        inset: 0;
        background-color: #999;
    }

    &--north {
        inset: 0 0 90%;
    }

    &--east {
        inset: 0 0 0 90%;
    }

    &--south {
        inset: 90% 0 0;
    }

    &--west {
        inset: 0 90% 0 0;
    }
}

.tdc-mm-player {
    position: absolute;
    inset: 15%;
    background-color: #F00;
    transition: clip-path 0.3s ease-in-out;

    &--north {
        clip-path: polygon(0% 100%, 50% 0%, 100% 100%);
    }
    &--east {
        clip-path: polygon(0% 0%, 100% 50%, 0% 100%);
    }
    &--south {
        clip-path: polygon(0% 0%, 50% 100%, 100% 0%);
    }
    &--west {
        clip-path: polygon(100% 0%, 0% 50%, 100% 100%);
    }
}
</style>