import { useState, useEffect } from 'react'
import { apiKeyService } from '../services/api-key.service'
import { ApiKey } from '../types/api.types'

export function useApiKey() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadApiKeys = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await apiKeyService.getAll()
      setApiKeys(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحميل مفاتيح API')
    } finally {
      setIsLoading(false)
    }
  }

  const addApiKey = async (keyData: { keyName: string; apiKey: string }) => {
    try {
      setIsLoading(true)
      setError(null)
      const newKey = await apiKeyService.create(keyData)
      setApiKeys(prev => [...prev, newKey])
      return newKey
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إضافة مفتاح API')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateApiKey = async (id: string, keyData: { keyName: string; apiKey: string }) => {
    try {
      setIsLoading(true)
      setError(null)
      const updatedKey = await apiKeyService.update(id, keyData)
      setApiKeys(prev => prev.map(key => key.id === id ? updatedKey : key))
      return updatedKey
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحديث مفتاح API')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteApiKey = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await apiKeyService.delete(id)
      setApiKeys(prev => prev.filter(key => key.id !== id))
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء حذف مفتاح API')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const testApiKey = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await apiKeyService.test(id)
      return result
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء اختبار مفتاح API')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadApiKeys()
  }, [])

  return {
    apiKeys,
    isLoading,
    error,
    loadApiKeys,
    addApiKey,
    updateApiKey,
    deleteApiKey,
    testApiKey
  }
}

