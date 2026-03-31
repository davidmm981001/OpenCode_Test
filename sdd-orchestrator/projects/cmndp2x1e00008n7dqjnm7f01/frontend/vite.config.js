var _a;
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
var target = (_a = process.env.VITE_API_PROXY_TARGET) !== null && _a !== void 0 ? _a : 'http://localhost:8080';
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            '/api': {
                target: target,
                changeOrigin: true,
            },
        },
    },
    preview: {
        host: '0.0.0.0',
        port: 4173,
    },
});
