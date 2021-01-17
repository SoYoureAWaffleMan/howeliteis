import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import storeModules from './store/index.js'

const app = createApp(App)
app.use(storeModules)
app.use(router)
app.mount('#app')
