import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/bus-schedule-viewer/',
  plugins: [react(), tailwindcss()],
})
