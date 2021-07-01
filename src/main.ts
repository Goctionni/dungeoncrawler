import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

const instance = new App().$mount('#app');
Object.assign(window, { app: instance });
