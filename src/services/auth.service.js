import api, { setTokens, clearTokens } from './api'

export const authService = {
  async register(payload) {
    const { data } = await api.post('auth/register/', payload)
    if (data?.access || data?.refresh) setTokens(data)
    return data
  },

  async login(payload) {
    const { data } = await api.post('auth/login/', payload)
    if (data?.access || data?.refresh) setTokens(data)
    return data
  },

  async me() {
    const { data } = await api.get('auth/me/')
    return data
  },

  async changePassword(payload) {
    const { data } = await api.post('auth/change-password/', payload)
    return data
  },

  async requestPasswordReset(email) {
    const { data } = await api.post('auth/password-reset-request/', { email })
    return data
  },

  async confirmPasswordReset(payload) {
    const { data } = await api.post('auth/password-reset-confirm/', payload)
    return data
  },

  logout() {
    clearTokens()
  },
}
