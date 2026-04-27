<template>
  <div class="py-8 md:py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-primary mb-2 animate-fade-up">
          {{ t('video.title') }}
        </h1>
        <p class="text-secondary animate-fade-up stagger-1">
          {{ t('video.description') }}
        </p>
      </div>

      <!-- Tool Tabs -->
      <div class="flex gap-2 mb-8 overflow-x-auto pb-2 animate-fade-up stagger-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all"
          :class="activeTab === tab.id 
            ? 'bg-accent text-white shadow-md' 
            : 'bg-white text-secondary hover:bg-gray-50 border border-border'"
        >
          <component :is="tab.icon" class="w-4 h-4 inline mr-2" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Video Downloader -->
      <div v-show="activeTab === 'downloader'" class="card p-6 md:p-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center">
            <Download class="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-primary">{{ t('video.downloader.title') }}</h2>
            <p class="text-sm text-secondary">{{ t('video.downloader.description') }}</p>
          </div>
        </div>

        <!-- URL Input -->
        <div class="space-y-4">
          <div class="relative">
            <input
              v-model="videoUrl"
              type="text"
              :placeholder="t('video.downloader.placeholder')"
              class="input-field pr-12"
              @keyup.enter="fetchVideo"
            />
            <button 
              @click="fetchVideo"
              :disabled="isLoading || !videoUrl"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
            >
              <Search class="w-4 h-4" />
            </button>
          </div>

          <!-- Supported Platforms -->
          <div class="flex flex-wrap gap-2">
            <span v-for="platform in platforms" :key="platform" class="px-3 py-1 bg-gray-100 rounded-full text-xs text-secondary">
              {{ platform }}
            </span>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="mt-8 text-center">
          <div class="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-secondary">{{ t('video.downloader.fetching') }}</p>
        </div>

        <!-- Video Preview -->
        <div v-if="videoData && !isLoading" class="mt-8 p-4 bg-gray-50 rounded-xl">
          <div class="flex gap-4 mb-4">
            <img 
              v-if="videoData.thumbnail" 
              :src="videoData.thumbnail" 
              class="w-32 h-20 object-cover rounded-lg"
              alt="Thumbnail"
            />
            <div class="flex-1">
              <h3 class="font-semibold text-primary mb-1 line-clamp-2">{{ videoData.title }}</h3>
              <p class="text-sm text-secondary">{{ videoData.duration }}</p>
            </div>
          </div>
          
          <!-- Quality Options -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="format in videoData.formats"
              :key="format.quality"
              @click="downloadVideo(format)"
              class="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
            >
              <Download class="w-4 h-4" />
              {{ format.quality }}
            </button>
          </div>
        </div>
      </div>

      <!-- Video Compressor -->
      <div v-show="activeTab === 'compressor'" class="card p-6 md:p-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
            <Minimize2 class="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-primary">{{ t('video.compressor.title') }}</h2>
            <p class="text-sm text-secondary">{{ t('video.compressor.description') }}</p>
          </div>
        </div>

        <!-- Upload Zone -->
        <div
          class="upload-zone"
          :class="{ 'active': isDragging }"
          @dragenter.prevent="onDragEnter"
          @dragover.prevent
          @dragleave.prevent="onDragLeave"
          @drop.prevent="onDrop"
          @click="triggerFileInput"
        >
          <input
            ref="fileInput"
            type="file"
            accept="video/*"
            class="hidden"
            @change="handleFiles($event.target.files)"
          />
          <Upload class="w-10 h-10 text-secondary mx-auto mb-3" />
          <p class="text-primary font-medium mb-1">{{ t('common.dragDrop') }}</p>
          <p class="text-sm text-secondary">{{ t('common.orBrowse') }}</p>
          <p class="text-xs text-secondary mt-3">{{ t('common.supportedFormats') }}: MP4, MOV, AVI, WebM | {{ t('common.maxFileSize') }}: 500MB</p>
        </div>

        <!-- File List -->
        <div v-if="files.length > 0" class="mt-6 space-y-3">
          <div 
            v-for="(file, index) in files" 
            :key="index"
            class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
          >
            <div class="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Film class="w-6 h-6 text-accent" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-primary truncate">{{ file.name }}</p>
              <p class="text-sm text-secondary">{{ formatBytes(file.size) }}</p>
            </div>
            <button @click="removeFile(index)" class="btn-icon">
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Quality Options -->
        <div v-if="files.length > 0" class="mt-6">
          <label class="block text-sm font-medium text-primary mb-3">{{ t('video.compressor.quality') }}</label>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="option in qualityOptions"
              :key="option.value"
              @click="selectedQuality = option.value"
              class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              :class="selectedQuality === option.value
                ? 'bg-accent text-white'
                : 'bg-gray-100 text-secondary hover:bg-gray-200'"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Compress Button -->
        <button 
          v-if="files.length > 0"
          @click="compressVideo"
          :disabled="isCompressing"
          class="btn-primary w-full mt-6 flex items-center justify-center gap-2"
        >
          <Loader2 v-if="isCompressing" class="w-5 h-5 animate-spin" />
          <Minimize2 v-else class="w-5 h-5" />
          {{ isCompressing ? t('common.processing') : t('video.compressor.compress') }}
        </button>

        <!-- Progress -->
        <div v-if="isCompressing" class="mt-6">
          <div class="progress-bar">
            <div class="progress-bar-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <p class="text-sm text-secondary text-center mt-2">{{ progress }}%</p>
        </div>
      </div>

      <!-- Audio Extractor -->
      <div v-show="activeTab === 'extractor'" class="card p-6 md:p-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <Music class="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-primary">{{ t('video.extractor.title') }}</h2>
            <p class="text-sm text-secondary">{{ t('video.extractor.description') }}</p>
          </div>
        </div>

        <!-- Upload Zone -->
        <div
          class="upload-zone"
          :class="{ 'active': isDraggingAudio }"
          @dragenter.prevent="isDraggingAudio = true"
          @dragover.prevent
          @dragleave.prevent="isDraggingAudio = false"
          @drop.prevent="handleAudioDrop"
          @click="triggerAudioInput"
        >
          <input
            ref="audioFileInput"
            type="file"
            accept="video/*"
            class="hidden"
            @change="handleAudioFiles($event.target.files)"
          />
          <Music class="w-10 h-10 text-secondary mx-auto mb-3" />
          <p class="text-primary font-medium mb-1">{{ t('common.dragDrop') }}</p>
          <p class="text-sm text-secondary">{{ t('common.orBrowse') }}</p>
        </div>

        <!-- Audio File -->
        <div v-if="audioFile" class="mt-6 p-4 bg-gray-50 rounded-xl flex items-center gap-4">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Music class="w-6 h-6 text-purple-500" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-primary">{{ audioFile.name }}</p>
            <p class="text-sm text-secondary">{{ formatBytes(audioFile.size) }}</p>
          </div>
        </div>

        <!-- Extract Button -->
        <button 
          v-if="audioFile"
          @click="extractAudio"
          :disabled="isExtracting"
          class="btn-primary w-full mt-6 flex items-center justify-center gap-2"
        >
          <Loader2 v-if="isExtracting" class="w-5 h-5 animate-spin" />
          <Music v-else class="w-5 h-5" />
          {{ isExtracting ? t('common.processing') : t('video.extractor.extract') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, markRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import { useFileHandler } from '@/composables/useFileHandler'
import { 
  Download, Search, Minimize2, Upload, Film, Music, Loader2, 
  Video, X, Scissors
} from 'lucide-vue-next'
import axios from 'axios'

const { t } = useI18n()
const toast = useToast()

const activeTab = ref('downloader')
const tabs = [
  { id: 'downloader', label: t('video.downloader.title'), icon: markRaw(Download) },
  { id: 'compressor', label: t('video.compressor.title'), icon: markRaw(Minimize2) },
  { id: 'extractor', label: t('video.extractor.title'), icon: markRaw(Music) }
]

const platforms = ['TikTok', 'YouTube', 'Douyin', 'Kuaishou', 'REDnote', 'WeChat']

// Downloader state
const videoUrl = ref('')
const isLoading = ref(false)
const videoData = ref(null)

// Compressor state
const fileInput = ref(null)
const { files, isDragging, formatBytes, handleFiles, removeFile, onDragEnter, onDragLeave, onDrop } = useFileHandler(500)
const selectedQuality = ref('medium')
const isCompressing = ref(false)
const progress = ref(0)

// Extractor state
const audioFileInput = ref(null)
const audioFile = ref(null)
const isDraggingAudio = ref(false)
const isExtracting = ref(false)

const qualityOptions = [
  { value: 'high', label: t('video.compressor.high') },
  { value: 'medium', label: t('video.compressor.medium') },
  { value: 'low', label: t('video.compressor.low') }
]

const triggerFileInput = () => fileInput.value?.click()
const triggerAudioInput = () => audioFileInput.value?.click()

const fetchVideo = async () => {
  if (!videoUrl.value) return
  
  isLoading.value = true
  videoData.value = null
  
  try {
    // Call backend API
    const response = await axios.post('/api/video/fetch', { url: videoUrl.value })
    videoData.value = response.data.data
    toast.success(t('common.success'))
  } catch (error) {
    toast.error(t('errors.fetchFailed'))
  } finally {
    isLoading.value = false
  }
}

const downloadVideo = (format) => {
  // Open video URL in new tab or trigger download
  window.open(format.url, '_blank')
}

const compressVideo = async () => {
  if (files.value.length === 0) return
  
  isCompressing.value = true
  progress.value = 0
  
  // Simulate compression progress
  const interval = setInterval(() => {
    progress.value += Math.random() * 10
    if (progress.value >= 100) {
      progress.value = 100
      clearInterval(interval)
      setTimeout(() => {
        isCompressing.value = false
        toast.success(t('common.success'))
      }, 500)
    }
  }, 200)
}

const handleAudioFiles = (fileList) => {
  if (fileList?.length) {
    audioFile.value = fileList[0]
  }
}

const handleAudioDrop = (event) => {
  isDraggingAudio.value = false
  const { files: droppedFiles } = event.dataTransfer
  if (droppedFiles?.length) {
    audioFile.value = droppedFiles[0]
  }
}

const extractAudio = async () => {
  if (!audioFile.value) return
  
  isExtracting.value = true
  
  // Simulate extraction
  setTimeout(() => {
    isExtracting.value = false
    toast.success(t('common.success'))
  }, 2000)
}
</script>
