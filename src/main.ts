import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

const instance = new App({ propsData: { test: 1 } }).$mount('#app');
Object.assign(window, { instance });
