import { readFileSync } from 'node:fs'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const path = String(query.path || '')

    if (!path) {
      throw createError({ statusCode: 400, statusMessage: 'Path requerido' })
    }

    const filePath = resolveContentPath(path)
    if (!filePath) {
      throw createError({ statusCode: 404, statusMessage: 'Archivo no encontrado' })
    }

    const content = readFileSync(filePath, 'utf-8')
    return { content, path: filePath }
  } catch (error: any) {
    console.error('[file.get] error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Error leyendo archivo',
    })
  }
})
