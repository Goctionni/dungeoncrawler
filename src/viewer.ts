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
            createView(container: HTMLElement, map: MapDefinition, x?: number, y?: number, facing?: Facing): GameView {
                const target = document.createElement('div');
                container.appendChild(target);
                if (x === undefined) x = map.start.x;
                if (y === undefined) y = map.start.y;
                if (facing === undefined) facing = map.start.direction;
                return new GameView({ propsData: {
                    map,
                    x: x ?? map.start.x,
                    y: y ?? map.start.y,
                    facing: facing ?? map.start.direction,
                }}).$mount(target);
            },
            createControls(container: HTMLElement, canMoveForwards: boolean): Controls {
                const target = document.createElement('div');
                container.appendChild(target);
                return new Controls({ propsData: { canMoveForwards }}).$mount(target);
            }
        },
    },
});
