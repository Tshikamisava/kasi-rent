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
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.svg'],
  build: {
    chunkSizeWarningLimit: 1000,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            if (id.includes('zustand')) {
              return 'state-vendor';
            }
            if (id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils-vendor';
            }
            // Other vendor packages
            return 'vendor';
          }
          
          // Feature-based chunks
          if (id.includes('/pages/SignIn') || id.includes('/pages/GetStarted') || 
              id.includes('/hooks/use-auth') || id.includes('/lib/auth')) {
            return 'auth-components';
          }
          
          if (id.includes('/pages/TenantDashboard') || id.includes('/pages/LandlordDashboard') || 
              id.includes('/components/PropertyForm')) {
            return 'dashboard-components';
          }
          
          if (id.includes('/components/ui/')) {
            return 'ui-components';
          }
        }
      }
    }
  }
})
