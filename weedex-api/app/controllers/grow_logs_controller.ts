import { HttpContext } from '@adonisjs/core/http'
import GrowLog from '#models/grow_log'
import Strain from '#models/strain'
import { DateTime } from 'luxon'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface GrowLogData {
  strain_id: number
  name: string
  start_date: DateTime
  end_date: DateTime | null
  harvest_amount: number
  review_rating: number | null
  notes: string | null
  growlog_url: string | null
  pdf_path?: string
}

export default class GrowLogsController {
  /**
   * Récupérer les logs de culture pour une variété spécifique
   */
  async indexByStrain({ params, response }: HttpContext) {
    try {
      // Vérifier si la variété existe
      await Strain.findOrFail(params.strain_id)
      
      const growLogs = await GrowLog.query()
        .where('strain_id', params.strain_id)
        .orderBy('start_date', 'desc')
      
      return response.json({ grow_logs: growLogs })
    } catch (error) {
      return response.status(404).json({ message: 'Strain not found' })
    }
  }

  /**
   * Récupérer un log de culture spécifique
   */
  async show({ params, response }: HttpContext) {
    try {
      const growLog = await GrowLog.query()
        .where('id', params.id)
        .preload('strain')
        .firstOrFail()
      
      return response.json({ grow_log: growLog })
    } catch (error) {
      return response.status(404).json({ message: 'Grow log not found' })
    }
  }

  /**
   * Créer un nouveau log de culture
   */
  async store({ request, response }: HttpContext) {
    try {
      const data = request.only([
        'strainId',
        'name',
        'startDate',
        'endDate',
        'harvestAmount',
        'reviewRating',
        'notes',
        'growlogUrl'
      ]) as any;

      const processedData: GrowLogData = {
        strain_id: Number(data.strainId),
        name: data.name,
        start_date: DateTime.fromISO(data.startDate),
        end_date: data.endDate ? DateTime.fromISO(data.endDate) : null,
        harvest_amount: Number(data.harvestAmount),
        review_rating: data.reviewRating ? Number(data.reviewRating) : null,
        notes: data.notes || null,
        growlog_url: data.growlogUrl || null
      };

      // Vérifier si la variété existe
      await Strain.findOrFail(processedData.strain_id)
      
      // Gérer le fichier PDF
      const pdfFile = request.file('pdfPath')
      if (pdfFile) {
        const fileName = `${Date.now()}_${pdfFile.clientName}`
        await pdfFile.move(join(__dirname, '..', '..', 'public', 'uploads', 'grow_logs'), {
          name: fileName
        })
        processedData.pdf_path = `/uploads/grow_logs/${fileName}`
      }
      
      const growLog = await GrowLog.create(processedData)
      return response.status(201).json({ grow_log: growLog })
    } catch (error) {
      console.error('Error creating grow log:', error)
      return response.status(500).json({ message: 'Error creating grow log', error: error.message })
    }
  }

  /**
   * Mettre à jour un log de culture existant
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const growLog = await GrowLog.findOrFail(params.id)
      
      const data = request.only([
        'strainId',
        'name',
        'startDate',
        'endDate',
        'harvestAmount',
        'reviewRating',
        'notes',
        'growlogUrl'
      ]) as any;

      const processedData: GrowLogData = {
        strain_id: Number(data.strainId),
        name: data.name,
        start_date: DateTime.fromISO(data.startDate),
        end_date: data.endDate ? DateTime.fromISO(data.endDate) : null,
        harvest_amount: Number(data.harvestAmount),
        review_rating: data.reviewRating ? Number(data.reviewRating) : null,
        notes: data.notes || null,
        growlog_url: data.growlogUrl || null
      };

      growLog.merge(processedData)
      await growLog.save()

      return response.json({ grow_log: growLog })
    } catch (error) {
      return response.status(404).json({ message: 'Grow log not found' })
    }
  }

  /**
   * Supprimer un log de culture
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const growLog = await GrowLog.findOrFail(params.id)
      await growLog.delete()
      
      return response.json({ message: 'Grow log successfully deleted', deleted: true })
    } catch (error) {
      return response.status(404).json({ message: 'Grow log not found' })
    }
  }
}