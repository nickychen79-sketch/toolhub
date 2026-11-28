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
                {{ t('pdf.converter.toPdfLabel') }}
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
                {{ t('pdf.converter.fromPdfLabel') }}
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
            :accept="conversionType === 'toPdf' ? '.jpg,.jpeg,.png' : '.pdf'"
            :multiple="conversionType === 'toPdf'"
            class="hidden"
            @change="handlePdfFiles($event.target.files)"
          />
          <Upload class="w-10 h-10 text-secondary mx-auto mb-3" />
          <p class="text-primary font-medium mb-1">{{ t('common.dragDrop') }}</p>
          <p class="text-sm text-secondary">{{ t('common.orBrowse') }}</p>
          <p class="text-xs text-secondary mt-3">
            {{ conversionType === 'toPdf' ? t('pdf.converter.multiImg') : 'PDF' }}
          </p>
        </div>

        <!-- Image List (to PDF) -->
        <div v-if="conversionType === 'toPdf' && images.length > 0" class="mt-6 space-y-3">
          <p class="text-sm text-secondary">{{ t('pdf.converter.multiImg') }}</p>
          <div
            v-for="(file, index) in images"
            :key="index"
            class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
          >
            <span class="px-2 py-1 bg-white rounded text-xs font-medium text-secondary">{{ index + 1 }}</span>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-primary truncate">{{ file.name }}</p>
              <p class="text-sm text-secondary">{{ formatBytes(file.size) }}</p>
            </div>
            <button @click="removeImage(index)" class="btn-icon">
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- File Info (from PDF) -->
        <div v-if="conversionType === 'fromPdf' && pdfFile" class="mt-6 p-4 bg-gray-50 rounded-xl flex items-center gap-4">
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <FileText class="w-6 h-6 text-red-500" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-primary">{{ pdfFile.name }}</p>
            <p class="text-sm text-secondary">{{ formatBytes(pdfFile.size) }}</p>
          </div>
        </div>

        <!-- Convert Button -->
        <div v-if="conversionType === 'toPdf' ? images.length > 0 : pdfFile" class="mt-6">
          <button @click="convertPdf" :disabled="isConverting" class="btn-primary w-full flex items-center justify-center gap-2">
            <Loader2 v-if="isConverting" class="w-5 h-5 animate-spin" />
            <RefreshCw v-else class="w-5 h-5" />
            {{ isConverting ? t('common.processing') : t('pdf.converter.title') }}
          </button>
        </div>

        <!-- Result -->
        <div v-if="convertResult" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-4">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <FileText class="w-6 h-6 text-green-600" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-primary truncate">{{ convertResult.name }}</p>
            <p class="text-sm text-secondary">{{ convertResult.info }}</p>
          </div>
          <button @click="downloadBlob(convertResult.blob, convertResult.name)" class="btn-primary">
            {{ t('common.download') }}
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
          <p class="text-xs text-secondary mt-3">{{ t('common.supportedFormats') }}: PDF</p>
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

        <!-- Result -->
        <div v-if="mergeResult" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-4">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <FileText class="w-6 h-6 text-green-600" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-primary truncate">{{ mergeResult.name }}</p>
            <p class="text-sm text-secondary">{{ mergeResult.info }}</p>
          </div>
          <button @click="downloadBlob(mergeResult.blob, mergeResult.name)" class="btn-primary">
            {{ t('common.download') }}
          </button>
        </div>
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
        </div>

        <!-- Compress Button -->
        <button
          v-if="compressFile"
          @click="compressPdf"
          :disabled="isCompressing"
          class="btn-primary w-full mt-6 flex items-center justify-center gap-2"
        >
          <Loader2 v-if="isCompressing" class="w-5 h-5 animate-spin" />
          <Archive v-else class="w-5 h-5" />
          {{ isCompressing ? t('common.processing') : t('pdf.compressor.compress') }}
        </button>

        <!-- Progress -->
        <div v-if="isCompressing" class="mt-6">
          <div class="progress-bar">
            <div class="progress-bar-fill" :style="{ width: compressProgress + '%' }"></div>
          </div>
          <p class="text-sm text-secondary text-center mt-2">{{ compressProgress }}%</p>
        </div>

        <!-- Result -->
        <div v-if="compressResult" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText class="w-6 h-6 text-green-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-primary truncate">{{ compressResult.name }}</p>
              <p class="text-sm text-secondary">
                {{ t('pdf.compressor.original') }}: {{ formatBytes(compressResult.before) }}
                → {{ t('pdf.compressor.result') }}: {{ formatBytes(compressResult.after) }}
              </p>
            </div>
            <button @click="downloadBlob(compressResult.blob, compressResult.name)" class="btn-primary">
              {{ t('common.download') }}
            </button>
          </div>
          <p class="text-xs text-secondary mt-3">{{ t('pdf.compressor.note') }}</p>
        </div>
      </div>
      <!-- PDF AI Assistant -->
      <div v-show="activeTab === 'ai'" class="card p-6 md:p-8 animate-fade-up">
        <!-- Limited-time free promo strip -->
        <div class="mb-6 p-3.5 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 flex items-center gap-3">
          <Sparkles class="w-5 h-5 text-violet-500 shrink-0" />
          <p class="text-sm text-primary">
            <span class="font-semibold">{{ t('pdf.ai.promoTitle') }}</span>
            <span class="text-secondary">{{ t('pdf.ai.promoText') }}</span>
            <span class="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white align-middle">{{ t('pdf.ai.promoBadge') }}</span>
          </p>
        </div>
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
            <Sparkles class="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-primary">{{ t('pdf.ai.title') }}</h2>
            <p class="text-sm text-secondary">{{ t('pdf.ai.description') }}</p>
          </div>
        </div>

        <!-- Upload Zone -->
        <div
          class="upload-zone"
          :class="{ 'active': isDraggingAi }"
          @dragenter.prevent="isDraggingAi = true"
          @dragover.prevent
          @dragleave.prevent="isDraggingAi = false"
          @drop.prevent="handleAiDrop"
          @click="triggerAiInput"
        >
          <input
            ref="aiInput"
            type="file"
            accept=".pdf"
            class="hidden"
            @change="handleAiFiles($event.target.files)"
          />
          <Sparkles class="w-10 h-10 text-secondary mx-auto mb-3" />
          <p class="text-primary font-medium mb-1">{{ t('common.dragDrop') }}</p>
          <p class="text-sm text-secondary">{{ t('common.orBrowse') }}</p>
          <p class="text-xs text-secondary mt-3">{{ t('common.supportedFormats') }}: PDF</p>
        </div>

        <!-- File Info -->
        <div v-if="aiFile" class="mt-6 p-4 bg-gray-50 rounded-xl flex items-center gap-4">
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <FileText class="w-6 h-6 text-red-500" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-primary">{{ aiFile.name }}</p>
            <p class="text-sm text-secondary">
              {{ formatBytes(aiFile.size) }}
              <template v-if="aiChars">· {{ t('pdf.ai.chars', { n: aiChars }) }}</template>
            </p>
          </div>
          <button @click="clearAiFile" class="btn-icon">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Mode & Language -->
        <div v-if="aiFile" class="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-primary mb-3">{{ t('pdf.ai.mode') }}</label>
            <div class="flex gap-3">
              <button
                @click="aiMode = 'summarize'"
                class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                :class="aiMode === 'summarize' ? 'bg-accent text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'"
              >
                {{ t('pdf.ai.summarize') }}
              </button>
              <button
                @click="aiMode = 'translate'"
                class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                :class="aiMode === 'translate' ? 'bg-accent text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'"
              >
                {{ t('pdf.ai.translate') }}
              </button>
            </div>
          </div>
          <div v-if="aiMode === 'translate'">
            <label class="block text-sm font-medium text-primary mb-3">{{ t('pdf.ai.targetLang') }}</label>
            <div class="flex gap-3">
              <button
                v-for="lang in aiLangOptions"
                :key="lang.value"
                @click="aiTargetLang = lang.value"
                class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                :class="aiTargetLang === lang.value ? 'bg-accent text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'"
              >
                {{ lang.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Run Button -->
        <button
          v-if="aiFile"
          @click="runAi"
          :disabled="isAiRunning"
          class="btn-primary w-full mt-6 flex items-center justify-center gap-2"
        >
          <Loader2 v-if="isAiRunning" class="w-5 h-5 animate-spin" />
          <Sparkles v-else class="w-5 h-5" />
          {{ isAiRunning ? t('pdf.ai.processing') : t('pdf.ai.run') }}
        </button>

        <p v-if="aiTruncated" class="text-xs text-amber-600 mt-3">{{ t('pdf.ai.truncated') }}</p>

        <!-- Result -->
        <div v-if="aiResult" class="mt-6 p-5 bg-violet-50 border border-violet-200 rounded-xl">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm font-medium text-primary">{{ t('pdf.ai.resultTitle') }}</p>
            <button @click="copyAiResult" class="text-sm text-accent hover:underline flex items-center gap-1">
              <Check v-if="aiCopied" class="w-4 h-4" />
              {{ aiCopied ? t('pdf.ai.copied') : t('pdf.ai.copy') }}
            </button>
          </div>
          <div class="text-sm text-primary whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">{{ aiResult }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, markRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import JSZip from 'jszip'
import {
  RefreshCw, FileUp, FileDown, Upload, FileText, Merge,
  Loader2, X, GripVertical, Archive, Sparkles, Check
} from 'lucide-vue-next'
import axios from 'axios'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const { t } = useI18n()
const toast = useToast()

const activeTab = ref('converter')
const tabs = [
  { id: 'converter', label: t('pdf.converter.title'), icon: markRaw(RefreshCw) },
  { id: 'merger', label: t('pdf.merger.title'), icon: markRaw(Merge) },
  { id: 'compressor', label: t('pdf.compressor.title'), icon: markRaw(Archive) },
  { id: 'ai', label: t('pdf.ai.title'), icon: markRaw(Sparkles) }
]

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const downloadBlob = (blob, name) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 3000)
}

const baseName = (name) => name.replace(/\.[^.]+$/, '')

// ---------- Converter state ----------
const pdfInput = ref(null)
const conversionType = ref('toPdf')
const pdfFile = ref(null)
const images = ref([])
const isDraggingPdf = ref(false)
const isConverting = ref(false)
const convertResult = ref(null)

const triggerPdfInput = () => pdfInput.value?.click()
const handlePdfFiles = (fileList) => {
  const list = Array.from(fileList || [])
  if (!list.length) return
  if (conversionType.value === 'toPdf') {
    const ok = list.filter((f) => /image\/(jpeg|png)/.test(f.type))
    if (ok.length !== list.length) toast.error('Only JPG / PNG images are supported')
    images.value.push(...ok)
  } else {
    pdfFile.value = list[0]
    convertResult.value = null
  }
}
const handlePdfDrop = (event) => {
  isDraggingPdf.value = false
  handlePdfFiles(event.dataTransfer?.files)
}
const removeImage = (index) => images.value.splice(index, 1)

const convertPdf = async () => {
  isConverting.value = true
  convertResult.value = null
  try {
    if (conversionType.value === 'toPdf') {
      // 图片 → PDF：每张图一页，页面尺寸随图片
      const out = await PDFDocument.create()
      for (const img of images.value) {
        const bytes = await img.arrayBuffer()
        const embedded = /image\/png/.test(img.type)
          ? await out.embedPng(bytes)
          : await out.embedJpg(bytes)
        const page = out.addPage([embedded.width, embedded.height])
        page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height })
      }
      const blob = new Blob([await out.save()], { type: 'application/pdf' })
      convertResult.value = {
        blob,
        name: 'toolhub-images.pdf',
        info: `${t('pdf.converter.pages', { n: images.value.length })} · ${formatBytes(blob.size)}`
      }
    } else {
      // PDF → PNG：每页渲染成 PNG，多页打包 zip
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await pdfFile.value.arrayBuffer()) }).promise
      if (pdf.numPages === 1) {
        const pngBlob = await renderPageToPng(pdf, 1, 2)
        convertResult.value = {
          blob: pngBlob,
          name: `${baseName(pdfFile.value.name)}-page1.png`,
          info: `PNG · ${formatBytes(pngBlob.size)}`
        }
      } else {
        const zip = new JSZip()
        for (let i = 1; i <= pdf.numPages; i++) {
          const blob = await renderPageToPng(pdf, i, 2)
          zip.file(`page-${String(i).padStart(3, '0')}.png`, blob)
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        convertResult.value = {
          blob: zipBlob,
          name: `${baseName(pdfFile.value.name)}-png.zip`,
          info: t('pdf.converter.pages', { n: pdf.numPages }) + ` · ZIP · ${formatBytes(zipBlob.size)}`
        }
      }
    }
    toast.success(t('common.success'))
  } catch (e) {
    console.error(e)
    toast.error(t('common.error'))
  } finally {
    isConverting.value = false
  }
}

