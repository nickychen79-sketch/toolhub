<template>
  <div class="py-8 md:py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-primary mb-2 animate-fade-up">
          {{ t('pdf.title') }}
        </h1>
        <p class="text-secondary animate-fade-up stagger-1">
          {{ t('pdf.description') }}
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

      <!-- PDF Converter -->
      <div v-show="activeTab === 'converter'" class="card p-6 md:p-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
            <RefreshCw class="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-primary">{{ t('pdf.converter.title') }}</h2>
            <p class="text-sm text-secondary">{{ t('pdf.converter.description') }}</p>
          </div>
        </div>

        <!-- Conversion Type -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-primary mb-3">{{ t('pdf.converter.selectType') }}</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              @click="conversionType = 'toPdf'"
              class="p-4 rounded-xl border-2 transition-all text-left"
              :class="conversionType === 'toPdf' 
                ? 'border-accent bg-accent/5' 
                : 'border-border hover:border-accent/50'"
            >
              <FileUp class="w-6 h-6 mb-2" :class="conversionType === 'toPdf' ? 'text-accent' : 'text-secondary'" />
              <span class="font-medium" :class="conversionType === 'toPdf' ? 'text-accent' : 'text-primary'">
                {{ t('pdf.converter.toPdf') }}
              </span>
            </button>
            <button
              @click="conversionType = 'fromPdf'"
              class="p-4 rounded-xl border-2 transition-all text-left"
              :class="conversionType === 'fromPdf' 
                ? 'border-accent bg-accent/5' 
                : 'border-border hover:border-accent/50'"
            >
              <FileDown class="w-6 h-6 mb-2" :class="conversionType === 'fromPdf' ? 'text-accent' : 'text-secondary'" />
              <span class="font-medium" :class="conversionType === 'fromPdf' ? 'text-accent' : 'text-primary'">
                {{ t('pdf.converter.fromPdf') }}
              </span>
            </button>
          </div>
        </div>

        <!-- Upload Zone -->
        <div
          class="upload-zone"
          :class="{ 'active': isDraggingPdf }"
          @dragenter.prevent="isDraggingPdf = true"
          @dragover.prevent
          @dragleave.prevent="isDraggingPdf = false"
          @drop.prevent="handlePdfDrop"
          @click="triggerPdfInput"
        >
          <input
            ref="pdfInput"
            type="file"
            :accept="conversionType === 'toPdf' ? '.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png' : '.pdf'"
            class="hidden"
            @change="handlePdfFiles($event.target.files)"
          />
          <Upload class="w-10 h-10 text-secondary mx-auto mb-3" />
          <p class="text-primary font-medium mb-1">{{ t('common.dragDrop') }}</p>
          <p class="text-sm text-secondary">{{ t('common.orBrowse') }}</p>
          <p class="text-xs text-secondary mt-3">
            {{ t('common.supportedFormats') }}: 
            {{ conversionType === 'toPdf' ? 'DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG' : 'PDF' }}
          </p>
        </div>

        <!-- File Info -->
        <div v-if="pdfFile" class="mt-6 p-4 bg-gray-50 rounded-xl flex items-center gap-4">
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <FileText class="w-6 h-6 text-red-500" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-primary">{{ pdfFile.name }}</p>
            <p class="text-sm text-secondary">{{ formatBytes(pdfFile.size) }}</p>
          </div>
          <button @click="convertPdf" :disabled="isConverting" class="btn-primary">
            {{ isConverting ? t('common.processing') : t('pdf.converter.title') }}
          </button>
        </div>
      </div>

      <!-- PDF Merger -->
      <div v-show="activeTab === 'merger'" class="card p-6 md:p-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Merge class="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-primary">{{ t('pdf.merger.title') }}</h2>
            <p class="text-sm text-secondary">{{ t('pdf.merger.description') }}</p>
          </div>
        </div>

        <!-- Upload Zone -->
        <div
          class="upload-zone"
          :class="{ 'active': isDraggingMerger }"
          @dragenter.prevent="isDraggingMerger = true"
          @dragover.prevent
          @dragleave.prevent="isDraggingMerger = false"
          @drop.prevent="handleMergerDrop"
          @click="triggerMergerInput"
        >
          <input
            ref="mergerInput"
            type="file"
            accept=".pdf"
            multiple
            class="hidden"
            @change="handleMergerFiles($event.target.files)"
          />
          <Merge class="w-10 h-10 text-secondary mx-auto mb-3" />
          <p class="text-primary font-medium mb-1">{{ t('common.dragDrop') }}</p>
          <p class="text-sm text-secondary">{{ t('common.orBrowse') }}</p>
          <p class="text-text-xs text-secondary mt-3">{{ t('common.supportedFormats') }}: PDF</p>
        </div>

        <!-- File List with Reorder -->
        <div v-if="mergeFiles.length > 0" class="mt-6 space-y-3">
          <p class="text-sm text-secondary">{{ t('pdf.merger.dragToReorder') }}</p>
          <div
            v-for="(file, index) in mergeFiles"
            :key="index"
            class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl cursor-move"
            draggable="true"
            @dragstart="dragStart(index)"
            @dragover.prevent
            @drop="dropFile(index)"
          >
            <GripVertical class="w-5 h-5 text-secondary" />
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FileText class="w-5 h-5 text-red-500" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-primary truncate">{{ file.name }}</p>
              <p class="text-sm text-secondary">{{ formatBytes(file.size) }}</p>
            </div>
            <span class="px-2 py-1 bg-white rounded text-xs font-medium text-secondary">
              {{ index + 1 }}
            </span>
            <button @click.stop="removeMergeFile(index)" class="btn-icon">
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Merge Button -->
        <button 
          v-if="mergeFiles.length > 1"
          @click="mergePdfs"
          :disabled="isMerging"
          class="btn-primary w-full mt-6 flex items-center justify-center gap-2"
        >
          <Loader2 v-if="isMerging" class="w-5 h-5 animate-spin" />
          <Merge v-else class="w-5 h-5" />
          {{ isMerging ? t('common.processing') : t('pdf.merger.merge') }}
        </button>
      </div>

      <!-- PDF Compressor -->
      <div v-show="activeTab === 'compressor'" class="card p-6 md:p-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
            <Archive class="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-primary">{{ t('pdf.compressor.title') }}</h2>
            <p class="text-sm text-secondary">{{ t('pdf.compressor.description') }}</p>
          </div>
        </div>

        <!-- Upload Zone -->
        <div
          class="upload-zone"
          :class="{ 'active': isDraggingCompress }"
          @dragenter.prevent="isDraggingCompress = true"
          @dragover.prevent
          @dragleave.prevent="isDraggingCompress = false"
          @drop.prevent="handleCompressDrop"
          @click="triggerCompressInput"
        >
          <input
            ref="compressInput"
            type="file"
            accept=".pdf"
            class="hidden"
            @change="handleCompressFiles($event.target.files)"
          />
          <Archive class="w-10 h-10 text-secondary mx-auto mb-3" />
          <p class="text-primary font-medium mb-1">{{ t('common.dragDrop') }}</p>
          <p class="text-sm text-secondary">{{ t('common.orBrowse') }}</p>
          <p class="text-xs text-secondary mt-3">{{ t('common.supportedFormats') }}: PDF | {{ t('common.maxFileSize') }}: 100MB</p>
        </div>

        <!-- Compression Level -->
        <div v-if="compressFile" class="mt-6">
          <label class="block text-sm font-medium text-primary mb-3">{{ t('pdf.compressor.title') }}</label>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="option in compressionOptions"
              :key="option.value"
              @click="compressionLevel = option.value"
              class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              :class="compressionLevel === option.value
                ? 'bg-accent text-white'
                : 'bg-gray-100 text-secondary hover:bg-gray-200'"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- File Info -->
        <div v-if="compressFile" class="mt-6 p-4 bg-gray-50 rounded-xl flex items-center gap-4">
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <FileText class="w-6 h-6 text-red-500" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-primary">{{ compressFile.name }}</p>
            <p class="text-sm text-secondary">{{ formatBytes(compressFile.size) }}</p>
          </div>
          <button @click="compressPdf" :disabled="isCompressing" class="btn-primary">
            {{ isCompressing ? t('common.processing') : t('pdf.compressor.compress') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, markRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import { 
  RefreshCw, FileUp, FileDown, Upload, FileText, Merge, 
  Loader2, X, GripVertical, Archive
} from 'lucide-vue-next'

const { t } = useI18n()
const toast = useToast()

const activeTab = ref('converter')
const tabs = [
  { id: 'converter', label: t('pdf.converter.title'), icon: markRaw(RefreshCw) },
  { id: 'merger', label: t('pdf.merger.title'), icon: markRaw(Merge) },
  { id: 'compressor', label: t('pdf.compressor.title'), icon: markRaw(Archive) }
]

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Converter state
const pdfInput = ref(null)
const conversionType = ref('toPdf')
const pdfFile = ref(null)
const isDraggingPdf = ref(false)
const isConverting = ref(false)

const triggerPdfInput = () => pdfInput.value?.click()
const handlePdfFiles = (fileList) => {
  if (fileList?.length) pdfFile.value = fileList[0]
}
const handlePdfDrop = (event) => {
  isDraggingPdf.value = false
  const { files: droppedFiles } = event.dataTransfer
  if (droppedFiles?.length) pdfFile.value = droppedFiles[0]
}
const convertPdf = () => {
  isConverting.value = true
  setTimeout(() => {
    isConverting.value = false
    toast.success(t('common.success'))
  }, 1500)
}

// Merger state
const mergerInput = ref(null)
const mergeFiles = ref([])
const isDraggingMerger = ref(false)
const isMerging = ref(false)
const draggedIndex = ref(null)

const triggerMergerInput = () => mergerInput.value?.click()
const handleMergerFiles = (fileList) => {
  if (fileList?.length) {
    mergeFiles.value.push(...Array.from(fileList))
  }
}
const handleMergerDrop = (event) => {
  isDraggingMerger.value = false
  const { files: droppedFiles } = event.dataTransfer
  if (droppedFiles?.length) {
    mergeFiles.value.push(...Array.from(droppedFiles))
  }
}
const removeMergeFile = (index) => mergeFiles.value.splice(index, 1)
const dragStart = (index) => draggedIndex.value = index
const dropFile = (index) => {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    const item = mergeFiles.value.splice(draggedIndex.value, 1)[0]
    mergeFiles.value.splice(index, 0, item)
    draggedIndex.value = null
  }
}
const mergePdfs = () => {
  isMerging.value = true
  setTimeout(() => {
    isMerging.value = false
    toast.success(t('common.success'))
  }, 2000)
}

// Compressor state
const compressInput = ref(null)
const compressFile = ref(null)
const isDraggingCompress = ref(false)
const isCompressing = ref(false)
const compressionLevel = ref('recommended')

const compressionOptions = [
  { value: 'extreme', label: t('pdf.compressor.extreme') },
  { value: 'recommended', label: t('pdf.compressor.recommended') },
  { value: 'low', label: t('pdf.compressor.lowCompression') }
]

const triggerCompressInput = () => compressInput.value?.click()
const handleCompressFiles = (fileList) => {
  if (fileList?.length) compressFile.value = fileList[0]
}
const handleCompressDrop = (event) => {
  isDraggingCompress.value = false
  const { files: droppedFiles } = event.dataTransfer
  if (droppedFiles?.length) compressFile.value = droppedFiles[0]
}
const compressPdf = () => {
  isCompressing.value = true
  setTimeout(() => {
    isCompressing.value = false
    toast.success(t('common.success'))
  }, 1500)
}
</script>
