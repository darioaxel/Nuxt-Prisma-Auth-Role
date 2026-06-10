import { readFileSync } from 'node:fs'

export default defineEventHandler(async (event) => {
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
})
