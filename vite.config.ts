import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/counselling/', // 레포 이름
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
