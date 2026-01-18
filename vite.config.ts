import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/',
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@apps': resolve(__dirname, 'src/apps'),
            '@shared': resolve(__dirname, 'src/shared'),
        },
    },
})
