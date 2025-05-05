import { HttpContext } from '@adonisjs/core/http'
import GrowLog from '#models/grow_log'
import Strain from '#models/strain'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
    const data = request.only([
      'strainId',
      'name',
      'startDate',
      'endDate',
      'harvestAmount',
      'reviewRating',
      'notes',
      'growlogUrl'
    ])

    // Convertir les noms de champs de camelCase vers snake_case
    const convertedData = {
      strain_id: data.strainId,
      name: data.name,
      start_date: data.startDate,
      end_date: data.endDate,
      harvest_amount: data.harvestAmount,
      review_rating: data.reviewRating,
      notes: data.notes,
      growlog_url: data.growlogUrl
    }

    try {
      // Vérifier si la variété existe
      await Strain.findOrFail(convertedData.strain_id)
      
      // Gérer le fichier PDF
      const pdfFile = request.file('pdfPath')
      if (pdfFile) {
        const fileName = `${Date.now()}_${pdfFile.clientName}`
        await pdfFile.move(join(__dirname, '..', '..', 'public', 'uploads', 'grow_logs'), {
          name: fileName
        })
        convertedData.pdf_path = `/uploads/grow_logs/${fileName}`
      }
      
      const growLog = await GrowLog.create(convertedData)
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
        'strain_id',
        'name',
        'start_date',
        'end_date',
        'harvest_amount',
        'review_rating',
        'notes',
        'pdf_path'
      ])

      growLog.merge(data)
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