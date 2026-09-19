import type { Categoria } from '../lib/types'

const ESTILOS: Record<Categoria, { color: string; bg: string }> = {
  Renta: { color: 'var(--color-cat-renta)', bg: 'var(--color-cat-renta-bg)' },
  Mercado: { color: 'var(--color-cat-mercado)', bg: 'var(--color-cat-mercado-bg)' },
  Servicios: { color: 'var(--color-cat-servicios)', bg: 'var(--color-cat-servicios-bg)' },
  Salidas: { color: 'var(--color-cat-salidas)', bg: 'var(--color-cat-salidas-bg)' },
  Otros: { color: 'var(--color-cat-otros)', bg: 'var(--color-cat-otros-bg)' },
}

export function CategoryBadge({ categoria }: { categoria: Categoria }) {
  const estilo = ESTILOS[categoria]
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: estilo.bg, color: estilo.color }}
    >
      {categoria}
    </span>
  )
}

export function colorCategoria(categoria: Categoria): string {
  return ESTILOS[categoria].color
}
