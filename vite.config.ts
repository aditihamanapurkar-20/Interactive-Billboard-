import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages project site: https://<user>.github.io/Interactive-Billboard-/
export default defineConfig({
  base: '/Interactive-Billboard-/',
  plugins: [react(), tailwindcss()],
})
