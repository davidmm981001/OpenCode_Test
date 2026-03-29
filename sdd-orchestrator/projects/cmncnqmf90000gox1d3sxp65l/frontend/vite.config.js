import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(function (_a) {
    var _b;
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    var apiTarget = (_b = env.VITE_API_TARGET) !== null && _b !== void 0 ? _b : 'http://localhost:8080';
    return {
        plugins: [react()],
        server: {
            host: '0.0.0.0',
            port: 5173,
            proxy: {
                '/api': {
                    target: apiTarget,
                    changeOrigin: true
                }
            }
        },
        test: {
            environment: 'jsdom',
            setupFiles: ['./src/setupTests.ts']
        }
    };
});
