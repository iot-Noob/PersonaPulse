import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  build:{
      sourcemap: true,

  },
  server: {
    host: '0.0.0.0',
    port:7000,
    strictPort: true,
    historyApiFallback: true, // <- for React Router

    cors: {
      origin: ['https://persona.nuketerm.mlt'], // ✅ no trailing slash here
      credentials: true,
    },
    allowedHosts: ['persona.nuketerm.mlt'], 
  },
  plugins: [react(), tailwindcss()],
})
