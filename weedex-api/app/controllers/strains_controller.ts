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
  strain_review: number | null
  image_path?: string
  thumbnail_path?: string
}

export default class StrainsController {
  /**
   * Récupérer la liste de toutes les variétés
   */
  async index({ response }: HttpContext) {
    const strains = await Strain.all()
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
        'seedToHarvest',
        'type',
        'thcPercentage',
        'averageYield',
        'strainReview'
      ]) as any;

      // Convertir les chaînes en nombres et renommer les champs
      const processedData: StrainData = {
        name: data.name,
        brand: data.brand,
        description: data.description,
        type: data.type,
        seed_to_harvest: Number(data.seedToHarvest),
        thc_percentage: Number(data.thcPercentage),
        average_yield: Number(data.averageYield),
        strain_review: data.strainReview ? Number(data.strainReview) : null
      };

      console.log('Données traitées:', processedData);

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

      // Sauvegarder l'image
      await image.move(strainsPath, { name: fileName })
      
      // Ajouter le chemin de l'image
      processedData.image_path = `/uploads/strains/${fileName}`

      console.log('Données finales avant création:', processedData);
      const strain = await Strain.create(processedData)
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
        'name',
        'brand',
        'description',
        'seedToHarvest',
        'type',
        'thcPercentage',
        'averageYield',
        'strainReview'
      ]) as any;

      const processedData: StrainData = {
        name: data.name,
        brand: data.brand,
        description: data.description,
        type: data.type,
        seed_to_harvest: Number(data.seedToHarvest),
        thc_percentage: Number(data.thcPercentage),
        average_yield: Number(data.averageYield),
        strain_review: data.strainReview ? Number(data.strainReview) : null
      };

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

        processedData.image_path = `/uploads/strains/${fileName}`
      }

      strain.merge(processedData)
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