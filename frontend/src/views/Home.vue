<template>
  <div>
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-b from-white to-background py-16 md:py-24">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-[0.03]">
        <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-pattern)"/>
        </svg>
      </div>
      
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight mb-6 animate-fade-up">
          {{ t('home.hero.title') }}
        </h1>
        <p class="text-lg md:text-xl text-secondary max-w-2xl mx-auto leading-relaxed animate-fade-up stagger-1">
          {{ t('home.hero.subtitle') }}
        </p>
      </div>
    </section>

    <!-- Tool Cards Section -->
    <section class="py-12 md:py-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Video Tools Card -->
          <router-link 
            to="/video-tools"
            class="group card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up stagger-1"
          >
            <div class="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-5 shadow-md">
              <Video class="w-7 h-7 text-white" />
            </div>
            <h3 class="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">
              {{ t('home.videoCard.title') }}
            </h3>
            <p class="text-secondary text-sm leading-relaxed mb-4">
              {{ t('home.videoCard.description') }}
            </p>
            <div class="flex items-center text-accent text-sm font-medium">
              {{ t('home.videoCard.button') }}
              <ArrowRight class="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </router-link>

          <!-- PDF Tools Card -->
          <router-link 
            to="/pdf-tools"
            class="group card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up stagger-2"
          >
            <div class="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mb-5 shadow-md">
              <FileText class="w-7 h-7 text-white" />
            </div>
            <h3 class="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">
              {{ t('home.pdfCard.title') }}
            </h3>
            <p class="text-secondary text-sm leading-relaxed mb-4">
              {{ t('home.pdfCard.description') }}
            </p>
            <div class="flex items-center text-accent text-sm font-medium">
              {{ t('home.pdfCard.button') }}
              <ArrowRight class="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </router-link>

          <!-- Converters Card -->
          <router-link 
            to="/converters"
            class="group card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up stagger-3"
          >
            <div class="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-5 shadow-md">
              <ArrowLeftRight class="w-7 h-7 text-white" />
            </div>
            <h3 class="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">
              {{ t('home.converterCard.title') }}
            </h3>
            <p class="text-secondary text-sm leading-relaxed mb-4">
              {{ t('home.converterCard.description') }}
            </p>
            <div class="flex items-center text-accent text-sm font-medium">
              {{ t('home.converterCard.button') }}
              <ArrowRight class="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-12 md:py-16 bg-white border-y border-border/50">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            v-for="(feature, index) in features" 
            :key="index"
            class="text-center animate-fade-up"
            :class="`stagger-${index + 1}`"
          >
            <div class="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <component :is="feature.icon" class="w-6 h-6 text-accent" />
            </div>
            <h4 class="font-semibold text-primary mb-2">{{ feature.title }}</h4>
            <p class="text-secondary text-sm">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Video, FileText, ArrowLeftRight, ArrowRight, Zap, Shield, Gift } from 'lucide-vue-next'

const { t } = useI18n()

const features = computed(() => [
  { 
    icon: Zap, 
    title: t('home.features.fast.title'), 
    desc: t('home.features.fast.desc') 
  },
  { 
    icon: Shield, 
    title: t('home.features.secure.title'), 
    desc: t('home.features.secure.desc') 
  },
  { 
    icon: Gift, 
    title: t('home.features.free.title'), 
    desc: t('home.features.free.desc') 
  }
])
</script>
