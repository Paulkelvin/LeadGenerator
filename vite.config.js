import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __CH_API_KEY__: JSON.stringify(process.env.CH_API_KEY || ''),
  },
})
