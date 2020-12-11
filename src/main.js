import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import storeModules from './store/index.js'

createApp(App)
  .use(storeModules)
  .use(router)
  .mount('#app')
