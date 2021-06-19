import Vue from 'vue'
import GameView from './components/Viewer/GameView.vue'
import Controls from './components/Viewer/Controls.vue'

import * as helper from '@/util/helper';
import { Facing, MapDefinition } from './types/Map.types';

Vue.config.productionTip = false

Object.assign(window, {
    dungeoncrawler: {
        components: { GameView, Controls },
        util: {
            ...helper,
            createView(container: HTMLElement, map: MapDefinition, x: number, y: number, facing: Facing): GameView {
                const target = document.createElement('div');
                container.appendChild(target);
                return new GameView({ propsData: { map, x, y, facing }}).$mount(target);
            },
            createControls(container: HTMLElement, canMoveForwards: boolean): Controls {
                const target = document.createElement('div');
                container.appendChild(target);
                return new Controls({ propsData: { canMoveForwards }}).$mount(target);
            }
        },
    },
});