async function renderPageToPng(pdf, pageNumber, scale = 2) {
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')
  await page.render({ canvasContext: ctx, viewport }).promise
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  canvas.width = 0
  canvas.height = 0
  if (!blob) throw new Error('canvas toBlob failed')
  return blob
}

// ---------- Merger state ----------
const mergerInput = ref(null)
const mergeFiles = ref([])
const isDraggingMerger = ref(false)
const isMerging = ref(false)
const draggedIndex = ref(null)
const mergeResult = ref(null)

const triggerMergerInput = () => mergerInput.value?.click()
const handleMergerFiles = (fileList) => {
  if (fileList?.length) {
    mergeFiles.value.push(...Array.from(fileList))
    mergeResult.value = null
  }
}
const handleMergerDrop = (event) => {
  isDraggingMerger.value = false
  handleMergerFiles(event.dataTransfer?.files)
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

const mergePdfs = async () => {
  isMerging.value = true
  mergeResult.value = null
  try {
    const out = await PDFDocument.create()
    for (const f of mergeFiles.value) {
      const src = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true })
      const pages = await out.copyPages(src, src.getPageIndices())
      pages.forEach((p) => out.addPage(p))
    }
    const blob = new Blob([await out.save()], { type: 'application/pdf' })
    mergeResult.value = {
      blob,
      name: 'toolhub-merged.pdf',
      info: `${out.getPageCount()} ${t('pdf.converter.pages', { n: out.getPageCount() })} · ${formatBytes(blob.size)}`
    }
    toast.success(t('common.success'))
  } catch (e) {
    console.error(e)
    toast.error(t('common.error'))
  } finally {
    isMerging.value = false
  }
}

