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
  }
  catch (error: unknown) {
    console.error('[file.get] error:', error)
    const err = error as { statusCode?: number, statusMessage?: string, message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Error leyendo archivo',
    })
  }
})
