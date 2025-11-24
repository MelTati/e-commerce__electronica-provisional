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
app.use(express.json()); 

const angularApp = new AngularNodeAppEngine();

app.post('/api/clientes', (req, res) => {
  console.log('📥 Datos recibidos:', req.body);

  res.status(200).json({
    message: 'Cliente recibido correctamente',
    data: req.body
  });
});

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
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