// ---------- Compressor state ----------
const compressInput = ref(null)
const compressFile = ref(null)
const isDraggingCompress = ref(false)
const isCompressing = ref(false)
const compressProgress = ref(0)
const compressionLevel = ref('recommended')
const compressResult = ref(null)

const compressionOptions = [
  { value: 'extreme', label: t('pdf.compressor.extreme') },
  { value: 'recommended', label: t('pdf.compressor.recommended') },
  { value: 'low', label: t('pdf.compressor.lowCompression') }
]

// 档位 → (渲染倍率, JPEG 质量)
const COMPRESS_PRESETS = {
  extreme: { scale: 1.0, quality: 0.5 },
  recommended: { scale: 1.5, quality: 0.72 },
  low: { scale: 2.0, quality: 0.85 }
}

const triggerCompressInput = () => compressInput.value?.click()
const handleCompressFiles = (fileList) => {
  if (fileList?.length) {
    compressFile.value = fileList[0]
    compressResult.value = null
  }
}
const handleCompressDrop = (event) => {
  isDraggingCompress.value = false
  handleCompressFiles(event.dataTransfer?.files)
}

const compressPdf = async () => {
  const file = compressFile.value
  if (!file) return
  isCompressing.value = true
  compressProgress.value = 0
  compressResult.value = null
  try {
    const { scale, quality } = COMPRESS_PRESETS[compressionLevel.value] || COMPRESS_PRESETS.recommended
    const src = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
    const out = await PDFDocument.create()
    for (let i = 1; i <= src.numPages; i++) {
      const page = await src.getPage(i)
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      await page.render({ canvasContext: ctx, viewport }).promise
      const jpegBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
      canvas.width = 0
      canvas.height = 0
      if (!jpegBlob) throw new Error('canvas toBlob failed')
      const embedded = await out.embedJpg(await jpegBlob.arrayBuffer())
      // PDF 点尺寸 = CSS 像素 × 0.75（96dpi → 72dpi）
      const p = out.addPage([viewport.width * 0.75, viewport.height * 0.75])
      p.drawImage(embedded, { x: 0, y: 0, width: viewport.width * 0.75, height: viewport.height * 0.75 })
      compressProgress.value = Math.round((i / src.numPages) * 90)
    }
    const blob = new Blob([await out.save()], { type: 'application/pdf' })
    compressProgress.value = 100
    compressResult.value = {
      blob,
      name: `${baseName(file.name)}-compressed.pdf`,
      before: file.size,
      after: blob.size
    }
    toast.success(t('common.success'))
  } catch (e) {
    console.error(e)
    toast.error(t('common.error'))
  } finally {
    isCompressing.value = false
  }
}

