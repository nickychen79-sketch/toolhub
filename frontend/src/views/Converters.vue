<template>
  <div class="py-8 md:py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-primary mb-2 animate-fade-up">
          {{ t('converter.title') }}
        </h1>
        <p class="text-secondary animate-fade-up stagger-1">
          {{ t('converter.description') }}
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

      <!-- Currency Converter -->
      <div v-show="activeTab === 'currency'" class="card p-6 md:p-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <DollarSign class="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-primary">{{ t('converter.currency.title') }}</h2>
            <p class="text-sm text-secondary">{{ t('converter.currency.description') }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Amount Input -->
          <div>
            <label class="block text-sm font-medium text-primary mb-2">{{ t('converter.currency.amount') }}</label>
            <input
              v-model.number="currencyAmount"
              type="number"
              class="input-field text-lg font-mono"
              placeholder="0.00"
            />
          </div>

          <!-- From Currency -->
          <div>
            <label class="block text-sm font-medium text-primary mb-2">{{ t('converter.currency.from') }}</label>
            <select v-model="fromCurrency" class="input-field">
              <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
                {{ currency.name }} ({{ currency.code }})
              </option>
            </select>
          </div>

          <!-- Swap Button -->
          <div class="flex justify-center">
            <button @click="swapCurrencies" class="btn-icon">
              <ArrowUpDown class="w-5 h-5" />
            </button>
          </div>

          <!-- To Currency -->
          <div>
            <label class="block text-sm font-medium text-primary mb-2">{{ t('converter.currency.to') }}</label>
            <select v-model="toCurrency" class="input-field">
              <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
                {{ currency.name }} ({{ currency.code }})
              </option>
            </select>
          </div>
        </div>

        <!-- Result -->
        <div v-if="currencyAmount > 0" class="mt-8 p-6 bg-gradient-to-br from-accent/10 to-blue-50 rounded-2xl">
          <div class="text-center">
            <p class="text-sm text-secondary mb-2">{{ currencyAmount }} {{ fromCurrency }} =</p>
            <p class="text-4xl font-bold text-primary mb-4">
              {{ convertedAmount.toFixed(2) }} {{ toCurrency }}
            </p>
            <p class="text-sm text-secondary">
              {{ t('converter.currency.rate') }}: 1 {{ fromCurrency }} = {{ exchangeRate.toFixed(4) }} {{ toCurrency }}
            </p>
            <p class="text-xs text-secondary mt-2">
              {{ t('converter.currency.updated') }}: {{ lastUpdated }}
            </p>
          </div>
        </div>
      </div>

      <!-- Timezone Converter -->
      <div v-show="activeTab === 'timezone'" class="card p-6 md:p-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
            <Clock class="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-primary">{{ t('converter.timezone.title') }}</h2>
            <p class="text-sm text-secondary">{{ t('converter.timezone.description') }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Time Input -->
          <div>
            <label class="block text-sm font-medium text-primary mb-2">{{ t('converter.timezone.selectTime') }}</label>
            <div class="flex gap-3">
              <input
                v-model="timeInput"
                type="time"
                class="input-field flex-1"
              />
              <select v-model="timePeriod" class="input-field w-28">
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          <!-- From Timezone -->
          <div>
            <label class="block text-sm font-medium text-primary mb-2">{{ t('converter.timezone.fromZone') }}</label>
            <select v-model="fromTimezone" class="input-field">
              <optgroup v-for="group in timezoneGroups" :key="group.name" :label="group.name">
                <option v-for="tz in group.zones" :key="tz.value" :value="tz.value">
                  {{ tz.label }}
                </option>
              </optgroup>
            </select>
          </div>

          <!-- Swap Button -->
          <div class="flex justify-center">
            <button @click="swapTimezones" class="btn-icon">
              <ArrowUpDown class="w-5 h-5" />
            </button>
          </div>

          <!-- To Timezone -->
          <div>
            <label class="block text-sm font-medium text-primary mb-2">{{ t('converter.timezone.toZone') }}</label>
            <select v-model="toTimezone" class="input-field">
              <optgroup v-for="group in timezoneGroups" :key="group.name" :label="group.name">
                <option v-for="tz in group.zones" :key="tz.value" :value="tz.value">
                  {{ tz.label }}
                </option>
              </optgroup>
            </select>
          </div>
        </div>

        <!-- Current Time Display -->
        <div class="mt-6 p-4 bg-gray-50 rounded-xl">
          <p class="text-sm text-secondary mb-2">{{ t('converter.timezone.currentTime') }}</p>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-3 bg-white rounded-lg">
              <p class="text-xs text-secondary mb-1">{{ fromTimezone }}</p>
              <p class="text-xl font-bold text-primary">{{ fromTime }}</p>
            </div>
            <div class="text-center p-3 bg-white rounded-lg">
              <p class="text-xs text-secondary mb-1">{{ toTimezone }}</p>
              <p class="text-xl font-bold text-accent">{{ toTime }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Unit Converter -->
      <div v-show="activeTab === 'unit'" class="card p-6 md:p-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
            <Scale class="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-primary">{{ t('converter.unit.title') }}</h2>
            <p class="text-sm text-secondary">{{ t('converter.unit.description') }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-primary mb-2">{{ t('converter.unit.category') }}</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="cat in unitCategories"
                :key="cat.id"
                @click="selectCategory(cat.id)"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                :class="selectedCategory === cat.id
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-secondary hover:bg-gray-200'"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>

          <!-- Value Input -->
          <div>
            <label class="block text-sm font-medium text-primary mb-2">{{ t('converter.unit.value') }}</label>
            <input
              v-model.number="unitValue"
              type="number"
              class="input-field text-lg font-mono"
              placeholder="0"
            />
          </div>

          <!-- From Unit -->
          <div>
            <label class="block text-sm font-medium text-primary mb-2">{{ t('converter.unit.from') }}</label>
            <select v-model="fromUnit" class="input-field">
              <option v-for="unit in currentUnits" :key="unit.value" :value="unit.value">
                {{ unit.label }}
              </option>
            </select>
          </div>

          <!-- Swap Button -->
          <div class="flex justify-center">
            <button @click="swapUnits" class="btn-icon">
              <ArrowUpDown class="w-5 h-5" />
            </button>
          </div>

          <!-- To Unit -->
          <div>
            <label class="block text-sm font-medium text-primary mb-2">{{ t('converter.unit.to') }}</label>
            <select v-model="toUnit" class="input-field">
              <option v-for="unit in currentUnits" :key="unit.value" :value="unit.value">
                {{ unit.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Result -->
        <div v-if="unitValue > 0" class="mt-8 p-6 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl text-center">
          <p class="text-sm text-secondary mb-2">{{ unitValue }} {{ fromUnit }} =</p>
          <p class="text-4xl font-bold text-primary">
            {{ convertedUnit.toFixed(6).replace(/\.?0+$/, '') }} {{ toUnit }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  DollarSign, Clock, Scale, ArrowUpDown
} from 'lucide-vue-next'

const { t } = useI18n()

const activeTab = ref('currency')
const tabs = [
  { id: 'currency', label: t('converter.currency.title'), icon: DollarSign },
  { id: 'timezone', label: t('converter.timezone.title'), icon: Clock },
  { id: 'unit', label: t('converter.unit.title'), icon: Scale }
]

// Currency state
const currencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'RUB', name: 'Russian Ruble' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'VND', name: 'Vietnamese Dong' },
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'MYR', name: 'Malaysian Ringgit' }
]

const currencyAmount = ref(100)
const fromCurrency = ref('USD')
const toCurrency = ref('EUR')

const exchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CNY: 7.24,
  KRW: 1320.00,
  INR: 83.12,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  HKD: 7.82,
  SGD: 1.34,
  MXN: 17.15,
  BRL: 4.97,
  RUB: 92.50,
  THB: 35.80,
  VND: 24500.00,
  PHP: 55.80,
  IDR: 15650.00,
  MYR: 4.72
}

const exchangeRate = computed(() => {
  return exchangeRates[toCurrency.value] / exchangeRates[fromCurrency.value]
})

const convertedAmount = computed(() => {
  return currencyAmount.value * exchangeRate.value
})

const lastUpdated = ref(new Date().toLocaleString())

const swapCurrencies = () => {
  const temp = fromCurrency.value
  fromCurrency.value = toCurrency.value
  toCurrency.value = temp
}

// Timezone state
const timezoneGroups = [
  {
    name: 'Americas',
    zones: [
      { value: 'America/New_York', label: 'New York (EST/EDT)' },
      { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
      { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
      { value: 'America/Denver', label: 'Denver (MST/MDT)' },
      { value: 'America/Sao_Paulo', label: 'São Paulo' },
      { value: 'America/Mexico_City', label: 'Mexico City' }
    ]
  },
  {
    name: 'Europe',
    zones: [
      { value: 'Europe/London', label: 'London (GMT/BST)' },
      { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
      { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
      { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)' },
      { value: 'Europe/Moscow', label: 'Moscow' }
    ]
  },
  {
    name: 'Asia',
    zones: [
      { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
      { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
      { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
      { value: 'Asia/Seoul', label: 'Seoul (KST)' },
      { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
      { value: 'Asia/Dubai', label: 'Dubai (GST)' },
      { value: 'Asia/Bangkok', label: 'Bangkok (ICT)' },
      { value: 'Asia/Jakarta', label: 'Jakarta (WIB)' }
    ]
  },
  {
    name: 'Oceania',
    zones: [
      { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
      { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' }
    ]
  }
]

const timeInput = ref('12:00')
const timePeriod = ref('PM')
const fromTimezone = ref('America/New_York')
const toTimezone = ref('Asia/Tokyo')

const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
}

const fromTime = ref('')
const toTime = ref('')

const swapTimezones = () => {
  const temp = fromTimezone.value
  fromTimezone.value = toTimezone.value
  toTimezone.value = temp
}

const updateTimes = () => {
  const now = new Date()
  const [hours, minutes] = timeInput.value.split(':').map(Number)
  
  // Create date in from timezone
  const fromDate = new Date(now.toLocaleString('en-US', { timeZone: fromTimezone.value }))
  fromDate.setHours(hours, minutes, 0, 0)
  
  // Convert to to timezone
  const toDate = new Date(now.toLocaleString('en-US', { timeZone: toTimezone.value }))
  toDate.setHours(hours, minutes, 0, 0)
  
  fromTime.value = formatTime(fromDate)
  toTime.value = formatTime(toDate)
}

watch([timeInput, fromTimezone, toTimezone], updateTimes)
onMounted(updateTimes)

// Unit Converter state
const unitCategories = [
  { id: 'length', label: t('converter.unit.length') },
  { id: 'weight', label: t('converter.unit.weight') },
  { id: 'temperature', label: t('converter.unit.temperature') },
  { id: 'data', label: t('converter.unit.data') },
  { id: 'speed', label: t('converter.unit.speed') }
]

const units = {
  length: [
    { value: 'm', label: 'Meters (m)' },
    { value: 'km', label: 'Kilometers (km)' },
    { value: 'cm', label: 'Centimeters (cm)' },
    { value: 'mm', label: 'Millimeters (mm)' },
    { value: 'mi', label: 'Miles (mi)' },
    { value: 'yd', label: 'Yards (yd)' },
    { value: 'ft', label: 'Feet (ft)' },
    { value: 'in', label: 'Inches (in)' }
  ],
  weight: [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'mg', label: 'Milligrams (mg)' },
    { value: 'lb', label: 'Pounds (lb)' },
    { value: 'oz', label: 'Ounces (oz)' },
    { value: 't', label: 'Metric Tons (t)' }
  ],
  temperature: [
    { value: 'c', label: 'Celsius (°C)' },
    { value: 'f', label: 'Fahrenheit (°F)' },
    { value: 'k', label: 'Kelvin (K)' }
  ],
  data: [
    { value: 'b', label: 'Bytes (B)' },
    { value: 'kb', label: 'Kilobytes (KB)' },
    { value: 'mb', label: 'Megabytes (MB)' },
    { value: 'gb', label: 'Gigabytes (GB)' },
    { value: 'tb', label: 'Terabytes (TB)' },
    { value: 'bit', label: 'Bits (bit)' }
  ],
  speed: [
    { value: 'mps', label: 'Meters/sec (m/s)' },
    { value: 'kmh', label: 'Kilometers/hr (km/h)' },
    { value: 'mph', label: 'Miles/hr (mph)' },
    { value: 'kn', label: 'Knots (kn)' },
    { value: 'fps', label: 'Feet/sec (ft/s)' }
  ]
}

const conversionFactors = {
  length: {
    m: 1,
    km: 0.001,
    cm: 100,
    mm: 1000,
    mi: 0.000621371,
    yd: 1.09361,
    ft: 3.28084,
    in: 39.3701
  },
  weight: {
    kg: 1,
    g: 1000,
    mg: 1000000,
    lb: 2.20462,
    oz: 35.274,
    t: 0.001
  },
  data: {
    b: 1,
    kb: 0.001,
    mb: 0.000001,
    gb: 0.000000001,
    tb: 0.000000000001,
    bit: 8
  },
  speed: {
    mps: 1,
    kmh: 3.6,
    mph: 2.23694,
    kn: 1.94384,
    fps: 3.28084
  }
}

const selectedCategory = ref('length')
const unitValue = ref(1)
const fromUnit = ref('m')
const toUnit = ref('km')

const currentUnits = computed(() => units[selectedCategory.value] || [])

watch(selectedCategory, () => {
  fromUnit.value = currentUnits.value[0]?.value || ''
  toUnit.value = currentUnits.value[1]?.value || currentUnits.value[0]?.value || ''
})

const selectCategory = (id) => {
  selectedCategory.value = id
}

const convertTemperature = (value, from, to) => {
  // Convert to Celsius first
  let celsius
  if (from === 'c') celsius = value
  else if (from === 'f') celsius = (value - 32) * 5/9
  else if (from === 'k') celsius = value - 273.15

  // Convert from Celsius to target
  if (to === 'c') return celsius
  else if (to === 'f') return celsius * 9/5 + 32
  else if (to === 'k') return celsius + 273.15
}

const convertedUnit = computed(() => {
  if (selectedCategory.value === 'temperature') {
    return convertTemperature(unitValue.value, fromUnit.value, toUnit.value)
  }
  
  const factors = conversionFactors[selectedCategory.value]
  if (!factors) return 0
  
  const valueInBase = unitValue.value / factors[fromUnit.value]
  return valueInBase * factors[toUnit.value]
})

const swapUnits = () => {
  const temp = fromUnit.value
  fromUnit.value = toUnit.value
  toUnit.value = temp
}
</script>
