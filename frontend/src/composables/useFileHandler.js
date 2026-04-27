import { ref } from 'vue'

export function useFileHandler(maxSizeMB = 500) {
  const isDragging = ref(false)
  const files = ref([])
  const error = ref(null)

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  const validateFile = (file) => {
    error.value = null
    
    if (file.size > maxSizeMB * 1024 * 1024) {
      error.value = `File size exceeds ${maxSizeMB}MB limit`
      return false
    }
    
    return true
  }

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList)
    for (const file of newFiles) {
      if (validateFile(file)) {
        files.value.push(file)
      }
    }
    return files.value
  }

  const removeFile = (index) => {
    files.value.splice(index, 1)
  }

  const clearFiles = () => {
    files.value = []
    error.value = null
  }

  const onDragEnter = () => {
    isDragging.value = true
  }

  const onDragLeave = () => {
    isDragging.value = false
  }

  const onDrop = (event) => {
    isDragging.value = false
    const { files: droppedFiles } = event.dataTransfer
    if (droppedFiles?.length) {
      handleFiles(droppedFiles)
    }
  }

  return {
    files,
    isDragging,
    error,
    formatBytes,
    handleFiles,
    removeFile,
    clearFiles,
    onDragEnter,
    onDragLeave,
    onDrop
  }
}
