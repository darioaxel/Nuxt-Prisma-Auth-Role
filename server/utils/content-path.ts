import { readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Resuelve la ruta real del filesystem a partir de un path de URL.
 * Busca cada segmento de forma case-insensitive dentro de content/.
 * Soporta directorios con index.md y archivos .md directos.
 */
export function resolveContentPath(urlPath: string): string | null {
  const contentDir = join(process.cwd(), 'content')
  const segments = urlPath.split('/').filter(Boolean)
  let currentPath = contentDir

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    if (!segment) return null
    if (!existsSync(currentPath)) return null

    const entries = readdirSync(currentPath)
    const isLast = i === segments.length - 1

    // Primero intentar match exacto (directorio)
    let match = entries.find(e => e.toLowerCase() === segment.toLowerCase())

    // Si es el último segmento y no hay match exacto, intentar con .md
    if (!match && isLast) {
      match = entries.find(e => e.toLowerCase() === (segment + '.md').toLowerCase())
    }

    if (!match) return null
    currentPath = join(currentPath, match)
  }

  // Si es un directorio, buscar index.md
  if (existsSync(join(currentPath, 'index.md'))) {
    return join(currentPath, 'index.md')
  }

  // Si es un archivo .md directo
  if (existsSync(currentPath)) {
    return currentPath
  }

  return null
}
