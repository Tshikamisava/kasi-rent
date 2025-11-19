import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['lucide-react'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'state-vendor': ['zustand'],
          'utils-vendor': ['clsx', 'tailwind-merge'],
          
          // Feature chunks
          'auth-components': [
            './src/pages/SignIn.tsx',
            './src/pages/GetStarted.tsx',
            './src/hooks/use-auth.ts',
            './src/lib/auth.ts'
          ],
          'dashboard-components': [
            './src/pages/TenantDashboard.tsx',
            './src/pages/LandlordDashboard.tsx',
            './src/components/PropertyForm.tsx'
          ],
          'ui-components': [
            './src/components/ui/button.tsx',
            './src/components/ui/card.tsx',
            './src/components/ui/input.tsx',
            './src/components/ui/label.tsx',
            './src/components/ui/select.tsx',
            './src/components/ui/toast.tsx',
            './src/components/ui/toaster.tsx'
          ]
        }
      }
    }
  }
})
