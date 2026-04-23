import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import contactHandler from './api/contact';
import crypto from 'crypto';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // SECURITY: CSRF secret - use env variable or generate random one for dev
  // In production, always use environment variable for security
  const CSRF_SECRET = env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');

  // Warn if no CSRF_SECRET is set in production
  if (mode === 'production' && !env.CSRF_SECRET) {
    console.warn('⚠️  WARNING: CSRF_SECRET environment variable not set in production mode!');
    console.warn('   Using generated secret. Set CSRF_SECRET for proper security.');
  }

  // Content Security Policy with secure but functional defaults
  const CSP_DIRECTIVES = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
    'img-src': ["'self'", 'data:', 'blob:', 'https:', 'https://images.unsplash.com', 'https://*.unsplash.com'],
    'connect-src': ["'self'", 'https://*.googleapis.com', 'https://*.unsplash.com'],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  };

  const cspString = Object.entries(CSP_DIRECTIVES)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');

  return {
    plugins: [
      react({
        babel: {
          plugins: [],
        },
      }),
      tailwindcss(),
      {
        name: 'security-headers',
        configureServer(server) {
          // Security headers middleware
          server.middlewares.use((req, res, next) => {
            // Content Security Policy
            res.setHeader('Content-Security-Policy', cspString);
            // Security headers
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
            // Note: COEP/COOP disabled for development to allow external resources
            next();
          });

          // API endpoint - wrap Node.js response to match Express API
          server.middlewares.use('/api/contact', async (req, res, next) => {
            // Set CORS headers with strict origin validation
            const origin = req.headers.origin || '';
            const allowedOrigins = [
              'https://aaaontimeelectric.com',
              'https://www.aaaontimeelectric.com',
              ...(mode === 'development' ? ['http://localhost:3000', 'http://localhost:5173'] : [])
            ];

            const isAllowedOrigin = allowedOrigins.includes(origin);
            res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : allowedOrigins[0]);
            res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token, X-Session-Id');
            res.setHeader('Access-Control-Allow-Credentials', 'true');

            if (req.method === 'OPTIONS') {
              res.statusCode = 200;
              res.end();
              return;
            }

            // Create Express-like wrapper for response
            const expressRes = {
              ...res,
              status: (code: number) => {
                res.statusCode = code;
                return expressRes;
              },
              json: (data: any) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              },
              setHeader: (name: string, value: string) => res.setHeader(name, value),
            };

            // Inject CSRF secret into handler
            (req as any).csrfSecret = CSRF_SECRET;

            // Parse body for POST requests
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  (req as any).body = JSON.parse(body || '{}');
                  await contactHandler(req as any, expressRes as any);
                } catch (e) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
              });
            } else {
              await contactHandler(req as any, expressRes as any);
            }
          });
        },
      },
    ],
    define: {
      // SECURITY: Never expose API keys to client-side
      __APP_ENV__: JSON.stringify(mode),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@utils': path.resolve(__dirname, './src/utils'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssMinify: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('framer-motion')) {
                return 'vendor-motion';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('@google')) {
                return 'vendor-ai';
              }
              if (id.includes('react-dom') || id.includes('react/')) {
                return 'vendor-react';
              }
              if (id.includes('jspdf') || id.includes('html2canvas')) {
                return 'vendor-pdf';
              }
              if (id.includes('dompurify')) {
                return 'vendor-sanitize';
              }
            }
          },
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name ?? '';
            if (/\.css$/.test(info)) {
              return 'assets/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
      sourcemap: mode === 'development',
      reportCompressedSize: false,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'framer-motion',
        'lucide-react',
      ],
      exclude: [
        // Don't pre-bundle these, lazy load instead
        'jspdf',
        '@google/genai',
      ],
      esbuildOptions: {
        target: 'es2020',
      },
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  };
});
