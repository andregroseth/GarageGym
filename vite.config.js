import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => {
  const repoName = process.env.REPO_NAME || 'GarageGym'
  return {
    plugins: [react()],
    base: command === 'build' ? `/${repoName}/` : '/',
    server: {
      port: 3000,
      strictPort: true,
    },
  }
})
