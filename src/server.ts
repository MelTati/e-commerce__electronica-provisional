import {AngularNodeAppEngine,createNodeRequestHandler,isMainModule,writeResponseToNodeResponse} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { createProxyMiddleware } from 'http-proxy-middleware'; 

const API_BASE_URL = process.env['API_BASE_URL'] || 'https://smartpoint-api.onrender.com';

const browserDistFolder = join(import.meta.dirname, '../../browser'); 

const app = express();
app.use(express.json()); 

const angularApp = new AngularNodeAppEngine();

// 1. Manejo Consolidado de APIs
app.use(
  '/api',
  createProxyMiddleware({
    target: API_BASE_URL,
    changeOrigin: true,
  })
);

// 2. Archivos Estáticos (Ahora apuntando a la ruta correcta)
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// 3. Fallback de Angular (Catch-all)
app.get('*', (req, res, next) => {
  angularApp
    .handle(req) 
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});


if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`🚀 Server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);