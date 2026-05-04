import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig({
    plugins: [
        TanStackRouterVite({
            routesDirectory: './resources/routes',
            generatedRouteTree: './resources/routeTree.gen.ts',
        }),
        laravel({
            input: [
                'resources/css/app.css',
                'resources/tsx/main.tsx',
            ],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],

    resolve: {
        alias: {
            '@': '/resources',
        },
    },

    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false,
            },
        },
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});