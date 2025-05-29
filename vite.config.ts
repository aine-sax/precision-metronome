import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/precision-metronome/',  // ← リポジトリ名をここに！
  plugins: [react()],
})

