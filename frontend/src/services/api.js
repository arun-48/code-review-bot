// src/services/api.js
import axios from 'axios'

const API_BASE    = 'http://localhost:8080/api'
const PYTHON_BASE = 'http://localhost:5000'

const api = axios.create({
    baseURL: API_BASE,
    timeout: 120000,
    headers: { 'Content-Type': 'application/json' }
})

export const reviewCode = async (code, language, filename) => {
    const response = await api.post('/review', { code, language, filename })
    return response.data
}

export const getHistory = async () => {
    const response = await api.get('/history')
    return response.data
}

export const getHistoryById = async (id) => {
    const response = await api.get(`/history/${id}`)
    return response.data
}

export const detectLanguage = async (code) => {
    try {
        const response = await axios.post(
            `${PYTHON_BASE}/detect-language`,
            { code },
            {
                timeout: 15000,
                headers: { 'Content-Type': 'application/json' }
            }
        )
        const data = response.data
        if (typeof data === 'string') {
            return { language: data, confident: data !== 'unknown' }
        }
        return {
            language : data.language  || 'unknown',
            confident: data.confident ?? (data.language !== 'unknown')
        }
    } catch (e) {
        return { language: 'unknown', confident: false }
    }
}

export const clearHistory = async () => {
    const response = await api.delete('/history')
    return response.data
}

export default api