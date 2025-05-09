import { defineConfig } from '@adonisjs/core/bodyparser'

export default defineConfig({
  /**
   * The bodyparser middleware will parse the request body
   * for the following HTTP methods.
   */
  allowedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],

  allowedFormats: ['json', 'multipart-form'],

  /**
   * Config for the "application/x-www-form-urlencoded"
   * content-type parser
   */
  form: {
    encoding: 'utf-8',
    limit: '1mb',
    queryString: {},
    types: ['application/x-www-form-urlencoded'],
  },

  /**
   * Config for the JSON parser
   */
  json: {
    encoding: 'utf-8',
    limit: '10mb',
    strict: true,
    types: [
      'application/json',
      'application/json-patch+json',
      'application/vnd.api+json',
      'application/csp-report',
    ],
  },

  /**
   * Config for the "multipart/form-data" content-type parser.
   * File uploads are handled by the multipart parser.
   */
  multipart: {
    /**
     * Enabling auto process allows bodyparser middleware to
     * move all uploaded files inside the tmp folder of your
     * operating system
     */
    autoProcess: true,
    processManually: [],
    encoding: 'utf-8',
    convertEmptyStringsToNull: true,
    maxFields: 10,
    limit: '50mb',
    types: ['multipart/form-data'],
    tmpFileName: () => `tmp-${Date.now()}-${Math.random().toString(36).substring(2)}`
  },

  /**
   * Config for the raw parser
   */
  raw: {
    encoding: 'utf-8',
    limit: '1mb',
    queryString: {},
    types: ['text/*'],
  },
})
