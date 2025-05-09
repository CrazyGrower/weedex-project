import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import GrowLogsController from './grow_logs_controller.js'
import StrainsController from './strains_controller.js'
import AdmZip from 'adm-zip'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { promises as fs } from 'fs'
import GrowLog from '#models/grow_log'
import Strain from '#models/strain'
import { tmpdir } from 'os'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

@inject()
export default class SavesController {
  constructor(
    protected growLogsController: GrowLogsController,
    protected strainsController: StrainsController
  ) {}

  async store({ response }: HttpContext) {
    try {
      // Récupérer toutes les données
      const strains = await Strain.all()
      const growLogs = await GrowLog.all()

      // Créer l'objet de sauvegarde
      const saveData = {
        strains,
        growLogs,
        timestamp: new Date().toISOString()
      }

      // Créer une nouvelle archive ZIP
      const zip = new AdmZip()

      // Ajouter les données JSON
      zip.addFile('data.json', Buffer.from(JSON.stringify(saveData, null, 2)))

      try {
        // Ajouter les images des strains
        const strainsPath = join(__dirname, '..', '..', 'public', 'uploads', 'strains')
        const strainsFiles = await fs.readdir(strainsPath)
        for (const file of strainsFiles) {
          if (file.startsWith('thumb_')) continue // Ignorer les miniatures
          const filePath = join(strainsPath, file)
          const fileContent = await fs.readFile(filePath)
          zip.addFile(`strains/${file}`, fileContent)
        }
      } catch (error) {
        console.warn('Aucune image de strain trouvée:', error)
      }

      try {
        // Ajouter les images des grow logs
        const growLogsPath = join(__dirname, '..', '..', 'public', 'uploads', 'grow_logs')
        const growLogsFiles = await fs.readdir(growLogsPath)
        for (const file of growLogsFiles) {
          const filePath = join(growLogsPath, file)
          const fileContent = await fs.readFile(filePath)
          zip.addFile(`grow_logs/${file}`, fileContent)
        }
      } catch (error) {
        console.warn('Aucune image de grow log trouvée:', error)
      }

      // Générer le buffer ZIP
      const zipBuffer = zip.toBuffer()

      // Envoyer le fichier ZIP
      response.header('Content-Type', 'application/zip')
      response.header('Content-Disposition', `attachment; filename=weedex-backup-${new Date().toISOString()}.zip`)
      return response.send(zipBuffer)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      return response.status(500).json({ error: 'Erreur lors de la sauvegarde' })
    }
  }

  async load({ request, response }: HttpContext) {
    try {
      // Récupérer le fichier ZIP depuis la requête
      const backupFile = request.file('backup')
      
      if (!backupFile) {
        return response.status(400).json({ error: 'Aucun fichier de sauvegarde fourni' })
      }
      
      // Vérifier que c'est bien un fichier ZIP
      if (backupFile.extname !== 'zip') {
        return response.status(400).json({ error: 'Le fichier doit être au format ZIP' })
      }
      
      // Créer un dossier temporaire pour extraire les fichiers
      const tempDir = join(tmpdir(), `weedex-restore-${Date.now()}`)
      await fs.mkdir(tempDir, { recursive: true })
      
      try {
        // Déplacer le fichier ZIP vers le dossier temporaire avec validation
        await backupFile.move(tempDir, {
          name: 'backup.zip',
          overwrite: true
        })
      } catch (moveError) {
        console.error('Erreur lors du déplacement du fichier:', moveError)
        return response.status(500).json({ 
          error: 'Erreur lors du traitement du fichier',
          details: moveError instanceof Error ? moveError.message : 'Erreur inconnue'
        })
      }
      
      // Ouvrir et extraire le ZIP
      const zip = new AdmZip(join(tempDir, 'backup.zip'))
      zip.extractAllTo(tempDir, true)
      
      // Lire le fichier de données JSON
      const dataPath = join(tempDir, 'data.json')
      const dataContent = await fs.readFile(dataPath, 'utf-8')
      const saveData = JSON.parse(dataContent)
      
      // Restaurer les données
      await this.restoreData(saveData, tempDir)
      
      // Nettoyer le dossier temporaire
      await fs.rm(tempDir, { recursive: true, force: true })
      
      return response.status(200).json({ 
        success: true, 
        message: 'Sauvegarde restaurée avec succès',
        stats: {
          strains: saveData.strains.length,
          growLogs: saveData.growLogs.length
        }
      })
    } catch (error) {
      console.error('Erreur lors du chargement de la sauvegarde:', error)
      return response.status(500).json({ 
        error: 'Erreur lors du chargement de la sauvegarde',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      })
    }
  }
  
