import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
    site: 'https://vivedomos.cl',
    output: 'hybrid',
    adapter: vercel(),
});