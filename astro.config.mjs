import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
    site: 'https://vivedomos.cl',
    output: 'hybrid',
    adapter: vercel(),
    integrations: [sitemap()],
});