  // Méthode privée pour restaurer les données
  private async restoreData(saveData: any, tempDir: string) {
    // Supprimer les données existantes avec CASCADE
    await db.raw('TRUNCATE TABLE grow_logs, strains CASCADE')
    
    // Restaurer les strains d'abord (car les grow logs y font référence)
    for (const strainData of saveData.strains) {
      // Créer un nouvel objet Strain avec les données de la sauvegarde
      const strain = new Strain()
      
      // Mapper les champs du modèle
      strain.name = strainData.name
      strain.brand = strainData.brand
      strain.image_path = strainData.imagePath
      strain.description = strainData.description
      strain.seed_to_harvest = strainData.seedToHarvest
      strain.type = strainData.type
      strain.thc_percentage = strainData.thcPercentage
      strain.average_yield = strainData.averageYield
      strain.strain_review = strainData.strainReview
      
      // Si on a une image pour ce strain, la copier
      if (strain.image_path) {
        const imageName = strain.image_path.split('/').pop() // Récupérer juste le nom du fichier
        if (imageName) {
          const sourceImagePath = join(tempDir, 'strains', imageName)
          const targetPath = join(__dirname, '..', '..', 'public', 'uploads', 'strains')
          
          // Créer le dossier s'il n'existe pas
          await fs.mkdir(targetPath, { recursive: true })
          
          // Copier l'image
          try {
            const imageContent = await fs.readFile(sourceImagePath)
            await fs.writeFile(join(targetPath, imageName), imageContent)
            
            // Vérifier s'il y a une miniature et la copier également
            const thumbName = `thumb_${imageName}`
            const thumbSourcePath = join(tempDir, 'strains', thumbName)
            try {
              const thumbContent = await fs.readFile(thumbSourcePath)
              await fs.writeFile(join(targetPath, thumbName), thumbContent)
            } catch (thumbError) {
              console.warn(`Miniature de strain non trouvée: ${thumbName}`, thumbError)
            }
          } catch (error) {
            console.warn(`Image de strain non trouvée: ${imageName}`, error)
          }
        }
      }
      
      // Sauvegarder le strain
      await strain.save()
    }
    
    // Restaurer les grow logs
    for (const logData of saveData.growLogs) {
      // Créer un nouvel objet GrowLog avec les données de la sauvegarde
      const growLog = new GrowLog()
      
      // Mapper les champs du modèle
      growLog.strain_id = logData.strain_id
      growLog.name = logData.name
      growLog.start_date = logData.start_date ? DateTime.fromISO(logData.start_date) : null
      growLog.end_date = logData.end_date ? DateTime.fromISO(logData.end_date) : null
      growLog.harvest_amount = logData.harvest_amount
      growLog.review_rating = logData.review_rating
      growLog.notes = logData.notes
      growLog.pdf_path = logData.pdf_path
      growLog.growlog_url = logData.growlog_url
      
      // Si on a un PDF pour ce grow log, le copier
      if (growLog.pdf_path) {
        const pdfName = growLog.pdf_path.split('/').pop() // Récupérer juste le nom du fichier
        if (pdfName) {
          const sourcePdfPath = join(tempDir, 'grow_logs', pdfName)
          const targetPath = join(__dirname, '..', '..', 'public', 'uploads', 'grow_logs')
          
          // Créer le dossier s'il n'existe pas
          await fs.mkdir(targetPath, { recursive: true })
          
          // Copier le PDF
          try {
            const pdfContent = await fs.readFile(sourcePdfPath)
            await fs.writeFile(join(targetPath, pdfName), pdfContent)
          } catch (error) {
            console.warn(`PDF de grow log non trouvé: ${pdfName}`, error)
          }
        }
      }
      
      // Sauvegarder le grow log
      await growLog.save()
    }
  }
} 