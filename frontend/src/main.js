import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import './assets/main.css'

import en from './i18n/locales/en.json'
import es from './i18n/locales/es.json'
import fr from './i18n/locales/fr.json'
import de from './i18n/locales/de.json'
import pt from './i18n/locales/pt.json'
import ja from './i18n/locales/ja.json'
import ko from './i18n/locales/ko.json'
import zh from './i18n/locales/zh.json'

const savedLocale = localStorage.getItem('locale') || 'en'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: { en, es, fr, de, pt, ja, ko, zh }
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.mount('#app')
