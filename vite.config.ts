
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // هذا السطر يمنع انهيار التطبيق عند الوصول لـ process.env في المتصفح
    'process.env': {}
  }
});