// ---------- AI Assistant state ----------
const MAX_AI_CHARS = 60000
const aiInput = ref(null)
const aiFile = ref(null)
const isDraggingAi = ref(false)
const aiMode = ref('summarize')
const aiTargetLang = ref('English')
const aiLangOptions = [
  { value: 'English', label: 'English' },
  { value: '中文（简体）', label: '中文' }
]
const isAiRunning = ref(false)
const aiChars = ref(0)
const aiResult = ref('')
const aiCopied = ref(false)
const aiTruncated = ref(false)

const triggerAiInput = () => aiInput.value?.click()
const handleAiFiles = (fileList) => {
  const f = fileList?.[0]
  if (!f) return
  if (!/\.pdf$/i.test(f.name)) {
    toast.error('Only PDF files are supported')
    return
  }
  aiFile.value = f
  aiResult.value = ''
  aiChars.value = 0
  aiTruncated.value = false
}
const handleAiDrop = (event) => {
  isDraggingAi.value = false
  handleAiFiles(event.dataTransfer?.files)
}
const clearAiFile = () => {
  aiFile.value = null
  aiResult.value = ''
  aiChars.value = 0
  aiTruncated.value = false
}

// 用 pdfjs 抽取全文文本（文本层；扫描件无文本层会得到空文本）
const extractPdfText = async (file) => {
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  const parts = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const tc = await page.getTextContent()
    parts.push(tc.items.map((item) => item.str).join(' '))
    if (parts.join('\n\n').length > MAX_AI_CHARS) break
  }
  return parts.join('\n\n')
}

const runAi = async () => {
  const file = aiFile.value
  if (!file) return
  isAiRunning.value = true
  aiResult.value = ''
  aiCopied.value = false
  try {
    const text = await extractPdfText(file)
    aiChars.value = Math.min(text.length, MAX_AI_CHARS)
    if (text.trim().length < 20) {
      toast.error(t('pdf.ai.noText'))
      return
    }
    aiTruncated.value = text.length > MAX_AI_CHARS
    const r = await axios.post('/api/ai/pdf', {
      text: text.slice(0, MAX_AI_CHARS),
      mode: aiMode.value,
      targetLang: aiMode.value === 'translate' ? aiTargetLang.value : undefined
    }, { timeout: 150000 })
    aiResult.value = r.data?.result || ''
    toast.success(t('common.success'))
  } catch (e) {
    console.error(e)
    const msg = e.response?.data?.error
    toast.error(msg || t('common.error'))
  } finally {
    isAiRunning.value = false
  }
}

const copyAiResult = async () => {
  if (!aiResult.value) return
  try {
    await navigator.clipboard.writeText(aiResult.value)
    aiCopied.value = true
    setTimeout(() => (aiCopied.value = false), 2000)
  } catch {
    toast.error(t('common.error'))
  }
}
</script>
