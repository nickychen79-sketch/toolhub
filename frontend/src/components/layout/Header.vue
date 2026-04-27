<template>
  <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2.5 group">
          <div class="w-9 h-9 bg-accent rounded-lg flex items-center justify-center shadow-sm">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 9L12 5L20 9V15L12 19L4 15V9Z" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
            </svg>
          </div>
          <span class="font-bold text-lg text-primary group-hover:text-accent transition-colors">ToolHub</span>
        </router-link>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-1">
          <router-link 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path"
            class="px-4 py-2 text-sm font-medium text-secondary hover:text-primary rounded-lg hover:bg-gray-100 transition-all"
            :class="{ 'text-primary bg-gray-100': isActive(item.path) }"
          >
            {{ item.label }}
          </router-link>
        </nav>

        <!-- Language Selector -->
        <div class="flex items-center gap-3">
          <div class="relative">
            <button 
              @click="showLangMenu = !showLangMenu"
              class="flex items-center gap-2 px-3 py-2 text-sm text-secondary hover:text-primary rounded-lg hover:bg-gray-100 transition-all"
            >
              <Globe class="w-4 h-4" />
              <span class="hidden sm:inline">{{ currentLangName }}</span>
              <ChevronDown class="w-4 h-4" :class="{ 'rotate-180': showLangMenu }" />
            </button>
            
            <!-- Language Dropdown -->
            <Transition name="dropdown">
              <div v-if="showLangMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-border py-2 z-50">
                <button
                  v-for="lang in languages"
                  :key="lang.code"
                  @click="changeLanguage(lang.code)"
                  class="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors"
                  :class="{ 'text-accent font-medium': locale === lang.code }"
                >
                  {{ lang.name }}
                </button>
              </div>
            </Transition>
          </div>

          <!-- Mobile Menu Button -->
          <button 
            @click="showMobileMenu = true"
            class="md:hidden btn-icon"
          >
            <Menu class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition name="slide">
      <div v-if="showMobileMenu" class="fixed inset-0 z-50 md:hidden">
        <div class="absolute inset-0 bg-black/50" @click="showMobileMenu = false"></div>
        <div class="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl">
          <div class="flex items-center justify-between p-4 border-b border-border">
            <span class="font-bold text-lg">Menu</span>
            <button @click="showMobileMenu = false" class="btn-icon">
              <X class="w-5 h-5" />
            </button>
          </div>
          <nav class="p-4 space-y-1">
            <router-link 
              v-for="item in navItems" 
              :key="item.path"
              :to="item.path"
              @click="showMobileMenu = false"
              class="block px-4 py-3 text-sm font-medium rounded-lg transition-colors"
              :class="isActive(item.path) ? 'bg-gray-100 text-primary' : 'text-secondary hover:bg-gray-50'"
            >
              {{ item.label }}
            </router-link>
          </nav>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Globe, ChevronDown, Menu, X } from 'lucide-vue-next'

const route = useRoute()
const { locale, t } = useI18n()

const showLangMenu = ref(false)
const showMobileMenu = ref(false)

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pt', name: 'Português' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'zh', name: '中文' }
]

const navItems = computed(() => [
  { path: '/', label: t('common.home') },
  { path: '/video-tools', label: t('common.videoTools') },
  { path: '/pdf-tools', label: t('common.pdfTools') },
  { path: '/converters', label: t('common.converters') }
])

const currentLangName = computed(() => {
  return languages.find(l => l.code === locale.value)?.name || 'English'
})

const isActive = (path) => {
  return route.path === path
}

const changeLanguage = (code) => {
  locale.value = code
  localStorage.setItem('locale', code)
  showLangMenu.value = false
}
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}
.slide-enter-from > div:last-child,
.slide-leave-to > div:last-child {
  transform: translateX(100%);
}
</style>
