import { Texture } from "@/types/Texture.types";

export const DEFAULT_TEXTURES: Texture[] = [
    { name: 'floor1', properties: [{ name: 'background-image', value: `url('./textures/floor_01.png')` }, { name: 'background-size', value: `contain` }, { name: 'background-repeat', value: `repeat` }]},
    { name: 'ground', properties: [{ name: 'background-image', value: `url('./textures/GroundF.png')` }, { name: 'background-size', value: `contain` }, { name: 'background-repeat', value: `repeat` }]},
    { name: 'wall1', properties: [{ name: 'background-image', value: `url('./textures/brks_2.png')` }, { name: 'background-size', value: `contain` }, { name: 'background-repeat', value: `repeat` }]},
    { name: 'wall2', properties: [{ name: 'background-image', value: `url('./textures/brks_1.png')` }, { name: 'background-size', value: `contain` }, { name: 'background-repeat', value: `repeat` }]},
    { name: 'wall3', properties: [{ name: 'background-image', value: `url('./textures/bkred_1.png')` }, { name: 'background-size', value: `contain` }, { name: 'background-repeat', value: `repeat` }]},
    { name: 'wall4', properties: [{ name: 'background-image', value: `url('./textures/brks_8.png')` }, { name: 'background-size', value: `contain` }, { name: 'background-repeat', value: `repeat` }]},
    { name: 'metal', properties: [{ name: 'background-image', value: `url('./textures/wall52_1.png')` }, { name: 'background-size', value: `contain` }, { name: 'background-repeat', value: `repeat` }]},
    { name: 'ph1', properties: [{ name: 'background-color', value: '#f00' }] },
    { name: 'ph2', properties: [{ name: 'background-color', value: '#0f0' }] },
    { name: 'ph3', properties: [{ name: 'background-color', value: '#00f' }] },
    { name: 'ph4', properties: [{ name: 'background-color', value: '#ff0' }] },
    { name: 'ph5', properties: [{ name: 'background-color', value: '#f0f' }] },
    { name: 'ph6', properties: [{ name: 'background-color', value: '#0ff' }] },
    { name: 'ph7', properties: [{ name: 'background-color', value: '#999' }] },    
];