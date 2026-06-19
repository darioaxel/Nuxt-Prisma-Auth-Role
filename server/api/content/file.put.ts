import { writeFileSync } from 'node:fs'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { path, content } = body as { path?: string; content?: string }

    if (!path || content === undefined) {
      throw createError({ statusCode: 400, statusMessage: 'Path y content requeridos' })
    }

    const filePath = resolveContentPath(path)
    if (!filePath) {
      throw createError({ statusCode: 404, statusMessage: 'Archivo no encontrado' })
    }

    writeFileSync(filePath, content, 'utf-8')
    return { success: true, path: filePath }
  } catch (error: any) {
    console.error('[file.put] error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Error guardando archivo',
    })
  }
})
