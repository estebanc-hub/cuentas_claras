const AVATAR_PALETTE = [
  '#D97757',
  '#5B8A72',
  '#4C8CA8',
  '#C9A3D6',
  '#E8A34C',
  '#8A6FBF',
  '#4C9B8F',
  '#D9647E',
]

export function colorParaNuevoMiembro(indiceExistente: number): string {
  return AVATAR_PALETTE[indiceExistente % AVATAR_PALETTE.length]
}

export function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export function formatoMoneda(valor: number): string {
  return currencyFormatter.format(valor)
}

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatoFecha(fechaISO: string): string {
  const [y, m, d] = fechaISO.split('-').map(Number)
  return dateFormatter.format(new Date(y, m - 1, d))
}

export function fechaHoyISO(): string {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}
