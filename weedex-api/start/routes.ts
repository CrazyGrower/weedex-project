import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import router from '@adonisjs/core/services/router'

const StrainsController = () => import('#controllers/strains_controller')
const GrowLogsController = () => import('#controllers/grow_logs_controller')
const SavesController = () => import('#controllers/saves_controller')

// Get the correct directory path
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Route de base
router.get('/', async () => {
  return { hello: 'Weedex API is running' }
})

// Routes API
router.group(() => {
  // Routes pour les variétés
  router.get('/strains/:id', [StrainsController, 'show'])
  router.get('/strains', [StrainsController, 'index'])
  router.post('/strains', [StrainsController, 'store'])
  router.put('/strains/:id', [StrainsController, 'update'])
  router.delete('/strains/:id', [StrainsController, 'destroy'])

  // Routes pour les logs de culture
  router.get('/strains/:strain_id/grow_logs', [GrowLogsController, 'indexByStrain'])
  router.get('/grow_logs/:id', [GrowLogsController, 'show'])
  router.post('/grow_logs', [GrowLogsController, 'store'])
  router.put('/grow_logs/:id', [GrowLogsController, 'update'])
  router.delete('/grow_logs/:id', [GrowLogsController, 'destroy'])
  
  // Routes pour les sauvegardes
  router.post('/save', [SavesController, 'store'])
  router.post('/load', [SavesController, 'load'])

  // Simplified file serving route
  router.get('/uploads/:file', async ({ params, response, request }) => {
    console.log('File upload request received:', {
      params,
      headers: response.getHeaders(),
      url: request.url()
    });

    const file = params.file;
    console.log('Requested file:', file);

    // Le fichier doit être au format type-nomfichier
    const [type, ...filenameParts] = file.split('-');
    const filename = filenameParts.join('-');

    console.log('Parsed file info:', {
      type,
      filename
    });

    let filePath = '';
    try {
      if (type === 'strains') {
        filePath = join(__dirname, '..', 'public', 'uploads', 'strains', filename);
      } else if (type === 'growlogs') {
        filePath = join(__dirname, '..', 'public', 'uploads', 'grow_logs', filename);
      } else {
        return response.status(400).send({ error: 'Invalid file type' });
      }

      console.log('Attempting to serve file from path:', filePath);

      response.header('Access-Control-Allow-Origin', 'https://frontend.weedex-project.orb.local');
      return response.download(filePath);
    } catch (error) {
      console.error('Error serving file:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        filePath
      });
      return response.status(404).send({ error: 'File not found' });
    }
  });

  // Specific route for strain thumbnails
  router.get('/uploads/thumbnails/:file', async ({ params, response }) => {
    try {
      const thumbPath = join(__dirname, '..', 'public', 'uploads', 'strains', 'thumb_' + params.file)
      return response.download(thumbPath)
    } catch (error) {
      return response.status(404).send({ error: 'Thumbnail not found' })
    }
  })
}).prefix('/api')