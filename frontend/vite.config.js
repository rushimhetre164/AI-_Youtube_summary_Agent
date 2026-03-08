import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // This is what we just installed!

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})