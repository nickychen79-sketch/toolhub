<template>
  <footer class="bg-primary text-white mt-auto">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        <!-- Brand -->
        <div class="md:col-span-2">
          <div class="flex items-center gap-2.5 mb-4">
            <div class="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 9L12 5L20 9V15L12 19L4 15V9Z" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
              </svg>
            </div>
            <span class="font-bold text-lg">{{ t('common.appName') }}</span>
          </div>
          <p class="text-gray-400 text-sm leading-relaxed max-w-sm">
            {{ t('footer.description') }}
          </p>
          
          <!-- Badges -->
          <div class="flex flex-wrap gap-3 mt-6">
            <span class="px-3 py-1.5 bg-white/10 rounded-full text-xs font-medium">
              {{ t('common.freeForever') }}
            </span>
            <span class="px-3 py-1.5 bg-white/10 rounded-full text-xs font-medium">
              {{ t('common.noLogin') }}
            </span>
            <span class="px-3 py-1.5 bg-white/10 rounded-full text-xs font-medium">
              {{ t('common.browserBased') }}
            </span>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="font-semibold mb-4">{{ t('footer.quickLinks') }}</h4>
          <ul class="space-y-2">
            <li>
              <router-link to="/" class="text-gray-400 hover:text-white text-sm transition-colors">
                {{ t('footer.tools') }}
              </router-link>
            </li>
            <li>
              <router-link to="/video-tools" class="text-gray-400 hover:text-white text-sm transition-colors">
                {{ t('common.videoTools') }}
              </router-link>
            </li>
            <li>
              <router-link to="/pdf-tools" class="text-gray-400 hover:text-white text-sm transition-colors">
                {{ t('common.pdfTools') }}
              </router-link>
            </li>
            <li>
              <router-link to="/converters" class="text-gray-400 hover:text-white text-sm transition-colors">
                {{ t('common.converters') }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Legal -->
        <div>
          <h4 class="font-semibold mb-4">{{ t('footer.legal') }}</h4>
          <ul class="space-y-2">
            <li>
              <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">
                {{ t('footer.privacy') }}
              </a>
            </li>
            <li>
              <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">
                {{ t('footer.terms') }}
              </a>
            </li>
            <li>
              <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">
                {{ t('footer.contact') }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Copyright -->
      <div class="border-t border-white/10 mt-10 pt-8 text-center">
        <p class="text-gray-400 text-sm">
          &copy; {{ new Date().getFullYear() }} {{ t('common.appName') }}. {{ t('footer.copyright') }}
        </p>
      </div>
    </div>

    <!-- SEO Placeholder -->
    <div class="hidden">
      <!-- 
        SEO: Add structured data, meta tags, and sitemap references here
        For production, integrate with a proper SEO plugin or SSR solution
      -->
    </div>
  </footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
