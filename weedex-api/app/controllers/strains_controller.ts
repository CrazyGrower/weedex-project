import { HttpContext } from '@adonisjs/core/http'
import Strain from '#models/strain'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import sharp from 'sharp'  // Vous devrez installer cette dépendance: npm install sharp


interface StrainData {
  name: string
  brand: string
  description: string
  seed_to_harvest: number
  type: string
  thc_percentage: number
  average_yield: number
  number?: string
  image_path?: string
  thumbnail_path?: string
}

export default class StrainsController {
  /**
   * Récupérer la liste de toutes les variétés
   */
  async index({ response }: HttpContext) {
    const strains = await Strain.all()
    // Trie côté backend par numéro numérique croissant
    strains.sort((a, b) => {
      const na = parseInt(String(a.number).replace(/[^0-9]/g, ''), 10) || 0;
      const nb = parseInt(String(b.number).replace(/[^0-9]/g, ''), 10) || 0;
      return na - nb;
    });
    return response.json({ strains })
  }

  /**
   * Récupérer une variété spécifique avec ses logs de culture
   */
  async show({ params, response }: HttpContext) {
    try {
      const strain = await Strain.query()
        .where('id', Number(params.id))
        .preload('growLogs')
        .firstOrFail()
      
      return response.json({ strain })
    } catch (error) {
      console.log('Erreur:', error.message)
      return response.status(404).json({ message: 'Strain not found' })
    }
  }

  /**
   * Créer une nouvelle variété
   */
  async store({ request, response }: HttpContext) {
    try {
      console.log('Données reçues:', request.all());
      console.log('Fichier image:', request.file('image'));

      const data = request.only([
        'name',
        'brand',
        'description',
        'seed_to_harvest',
        'type',
        'thc_percentage',
        'average_yield',
      ]) as StrainData;

      // Convertir les chaînes en nombres
      data.seed_to_harvest = Number(data.seed_to_harvest);
      data.thc_percentage = Number(data.thc_percentage);
      data.average_yield = Number(data.average_yield);

      console.log('Données traitées:', data);

      // Gérer l'upload de l'image
      const image = request.file('image')
      if (!image) {
        console.log('Aucune image fournie');
        return response.status(400).json({ message: 'Image is required' })
      }

      // Valider le type de fichier
      if (!image.isValid) {
        console.log('Image invalide:', image.errors);
        return response.status(400).json({ message: 'Invalid image file' })
      }

      // Créer les dossiers s'ils n'existent pas
      const uploadsPath = join(app.publicPath(), 'uploads')
      const strainsPath = join(uploadsPath, 'strains')
      
      if (!existsSync(uploadsPath)) {
        await mkdir(uploadsPath, { recursive: true })
      }
      if (!existsSync(strainsPath)) {
        await mkdir(strainsPath, { recursive: true })
      }

      // Générer un nom unique pour l'image
      const fileName = `${cuid()}.${image.extname}`
      const imagePath = join(strainsPath, fileName)
      const thumbnailFileName = `thumb_${fileName}`
      const thumbnailPath = join(strainsPath, thumbnailFileName)

      // Sauvegarder l'image
      await image.move(strainsPath, { name: fileName })
      
      // Générer la miniature avec Sharp
      try {
        await sharp(imagePath)
          .resize(100, 100, { fit: 'cover' })  // Taille de la miniature (100x100px)
          .toFile(thumbnailPath)
        
        console.log('Miniature générée avec succès:', thumbnailPath)
      } catch (thumbError) {
        console.error('Erreur lors de la génération de la miniature:', thumbError)
        // Continuer même en cas d'erreur de génération de la miniature
      }

      // Trouver le plus grand numéro existant
      const maxNumberStrain = await Strain.query()
        .orderBy('id', 'desc')
        .first()
      
      const nextId = maxNumberStrain ? maxNumberStrain.id + 1 : 1
      data.number = `#${String(nextId).padStart(3, '0')}` // Format : #001, #002, etc.
      
      // Ajouter les chemins des images
      data.image_path = `/uploads/strains/${fileName}`
      data.thumbnail_path = `/uploads/strains/thumb_${fileName}`

      console.log('Données finales avant création:', data);
      const strain = await Strain.create(data)
      return response.status(201).json({ strain })
    } catch (error) {
      console.error('Erreur détaillée lors de la création:', error)
      return response.status(500).json({ 
        message: 'Error creating strain',
        error: error.message 
      })
    }
  }

  /**
   * Mettre à jour une variété existante
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const strain = await Strain.findOrFail(params.id)
      
      const data = request.only([
        'number',
        'name',
        'brand',
        'description',
        'seed_to_harvest',
        'type',
        'thc_percentage',
        'average_yield',
      ]) as StrainData

      // Gérer l'upload de la nouvelle image si fournie
      const image = request.file('image')
      if (image && image.isValid) {
        const uploadsPath = join(app.publicPath(), 'uploads')
        const strainsPath = join(uploadsPath, 'strains')
        
        if (!existsSync(strainsPath)) {
          await mkdir(strainsPath, { recursive: true })
        }

        const fileName = `${cuid()}.${image.extname}`
        const imagePath = join(strainsPath, fileName)

        await image.move(strainsPath, { name: fileName })

        // Supprimer l'ancienne image
        if (strain.image_path) {
          const oldImagePath = join(app.publicPath(), strain.image_path)
          if (existsSync(oldImagePath)) {
            await writeFile(oldImagePath, '')
          }
        }

        data.image_path = `/uploads/strains/${fileName}`
        data.thumbnail_path = `/uploads/strains/thumb_${fileName}`
      }

      strain.merge(data)
      await strain.save()

      return response.json({ strain })
    } catch (error) {
      return response.status(404).json({ message: 'Strain not found' })
    }
  }

  /**
   * Supprimer une variété
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const strain = await Strain.findOrFail(params.id)
      
      // Supprimer les images associées
      if (strain.image_path) {
        const imagePath = join(app.publicPath(), strain.image_path)
        if (existsSync(imagePath)) {
          await writeFile(imagePath, '')
        }
      }
      
      await strain.delete()
      
      return response.json({ message: 'Strain successfully deleted', deleted: true })
    } catch (error) {
      return response.status(404).json({ message: 'Strain not found' })
    }
  }
}