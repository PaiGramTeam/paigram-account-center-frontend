import { defineStore } from 'pinia'
import type { AppConfig } from '../types'

export const useAppStore = defineStore('app', {
  state: (): AppConfig => ({
    title: 'Paigram Account Center',
    logo: '',
    theme: 'light',
    primaryColor: '#165DFF',
    collapsed: false,
    showFooter: true,
    showBreadcrumb: true
  }),

  actions: {
    toggleCollapsed() {
      this.collapsed = !this.collapsed
    },

    setCollapsed(collapsed: boolean) {
      this.collapsed = collapsed
    },

    setTheme(theme: 'light' | 'dark') {
      this.theme = theme
      if (theme === 'dark') {
        document.body.setAttribute('arco-theme', 'dark')
      } else {
        document.body.removeAttribute('arco-theme')
      }
    },

    setPrimaryColor(color: string) {
      this.primaryColor = color
      document.body.style.setProperty('--primary-6', color)
    },

    updateSettings(settings: Partial<AppConfig>) {
      Object.assign(this, settings)
    }
  },

  persist: {
    key: 'app-store',
    paths: ['theme', 'primaryColor', 'collapsed', 'showFooter', 'showBreadcrumb']
  }
})