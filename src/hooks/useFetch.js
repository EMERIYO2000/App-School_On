import { useCallback, useEffect, useRef, useState } from 'react'

export function useFetch(fetcher, deps = [], { initialData = null, autoload = true } = {}) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(Boolean(autoload))
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const active = useRef(true)

  const run = useCallback(
    async (...args) => {
      setLoading(true)
      setError('')
      try {
        const result = await fetcher(...args)
        if (active.current) {
          setData(result)
          setError('')
        }
        return result
      } catch (e) {
        if (active.current) {
          setError(e?.response?.data?.detail || e?.message || 'Une erreur est survenue.')
          setData(null)
        }
        throw e
      } finally {
        if (active.current) setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  )

  useEffect(() => {
    active.current = true
    if (autoload) run().catch(() => {})
    return () => {
      active.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, ...deps])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  return { data, loading, error, run, refresh, setData }
}

export function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function useGeolocation(defaultLoc) {
  const [coords, setCoords] = useState(defaultLoc || null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('unavailable')
      const error = new Error('La géolocalisation n’est pas disponible sur cet appareil.')
      setError(error.message)
      return Promise.resolve(null)
    }
    setStatus('loading')
    setError('')
    return new Promise((resolve) => navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCoords(c)
        setStatus('success')
        resolve(c)
      },
      (err) => {
        setError(err?.message || 'Localisation autorisée non disponible')
        setStatus('denied')
        resolve(null)
      },
      { timeout: 8000 }
    ))
  }, [])

  return { coords, status, error, locate }
}

export function useAsyncAction(fn) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const run = useCallback(
    async (...args) => {
      setLoading(true)
      setError('')
      try {
        const res = await fn(...args)
        return res
      } catch (e) {
        const msg = e?.response?.data?.detail || e?.response?.data?.message || e?.message || 'Une erreur est survenue.'
        setError(msg)
        throw e
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn]
  )
  return { loading, error, run }
}
