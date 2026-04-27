<template>
  <Teleport to="body">
    <TransitionGroup 
      name="toast" 
      tag="div" 
      class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 min-w-[280px] max-w-[400px]"
        :class="toastClasses[toast.type]"
      >
        <component :is="toastIcons[toast.type]" class="w-5 h-5 shrink-0" />
        <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
        <button 
          @click="removeToast(toast.id)"
          class="p-1 hover:bg-black/10 rounded-lg transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { ref, markRaw } from 'vue'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const toastClasses = {
  success: 'bg-white border-success/30 text-success',
  error: 'bg-white border-error/30 text-error',
  info: 'bg-white border-accent/30 text-accent'
}

const toastIcons = {
  success: markRaw(CheckCircle),
  error: markRaw(AlertCircle),
  info: markRaw(Info)
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
