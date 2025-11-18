import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(express.json()); // <- necesario para recibir JSON

const angularApp = new AngularNodeAppEngine();

/* -------------------------------------------
   ✅ AQUI DEFINIMOS TU API /api/clientes
-------------------------------------------- */
app.post('/api/clientes', (req, res) => {
  console.log('📥 Datos recibidos:', req.body);

  // RESPUESTA DE PRUEBA
  res.status(200).json({
    message: 'Cliente recibido correctamente',
    data: req.body
  });
});

/* -------------------------------------------
   Servir archivos estáticos
-------------------------------------------- */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/* -------------------------------------------
   SSR de Angular (solo si no coincide con /api)
-------------------------------------------- */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/* -------------------------------------------
   Iniciar servidor
-------------------------------------------- */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`🚀 Server listening on http://localhost:${port}`);
  });
}

/* -------------------------------------------
   Handler para Angular CLI (dev-server)
-------------------------------------------- */
export const reqHandler = createNodeRequestHandler(app);
