import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages als Projekt-Seite läuft unter /sbb-app/, nicht unter /.
  // Im Dev-Server (npm run dev) bleibt es bei "/".
  base: command === 'build' ? '/sbb-app/' : '/',
}))
