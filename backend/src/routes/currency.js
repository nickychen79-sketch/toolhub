import express from 'express'
import axios from 'axios'

export const currencyRouter = express.Router()

// Free exchange rate API (using exchangerate-api.com free tier)
const EXCHANGE_API = 'https://api.exchangerate-api.com/v4/latest'

// Cache rates for 1 hour
let cachedRates = null
let cacheTime = null
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

const getRates = async (base = 'USD') => {
  const now = Date.now()
  
  if (cachedRates && cacheTime && (now - cacheTime) < CACHE_DURATION) {
    return cachedRates
  }

  try {
    const response = await axios.get(`${EXCHANGE_API}/${base}`, {
      timeout: 5000
    })
    
    cachedRates = response.data.rates
    cacheTime = now
    
    return cachedRates
  } catch (error) {
    console.error('Exchange rate fetch error:', error.message)
    // Return fallback rates if API fails
    return getFallbackRates()
  }
}

const getFallbackRates = () => ({
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
})

// Get all rates
currencyRouter.get('/rates', async (req, res) => {
  try {
    const base = req.query.base || 'USD'
    const rates = await getRates(base)
    
    res.json({
      base,
      rates,
      updated: cacheTime ? new Date(cacheTime).toISOString() : new Date().toISOString()
    })
  } catch (error) {
    console.error('Currency rates error:', error)
    res.status(500).json({ error: 'Failed to fetch exchange rates' })
  }
})

// Convert currencies
currencyRouter.get('/convert', async (req, res) => {
  try {
    const { from = 'USD', to = 'EUR', amount = 1 } = req.query
    
    const rates = await getRates(from)
    const rate = rates[to] || 1
    const converted = parseFloat(amount) * rate
    
    res.json({
      from,
      to,
      amount: parseFloat(amount),
      result: converted,
      rate,
      updated: cacheTime ? new Date(cacheTime).toISOString() : new Date().toISOString()
    })
  } catch (error) {
    console.error('Conversion error:', error)
    res.status(500).json({ error: 'Conversion failed' })
  }
})
