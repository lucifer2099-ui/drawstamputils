import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import i18n from './i18n'
import { DrawStampUtils } from './DrawStampUtils'

(window as any).DrawStampUtils = DrawStampUtils

const app = createApp(App)
app.use(i18n)
app.mount('#app')
